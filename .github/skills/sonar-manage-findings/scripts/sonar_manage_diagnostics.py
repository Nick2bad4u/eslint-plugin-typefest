from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sonar_manage_api import (
    ProjectContext,
    RequestSpec,
    SonarCliError,
    api_request,
    parse_properties,
)

TS_CONFIG_SETTING_KEY = "sonar.typescript.tsconfigPaths"
DEFAULT_PROJECT_ANALYSES_PAGE_SIZE = 5


def fetch_ce_component(*, context: ProjectContext, component: str) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/ce/component",
            query={"component": component},
        ),
    )
    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected CE component payload.")
    return payload


def fetch_ce_task(*, context: ProjectContext, task_id: str) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/ce/task",
            query={"id": task_id},
        ),
    )
    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected CE task payload.")
    return payload


def fetch_project_analyses(
    *,
    context: ProjectContext,
    project_key: str,
    page: int,
    page_size: int,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/project_analyses/search",
            query={
                "project": project_key,
                "p": str(max(1, page)),
                "ps": str(max(1, page_size)),
            },
        ),
    )
    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected project analyses payload.")
    return payload


def investigate_tsconfig_warning(*, context: ProjectContext) -> dict[str, Any]:
    settings_payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/settings/values",
            query={
                "component": context.project_key,
                "keys": TS_CONFIG_SETTING_KEY,
            },
        ),
    )
    ce_component = fetch_ce_component(context=context, component=context.project_key)
    analyses = fetch_project_analyses(
        context=context,
        project_key=context.project_key,
        page=1,
        page_size=DEFAULT_PROJECT_ANALYSES_PAGE_SIZE,
    )
    local_scan = scan_local_tsconfigs(context.repo_root)
    local_root_candidates = list_root_tsconfig_candidates(context.repo_root)
    sonar_properties = (
        parse_properties(context.sonar_properties_path)
        if context.sonar_properties_path is not None
        else {}
    )

    ce_task_payload = None
    last_task = (
        ce_component.get("current")
        or ce_component.get("queue")
        or ce_component.get("task")
    )
    if isinstance(last_task, dict):
        task_id = last_task.get("id")
        if isinstance(task_id, str) and task_id:
            try:
                ce_task_payload = fetch_ce_task(context=context, task_id=task_id)
            except SonarCliError:
                ce_task_payload = None

    suggestions = build_tsconfig_warning_suggestions(
        context=context,
        settings_payload=settings_payload if isinstance(settings_payload, dict) else {},
        sonar_properties=sonar_properties,
        local_scan=local_scan,
        local_root_candidates=local_root_candidates,
    )

    return {
        "projectKey": context.project_key,
        "organization": context.organization,
        "sonarPropertyValue": sonar_properties.get(TS_CONFIG_SETTING_KEY),
        "settings": settings_payload,
        "ceComponent": ce_component,
        "ceTask": ce_task_payload,
        "projectAnalyses": analyses,
        "localTsconfigs": local_scan,
        "rootTsconfigCandidates": local_root_candidates,
        "suggestions": suggestions,
        "limitations": [
            "The public SonarCloud API surfaces task metadata, but it does not reliably expose full scanner logs for every analysis.",
            "If the exact missing tsconfig path is not present in CE task metadata, you still need the scanner-side logs from CI or local analysis output.",
        ],
    }


def scan_local_tsconfigs(repo_root: Path) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for file_path in sorted(repo_root.rglob("tsconfig*.json")):
        relative_path = file_path.relative_to(repo_root).as_posix()
        if should_skip_tsconfig_path(relative_path):
            continue

        item: dict[str, Any] = {
            "path": relative_path,
            "exists": True,
        }

        try:
            payload = json.loads(file_path.read_text(encoding="utf8"))
        except Exception as error:  # pragma: no cover - best effort reporting only
            item["parseError"] = str(error)
            results.append(item)
            continue

        extends_values = normalize_extends_values(payload.get("extends"))
        item["extends"] = extends_values
        local_extends: list[str] = []
        missing_local_extends: list[str] = []
        package_extends: list[str] = []
        for extend_value in extends_values:
            if is_local_extends_value(extend_value):
                resolved_path = resolve_local_extends(file_path, extend_value)
                resolved_relative = resolved_path.relative_to(repo_root).as_posix()
                if resolved_path.exists():
                    local_extends.append(resolved_relative)
                else:
                    missing_local_extends.append(resolved_relative)
            else:
                package_extends.append(extend_value)

        if local_extends:
            item["localExtends"] = local_extends
        if missing_local_extends:
            item["missingLocalExtends"] = missing_local_extends
        if package_extends:
            item["packageExtends"] = package_extends

        results.append(item)

    return results


def should_skip_tsconfig_path(relative_path: str) -> bool:
    skip_fragments = (
        "node_modules/",
        "/node_modules/",
        ".docusaurus/",
        "build/",
        "dist/",
        "coverage/",
        ".cache/",
        "temp/",
    )
    return any(fragment in relative_path for fragment in skip_fragments)


def normalize_extends_values(raw_extends: Any) -> list[str]:
    if isinstance(raw_extends, str):
        value = raw_extends.strip()
        return [value] if value else []

    if isinstance(raw_extends, list):
        values: list[str] = []
        for item in raw_extends:
            if isinstance(item, str):
                stripped = item.strip()
                if stripped:
                    values.append(stripped)
        return values

    return []


def is_local_extends_value(value: str) -> bool:
    return value.startswith(".") or value.startswith("..") or value.startswith("/")


def resolve_local_extends(tsconfig_path: Path, extend_value: str) -> Path:
    candidate = (tsconfig_path.parent / extend_value).resolve()
    if candidate.suffix == "":
        return candidate.with_suffix(".json")
    return candidate


def list_root_tsconfig_candidates(repo_root: Path) -> list[str]:
    candidates: list[str] = []
    for name in (
        "tsconfig.json",
        "tsconfig.build.json",
        "tsconfig.eslint.json",
        "tsconfig.js.json",
        "tsconfig.vitest-typecheck.json",
    ):
        candidate = repo_root / name
        if candidate.exists():
            candidates.append(name)
    return candidates


def build_tsconfig_warning_suggestions(
    *,
    context: ProjectContext,
    settings_payload: dict[str, Any],
    sonar_properties: dict[str, str],
    local_scan: list[dict[str, Any]],
    local_root_candidates: list[str],
) -> list[str]:
    suggestions: list[str] = []
    settings_entries = settings_payload.get("settings")
    configured_setting = None
    if isinstance(settings_entries, list):
        for setting in settings_entries:
            if (
                isinstance(setting, dict)
                and setting.get("key") == TS_CONFIG_SETTING_KEY
            ):
                configured_setting = setting.get("value")
                break

    property_value = sonar_properties.get(TS_CONFIG_SETTING_KEY)
    if property_value:
        suggestions.append(
            f"The repo already declares {TS_CONFIG_SETTING_KEY}={property_value}. If warnings persist, the current Sonar analysis is likely stale."
        )
    elif configured_setting:
        suggestions.append(
            f"Project settings currently override {TS_CONFIG_SETTING_KEY}={configured_setting}. Compare that with the repo-local sonar-project.properties value."
        )
    elif local_root_candidates:
        suggestions.append(
            "If Sonar keeps discovering unwanted tsconfig files, consider setting "
            f"{TS_CONFIG_SETTING_KEY} to only the root configs: {', '.join(local_root_candidates)}."
        )

    docs_workspace_entry = next(
        (
            item
            for item in local_scan
            if item.get("path") == "docs/docusaurus/tsconfig.json"
        ),
        None,
    )
    if isinstance(docs_workspace_entry, dict):
        package_extends = docs_workspace_entry.get("packageExtends")
        if (
            isinstance(package_extends, list)
            and "@docusaurus/tsconfig" in package_extends
        ):
            suggestions.append(
                "The docs workspace tsconfig extends @docusaurus/tsconfig, which is not a repo-local file. If Sonar still scans docs, that workspace is the most likely source of the missing-tsconfig warning."
            )

    if context.sonar_properties_path is not None:
        exclusions = sonar_properties.get("sonar.exclusions", "")
        if "**/docs/**" in exclusions:
            suggestions.append(
                "docs/** is already excluded in sonar-project.properties, so docs-related tsconfig warnings should disappear after a fresh analysis."
            )
        if "**/scripts/**" in exclusions and "**/benchmark/**" in exclusions:
            suggestions.append(
                "scripts/** and benchmark/** are already excluded, so remaining warnings are less likely to come from repo tooling on the next analysis."
            )

    if not suggestions:
        suggestions.append(
            "No obvious local tsconfig mismatch was detected. Check the latest scanner logs for the exact missing path and compare it with the local tsconfig graph."
        )

    return suggestions
