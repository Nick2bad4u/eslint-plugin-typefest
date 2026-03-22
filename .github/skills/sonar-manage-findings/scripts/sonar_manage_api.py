from __future__ import annotations

import base64
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib import error, parse, request
import os

DEFAULT_BASE_URL = "https://sonarcloud.io"
DEFAULT_ISSUE_STATUSES = "OPEN,CONFIRMED,REOPENED"
DEFAULT_HOTSPOT_STATUS = "TO_REVIEW"
DEFAULT_PAGE_SIZE = 100
DEFAULT_SUMMARY_METRICS = (
    "alert_status,bugs,vulnerabilities,code_smells,coverage,"
    "duplicated_lines_density,ncloc"
)
DEFAULT_TOKEN_ENVS = ("SONAR_TOKEN",)
DEFAULT_AUTH_SCHEME = "auto"


class SonarCliError(RuntimeError):
    """Raised for recoverable CLI errors."""


@dataclass(frozen=True)
class ProjectContext:
    repo_root: Path
    project_key: str
    organization: str | None
    base_url: str
    token: str
    token_env_name: str
    auth_scheme: str
    sonar_properties_path: Path | None


@dataclass(frozen=True)
class RequestSpec:
    method: str
    endpoint: str
    query: dict[str, str] | None = None
    form: dict[str, str] | None = None


def resolve_context(args: Any) -> ProjectContext:
    repo_root = resolve_repo_root(Path(args.repo))
    sonar_properties_path = repo_root / "sonar-project.properties"
    properties = (
        parse_properties(sonar_properties_path)
        if sonar_properties_path.is_file()
        else {}
    )

    project_key = args.project_key or properties.get("sonar.projectKey")
    if not project_key:
        raise SonarCliError(
            "Could not resolve a Sonar project key. Provide --project-key or add "
            "sonar.projectKey to sonar-project.properties."
        )

    base_url = sanitize_base_url(args.base_url or properties.get("sonar.host.url"))
    token, token_env_name = resolve_token(args.token_envs or list(DEFAULT_TOKEN_ENVS))

    return ProjectContext(
        repo_root=repo_root,
        project_key=project_key,
        organization=args.organization or properties.get("sonar.organization"),
        base_url=base_url,
        token=token,
        token_env_name=token_env_name,
        auth_scheme=args.auth_scheme,
        sonar_properties_path=(
            sonar_properties_path if sonar_properties_path.exists() else None
        ),
    )


def resolve_repo_root(start: Path) -> Path:
    candidate = start.resolve()
    if candidate.is_file():
        candidate = candidate.parent

    process = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=candidate,
        text=True,
        capture_output=True,
    )
    if process.returncode == 0:
        resolved = process.stdout.strip()
        if resolved:
            return Path(resolved)

    return candidate


def parse_properties(file_path: Path) -> dict[str, str]:
    properties: dict[str, str] = {}
    for raw_line in file_path.read_text(encoding="utf8").splitlines():
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith("!"):
            continue

        separator_index = next(
            (
                index
                for index, character in enumerate(stripped)
                if character in {"=", ":"}
            ),
            -1,
        )

        if separator_index == -1:
            key = stripped
            value = ""
        else:
            key = stripped[:separator_index]
            value = stripped[separator_index + 1 :]

        properties[key.strip()] = value.strip()

    return properties


def sanitize_base_url(value: str | None) -> str:
    base_url = (value or DEFAULT_BASE_URL).strip()
    if not base_url:
        return DEFAULT_BASE_URL

    return base_url.rstrip("/")


def resolve_token(token_envs: Iterable[str]) -> tuple[str, str]:
    checked_names: list[str] = []
    for raw_name in token_envs:
        name = raw_name.strip()
        if not name:
            continue

        checked_names.append(name)
        token = os.getenv(name)
        if token:
            return token, name

    env_list = ", ".join(checked_names or list(DEFAULT_TOKEN_ENVS))
    raise SonarCliError(
        "No Sonar token was found in the configured environment variables: "
        f"{env_list}."
    )


def drop_none_values(values: dict[str, str | None]) -> dict[str, str]:
    return {key: value for key, value in values.items() if value is not None}


def with_optional_organization(
    *,
    context: ProjectContext,
    values: dict[str, str],
) -> dict[str, str]:
    if context.organization is None or "organization" in values:
        return values

    return {
        **values,
        "organization": context.organization,
    }


def api_request(*, context: ProjectContext, spec: RequestSpec) -> Any:
    auth_schemes = resolve_auth_schemes(context.auth_scheme)
    last_error: SonarCliError | None = None

    for auth_scheme in auth_schemes:
        try:
            return api_request_once(context=context, spec=spec, auth_scheme=auth_scheme)
        except SonarCliError as error_message:
            if auth_scheme == auth_schemes[-1]:
                raise
            last_error = error_message

    if last_error is not None:
        raise last_error

    raise SonarCliError("No authentication scheme could be used.")


def resolve_auth_schemes(auth_scheme: str) -> list[str]:
    if auth_scheme == "auto":
        return ["bearer", "basic"]

    return [auth_scheme]


def api_request_once(
    *,
    context: ProjectContext,
    spec: RequestSpec,
    auth_scheme: str,
) -> Any:
    url = build_url(context.base_url, spec.endpoint, spec.query)
    headers = {
        "Authorization": build_auth_header(context.token, auth_scheme),
        "Accept": "application/json",
    }

    data: bytes | None = None
    if spec.form is not None:
        data = parse.urlencode(spec.form).encode("utf8")
        headers["Content-Type"] = "application/x-www-form-urlencoded"

    request_object = request.Request(
        url=url,
        data=data,
        headers=headers,
        method=spec.method,
    )

    try:
        with request.urlopen(request_object) as response:
            raw_body = response.read()
    except error.HTTPError as http_error:
        detail = read_error_body(http_error)
        raise SonarCliError(
            f"Sonar API {spec.method} {spec.endpoint} failed with HTTP "
            f"{http_error.code}: {detail}"
        ) from http_error
    except error.URLError as url_error:
        raise SonarCliError(
            f"Failed to reach Sonar at {context.base_url}: {url_error.reason}"
        ) from url_error

    if not raw_body:
        return None

    try:
        return json.loads(raw_body.decode("utf8"))
    except json.JSONDecodeError:
        return raw_body.decode("utf8", errors="replace")


def build_url(base_url: str, endpoint: str, query: dict[str, str] | None) -> str:
    if endpoint.startswith("https://") or endpoint.startswith("http://"):
        url = endpoint
    else:
        if not endpoint.startswith("/"):
            raise SonarCliError(f"Endpoint must start with '/': {endpoint}")
        url = f"{base_url}{endpoint}"

    if not query:
        return url

    separator = "&" if "?" in url else "?"
    return f"{url}{separator}{parse.urlencode(query)}"


def build_auth_header(token: str, auth_scheme: str) -> str:
    if auth_scheme == "bearer":
        return f"Bearer {token}"

    encoded = base64.b64encode(f"{token}:".encode("utf8")).decode("ascii")
    return f"Basic {encoded}"


def read_error_body(http_error: error.HTTPError) -> str:
    try:
        raw_body = http_error.read().decode("utf8", errors="replace").strip()
    except Exception:  # pragma: no cover
        raw_body = ""

    if raw_body:
        return raw_body

    return http_error.reason or "no additional error details"
