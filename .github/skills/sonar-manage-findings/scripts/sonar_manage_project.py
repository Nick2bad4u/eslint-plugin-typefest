from __future__ import annotations

from typing import Any

from sonar_manage_api import (
    ProjectContext,
    RequestSpec,
    SonarCliError,
    api_request,
    drop_none_values,
    with_optional_organization,
)
from sonar_manage_common import build_dry_run_payload, resolve_csv_values
from sonar_manage_issues import fetch_hotspots, fetch_issues


def build_summary(args: Any, context: ProjectContext) -> dict[str, Any]:
    issues = fetch_issues(
        context=context,
        issue_statuses=args.issue_statuses,
        page=1,
        page_size=args.page_size,
        extra_query=args.extra_query,
    )
    hotspots = fetch_hotspots(
        context=context,
        hotspot_status=args.hotspot_status,
        page=1,
        page_size=args.page_size,
        include_details=False,
        extra_query=None,
    )
    quality_gate_status = fetch_quality_gate_status(
        context=context,
        project_key=context.project_key,
    )
    quality_gate = fetch_project_quality_gate(
        context=context,
        project_key=context.project_key,
    )
    project_info = fetch_project_component_info(
        context=context,
        component=context.project_key,
    )
    measures = fetch_measures(
        context=context,
        component=context.project_key,
        metrics=resolve_csv_values([args.metrics], argument_name="metric"),
    )

    sample_size = max(1, args.sample_size)
    issue_items = issues.get("issues", []) if isinstance(issues, dict) else []
    hotspot_items = hotspots.get("hotspots", []) if isinstance(hotspots, dict) else []

    return {
        "repoRoot": str(context.repo_root),
        "projectKey": context.project_key,
        "organization": context.organization,
        "baseUrl": context.base_url,
        "tokenEnv": context.token_env_name,
        "authScheme": context.auth_scheme,
        "sonarPropertiesPath": (
            str(context.sonar_properties_path)
            if context.sonar_properties_path is not None
            else None
        ),
        "openIssues": {
            "total": issues.get("total", 0) if isinstance(issues, dict) else 0,
            "sample": issue_items[:sample_size],
        },
        "hotspots": {
            "total": (
                hotspots.get("paging", {}).get("total", 0)
                if isinstance(hotspots, dict)
                else 0
            ),
            "sample": hotspot_items[:sample_size],
        },
        "qualityGateStatus": quality_gate_status,
        "qualityGate": quality_gate,
        "projectInfo": project_info,
        "measures": measures,
    }


def fetch_measures(
    *,
    context: ProjectContext,
    component: str,
    metrics: list[str],
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/measures/component",
            query={
                "component": component,
                "metricKeys": ",".join(metrics),
            },
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected measures payload.")

    return payload


def fetch_measure_history(
    *,
    context: ProjectContext,
    component: str,
    metrics: list[str],
    from_date: str | None,
    to_date: str | None,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/measures/search_history",
            query=drop_none_values(
                {
                    "component": component,
                    "metrics": ",".join(metrics),
                    "from": from_date,
                    "to": to_date,
                }
            ),
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected measure history payload.")

    return payload


def fetch_project_component_info(
    *,
    context: ProjectContext,
    component: str,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/components/show",
            query={"component": component},
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected project component payload.")

    return payload


def fetch_quality_gate_status(
    *,
    context: ProjectContext,
    project_key: str,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/qualitygates/project_status",
            query={"projectKey": project_key},
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected quality gate status payload.")

    return payload


def list_quality_gates(*, context: ProjectContext) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/qualitygates/list",
            query=with_optional_organization(context=context, values={}),
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected quality gates payload.")

    return payload


def fetch_project_quality_gate(
    *,
    context: ProjectContext,
    project_key: str,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/qualitygates/get_by_project",
            query=with_optional_organization(
                context=context,
                values={"project": project_key},
            ),
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected project quality gate payload.")

    return payload


def set_quality_gate(
    *,
    context: ProjectContext,
    project_key: str,
    gate_id: str | None,
    gate_name: str | None,
    dry_run: bool,
) -> dict[str, Any]:
    resolved_gate_id = resolve_quality_gate_id(
        context=context,
        gate_id=gate_id,
        gate_name=gate_name,
    )
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/qualitygates/select",
        form=with_optional_organization(
            context=context,
            values={
                "projectKey": project_key,
                "gateId": resolved_gate_id,
            },
        ),
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Set quality gate",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return {
        "projectKey": project_key,
        "qualityGate": fetch_project_quality_gate(
            context=context,
            project_key=project_key,
        ),
        "qualityGateStatus": fetch_quality_gate_status(
            context=context,
            project_key=project_key,
        ),
    }


def unset_quality_gate(
    *,
    context: ProjectContext,
    project_key: str,
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/qualitygates/deselect",
        form=with_optional_organization(
            context=context,
            values={"projectKey": project_key},
        ),
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Unset quality gate",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return {
        "projectKey": project_key,
        "qualityGate": fetch_project_quality_gate(
            context=context,
            project_key=project_key,
        ),
        "qualityGateStatus": fetch_quality_gate_status(
            context=context,
            project_key=project_key,
        ),
    }


def resolve_quality_gate_id(
    *,
    context: ProjectContext,
    gate_id: str | None,
    gate_name: str | None,
) -> str:
    if gate_id is not None:
        value = gate_id.strip()
        if not value:
            raise SonarCliError("--gate-id must not be empty.")
        return value

    if gate_name is None or not gate_name.strip():
        raise SonarCliError("Either --gate-id or --gate-name is required.")

    payload = list_quality_gates(context=context)
    quality_gates = payload.get("qualitygates")
    if not isinstance(quality_gates, list):
        raise SonarCliError("No quality gates were returned for name resolution.")

    normalized_name = gate_name.strip()
    for quality_gate in quality_gates:
        if not isinstance(quality_gate, dict):
            continue

        if quality_gate.get("name") == normalized_name:
            gate_id_value = quality_gate.get("id")
            if isinstance(gate_id_value, int):
                return str(gate_id_value)
            if isinstance(gate_id_value, str) and gate_id_value:
                return gate_id_value

    raise SonarCliError(f"Could not resolve a quality gate named '{normalized_name}'.")


def list_quality_profiles(
    *,
    context: ProjectContext,
    project_key: str,
    language: str | None,
    quality_profile: str | None,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/qualityprofiles/search",
            query=with_optional_organization(
                context=context,
                values=drop_none_values(
                    {
                        "project": project_key,
                        "language": language,
                        "qualityProfile": quality_profile,
                    }
                ),
            ),
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected quality profiles payload.")

    return payload


def fetch_quality_profile_changelog(
    *,
    context: ProjectContext,
    quality_profile_key: str,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/qualityprofiles/changelog",
            query={"qualityProfile": quality_profile_key},
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected quality profile changelog payload.")

    return payload


def set_quality_profile(
    *,
    context: ProjectContext,
    project_key: str,
    quality_profile_key: str,
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/qualityprofiles/add_project",
        form={
            "project": project_key,
            "qualityProfile": quality_profile_key,
        },
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Set quality profile",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return list_quality_profiles(
        context=context,
        project_key=project_key,
        language=None,
        quality_profile=None,
    )


def unset_quality_profile(
    *,
    context: ProjectContext,
    project_key: str,
    quality_profile_key: str,
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/qualityprofiles/remove_project",
        form={
            "project": project_key,
            "qualityProfile": quality_profile_key,
        },
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Unset quality profile",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return list_quality_profiles(
        context=context,
        project_key=project_key,
        language=None,
        quality_profile=None,
    )


def fetch_settings_values(
    *,
    context: ProjectContext,
    component: str,
    keys: list[str],
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/settings/values",
            query=drop_none_values(
                {
                    "component": component,
                    "keys": ",".join(keys) if keys else None,
                }
            ),
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected settings values payload.")

    return payload


def fetch_settings_definitions(
    *,
    context: ProjectContext,
    component: str,
    keys: list[str],
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/settings/list_definitions",
            query=drop_none_values(
                {
                    "component": component,
                    "keys": ",".join(keys) if keys else None,
                }
            ),
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected settings definitions payload.")

    return payload


def set_setting_value(
    *,
    context: ProjectContext,
    component: str,
    key: str,
    value: str | None,
    values: list[str] | None,
    dry_run: bool,
) -> dict[str, Any]:
    form = {
        "component": component,
        "key": key,
    }
    if values is not None:
        form["values"] = ",".join(values)
    else:
        if value is None:
            raise SonarCliError("Either --value or --values is required.")
        form["value"] = value

    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/settings/set",
        form=form,
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Set project setting",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return fetch_settings_values(context=context, component=component, keys=[key])


def reset_setting_value(
    *,
    context: ProjectContext,
    component: str,
    key: str,
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/settings/reset",
        form={
            "component": component,
            "key": key,
        },
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Reset project setting",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return fetch_settings_values(context=context, component=component, keys=[key])


def search_project_tags(
    *,
    context: ProjectContext,
    query_text: str | None,
    page_size: int,
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/project_tags/search",
            query=with_optional_organization(
                context=context,
                values=drop_none_values(
                    {
                        "q": query_text.strip() if query_text else None,
                        "ps": str(max(1, page_size)),
                    }
                ),
            ),
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected project tags payload.")

    return payload


def set_project_tags(
    *,
    context: ProjectContext,
    project_key: str,
    tags: list[str],
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/project_tags/set",
        form={
            "project": project_key,
            "tags": ",".join(tags),
        },
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Set project tags",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return fetch_project_component_info(context=context, component=project_key)


def direct_api_call(
    *,
    context: ProjectContext,
    endpoint: str,
    method: str,
    query: dict[str, str],
    form: dict[str, str],
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method=method,
        endpoint=endpoint,
        query=query or None,
        form=form or None,
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Direct API call",
            request_spec=request_spec,
        )

    return {
        "projectKey": context.project_key,
        "response": api_request(context=context, spec=request_spec),
    }
