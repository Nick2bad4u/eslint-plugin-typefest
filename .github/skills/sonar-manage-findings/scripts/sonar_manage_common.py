from __future__ import annotations

from typing import Any, Iterable

from sonar_manage_api import ProjectContext, RequestSpec, SonarCliError


def normalize_keys(keys: Iterable[str], *, argument_name: str) -> list[str]:
    normalized: list[str] = []
    for key in keys:
        value = key.strip()
        if value:
            normalized.append(value)

    if not normalized:
        raise SonarCliError(f"At least one --{argument_name} value is required.")

    return normalized


def resolve_csv_values(
    raw_values: Iterable[str] | None, *, argument_name: str
) -> list[str]:
    _ = argument_name
    resolved: list[str] = []
    for raw_value in raw_values or []:
        for candidate in raw_value.split(","):
            value = candidate.strip()
            if value:
                resolved.append(value)

    return resolved


def resolve_tag_values(
    raw_values: Iterable[str] | None,
    *,
    clear: bool,
    argument_name: str,
) -> list[str]:
    if clear:
        return []

    resolved = resolve_csv_values(raw_values, argument_name=argument_name)
    if resolved:
        return resolved

    raise SonarCliError(f"Provide at least one --{argument_name} value or use --clear.")


def parse_name_value_pairs(
    raw_pairs: Iterable[str] | None, *, argument_name: str
) -> dict[str, str]:
    pairs: dict[str, str] = {}
    for raw_pair in raw_pairs or []:
        if "=" not in raw_pair:
            raise SonarCliError(
                f"Invalid --{argument_name} value '{raw_pair}'. Expected key=value."
            )

        key, value = raw_pair.split("=", 1)
        normalized_key = key.strip()
        if not normalized_key:
            raise SonarCliError(
                f"Invalid --{argument_name} value '{raw_pair}'. Empty key."
            )

        pairs[normalized_key] = value.strip()

    return pairs


def extract_issue_state(payload: Any, issue_key: str) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise SonarCliError(f"Unexpected issue state payload for {issue_key}.")

    issues = payload.get("issues")
    if not isinstance(issues, list) or not issues:
        raise SonarCliError(f"No issue details were returned for {issue_key}.")

    issue = issues[0]
    if not isinstance(issue, dict):
        raise SonarCliError(f"Unexpected issue detail shape for {issue_key}.")

    return {
        "issue": issue_key,
        "status": issue.get("status"),
        "resolution": issue.get("resolution"),
        "type": issue.get("type"),
        "severity": issue.get("severity"),
        "component": issue.get("component"),
        "line": issue.get("line"),
        "message": issue.get("message"),
        "tags": issue.get("tags"),
    }


def build_dry_run_payload(
    *,
    context: ProjectContext,
    description: str,
    request_spec: RequestSpec,
) -> dict[str, Any]:
    return {
        "projectKey": context.project_key,
        "dryRun": True,
        "result": build_dry_run_result(
            description=description,
            request_spec=request_spec,
        ),
    }


def build_dry_run_result(
    *,
    description: str,
    request_spec: RequestSpec,
) -> dict[str, Any]:
    return {
        "description": description,
        "method": request_spec.method,
        "endpoint": request_spec.endpoint,
        "query": request_spec.query,
        "form": request_spec.form,
        "dryRun": True,
    }
