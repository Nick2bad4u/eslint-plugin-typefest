from __future__ import annotations

import json
from collections import Counter
from types import SimpleNamespace
from typing import Any

from github_security_api import RepoContext, api_request, safe_api_request
from github_security_common import (
    GitHubSecurityCliError,
    expect_dict,
    expect_list,
    filter_non_null_values,
    normalize_repeated_values,
    parse_name_value_pairs,
)


def build_code_scanning_query(arguments: Any) -> dict[str, Any]:
    """Build query parameters for code scanning list calls."""

    return filter_non_null_values(
        {
            "tool_name": arguments.tool_name,
            "tool_guid": arguments.tool_guid,
            "state": arguments.state,
            "severity": arguments.severity,
            "assignees": arguments.assignees,
            "ref": arguments.ref,
            "pr": arguments.pr,
            "sort": arguments.sort,
            "direction": arguments.direction,
            "page": arguments.page,
            "per_page": arguments.per_page,
        }
    )


def build_dependabot_query(arguments: Any) -> dict[str, Any]:
    """Build query parameters for Dependabot list calls."""

    return filter_non_null_values(
        {
            "state": arguments.state,
            "severity": arguments.severity,
            "ecosystem": arguments.ecosystem,
            "package": arguments.package,
            "manifest": arguments.manifest,
            "epss_percentage": arguments.epss_percentage,
            "has": arguments.has_filter,
            "assignee": arguments.assignee,
            "scope": arguments.scope,
            "sort": arguments.sort,
            "direction": arguments.direction,
            "before": arguments.before,
            "after": arguments.after,
            "per_page": arguments.per_page,
        }
    )


def build_secret_scanning_query(arguments: Any) -> dict[str, Any]:
    """Build query parameters for secret scanning list calls."""

    return filter_non_null_values(
        {
            "state": arguments.state,
            "secret_type": arguments.secret_type,
            "resolution": arguments.resolution,
            "assignee": arguments.assignee,
            "validity": arguments.validity,
            "is_publicly_leaked": (
                True if arguments.is_publicly_leaked else None
            ),
            "is_multi_repo": True if arguments.is_multi_repo else None,
            "hide_secret": False if arguments.show_secret_values else True,
            "sort": arguments.sort,
            "direction": arguments.direction,
            "page": arguments.page,
            "per_page": arguments.per_page,
        }
    )


def fetch_code_scanning_alerts(
    context: RepoContext, query: dict[str, Any]
) -> list[dict[str, Any]]:
    """List code scanning alerts."""

    response = api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/code-scanning/alerts",
        params=query,
    )
    return expect_list(response.data, "code scanning alerts")


def fetch_code_scanning_alert(
    context: RepoContext, alert_number: int
) -> dict[str, Any]:
    """Fetch one code scanning alert."""

    response = api_request(
        context,
        endpoint=(
            f"/repos/{context.owner}/{context.repo}/code-scanning/alerts/{alert_number}"
        ),
    )
    return expect_dict(response.data, "code scanning alert")


def fetch_code_scanning_instances(
    context: RepoContext,
    alert_number: int,
    *,
    page: int,
    per_page: int,
) -> list[dict[str, Any]]:
    """Fetch alert instances for one code scanning alert."""

    response = api_request(
        context,
        endpoint=(
            f"/repos/{context.owner}/{context.repo}/code-scanning/alerts/{alert_number}/instances"
        ),
        params={"page": page, "per_page": per_page},
    )
    return expect_list(response.data, "code scanning instances")


def fetch_code_scanning_autofix(
    context: RepoContext, alert_number: int
) -> dict[str, Any] | None:
    """Fetch code scanning autofix status when available."""

    result = safe_api_request(
        context,
        endpoint=(
            f"/repos/{context.owner}/{context.repo}/code-scanning/alerts/{alert_number}/autofix"
        ),
    )
    if not result["ok"]:
        return {"error": result["error"]}
    return expect_dict(result["data"], "code scanning autofix status")


def build_code_scanning_update_payload(arguments: Any) -> dict[str, Any]:
    """Build a code scanning alert update payload."""

    payload: dict[str, Any] = {"state": arguments.state}
    assignees = normalize_repeated_values(arguments.assignees)

    if arguments.state == "dismissed":
        if arguments.dismissed_reason is None:
            raise GitHubSecurityCliError(
                "--dismissed-reason is required when dismissing a code scanning alert."
            )
        payload["dismissed_reason"] = arguments.dismissed_reason
        if arguments.comment is not None:
            payload["dismissed_comment"] = arguments.comment
        if arguments.create_request:
            payload["create_request"] = True
    else:
        if arguments.dismissed_reason is not None:
            raise GitHubSecurityCliError(
                "--dismissed-reason can only be used when state is dismissed."
            )
        if arguments.comment is not None:
            raise GitHubSecurityCliError(
                "--comment can only be used when state is dismissed for code scanning alerts."
            )

    if arguments.clear_assignees:
        payload["assignees"] = []
    elif assignees:
        payload["assignees"] = assignees

    return payload


def update_code_scanning_alert(
    context: RepoContext, arguments: Any
) -> dict[str, Any]:
    """Dismiss, reopen, or reassign a code scanning alert."""

    payload = build_code_scanning_update_payload(arguments)
    if arguments.dry_run:
        return {
            "dry_run": True,
            "endpoint": f"/repos/{context.owner}/{context.repo}/code-scanning/alerts/{arguments.alert}",
            "payload": payload,
        }

    response = api_request(
        context,
        endpoint=(
            f"/repos/{context.owner}/{context.repo}/code-scanning/alerts/{arguments.alert}"
        ),
        method="PATCH",
        body=payload,
    )
    return expect_dict(response.data, "updated code scanning alert")


def fetch_dependabot_alerts(
    context: RepoContext, query: dict[str, Any]
) -> list[dict[str, Any]]:
    """List Dependabot alerts."""

    response = api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/dependabot/alerts",
        params=query,
    )
    return expect_list(response.data, "Dependabot alerts")


def fetch_dependabot_alert(
    context: RepoContext, alert_number: int
) -> dict[str, Any]:
    """Fetch one Dependabot alert."""

    response = api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/dependabot/alerts/{alert_number}",
    )
    return expect_dict(response.data, "Dependabot alert")


def build_dependabot_update_payload(arguments: Any) -> dict[str, Any]:
    """Build a Dependabot alert update payload."""

    payload: dict[str, Any] = {"state": arguments.state}
    assignees = normalize_repeated_values(arguments.assignees)

    if arguments.state == "dismissed":
        if arguments.dismissed_reason is None:
            raise GitHubSecurityCliError(
                "--dismissed-reason is required when dismissing a Dependabot alert."
            )
        payload["dismissed_reason"] = arguments.dismissed_reason
        if arguments.comment is not None:
            payload["dismissed_comment"] = arguments.comment
    else:
        if arguments.dismissed_reason is not None:
            raise GitHubSecurityCliError(
                "--dismissed-reason can only be used when state is dismissed."
            )
        if arguments.comment is not None:
            raise GitHubSecurityCliError(
                "--comment can only be used when state is dismissed for Dependabot alerts."
            )

    if arguments.clear_assignees:
        payload["assignees"] = []
    elif assignees:
        payload["assignees"] = assignees

    return payload


def update_dependabot_alert(
    context: RepoContext, arguments: Any
) -> dict[str, Any]:
    """Dismiss, reopen, or reassign a Dependabot alert."""

    payload = build_dependabot_update_payload(arguments)
    if arguments.dry_run:
        return {
            "dry_run": True,
            "endpoint": f"/repos/{context.owner}/{context.repo}/dependabot/alerts/{arguments.alert}",
            "payload": payload,
        }

    response = api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/dependabot/alerts/{arguments.alert}",
        method="PATCH",
        body=payload,
    )
    return expect_dict(response.data, "updated Dependabot alert")


def fetch_global_advisory_type(
    context: RepoContext,
    ghsa_id: str,
    advisory_type_cache: dict[str, dict[str, Any] | None],
) -> dict[str, Any] | None:
    """Fetch one global advisory so malware alerts can be classified."""

    cached_result = advisory_type_cache.get(ghsa_id)
    if cached_result is not None or ghsa_id in advisory_type_cache:
        return cached_result

    result = safe_api_request(context, endpoint=f"/advisories/{ghsa_id}")
    if not result["ok"]:
        advisory_type_cache[ghsa_id] = {
            "error": result["error"],
            "ghsa_id": ghsa_id,
        }
        return advisory_type_cache[ghsa_id]

    advisory = expect_dict(result["data"], f"advisory {ghsa_id}")
    advisory_type_cache[ghsa_id] = advisory
    return advisory


def get_alert_ghsa_id(alert: dict[str, Any]) -> str | None:
    """Extract a GHSA identifier from a Dependabot alert payload."""

    advisory = alert.get("security_advisory")
    if isinstance(advisory, dict):
        ghsa_id = advisory.get("ghsa_id")
        if isinstance(ghsa_id, str) and ghsa_id.strip():
            return ghsa_id.strip()

        identifiers = advisory.get("identifiers")
        if isinstance(identifiers, list):
            for identifier in identifiers:
                if not isinstance(identifier, dict):
                    continue
                if identifier.get("type") != "GHSA":
                    continue
                value = identifier.get("value")
                if isinstance(value, str) and value.strip():
                    return value.strip()

    return None


def classify_malware_alerts(
    context: RepoContext,
    alerts: list[dict[str, Any]],
    advisory_cache: dict[str, dict[str, Any] | None] | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Filter Dependabot alerts to those backed by malware advisories."""

    malware_alerts: list[dict[str, Any]] = []
    lookup_failures: list[dict[str, Any]] = []
    cache = advisory_cache if advisory_cache is not None else {}

    for alert in alerts:
        ghsa_id = get_alert_ghsa_id(alert)
        if ghsa_id is None:
            continue

        advisory = fetch_global_advisory_type(context, ghsa_id, cache)
        if advisory is None:
            continue
        if "error" in advisory:
            lookup_failures.append(
                {
                    "alert_number": alert.get("number"),
                    "ghsa_id": ghsa_id,
                    "error": advisory["error"],
                }
            )
            continue

        if advisory.get("type") != "malware":
            continue

        malware_alert = dict(alert)
        malware_alert["malware_advisory"] = advisory
        malware_alerts.append(malware_alert)

    return malware_alerts, lookup_failures


def maybe_raise_if_not_malware(
    context: RepoContext,
    alert_number: int,
    advisory_cache: dict[str, dict[str, Any] | None],
) -> dict[str, Any]:
    """Ensure that one Dependabot alert is backed by a malware advisory."""

    alert = fetch_dependabot_alert(context, alert_number)
    ghsa_id = get_alert_ghsa_id(alert)
    if ghsa_id is None:
        raise GitHubSecurityCliError(
            "Dependabot alert "
            f"{alert_number} does not expose a GHSA identifier, so it "
            "cannot be confirmed as a malware alert."
        )

    advisory = fetch_global_advisory_type(context, ghsa_id, advisory_cache)
    if advisory is None or "error" in advisory:
        raise GitHubSecurityCliError(
            f"Could not verify malware advisory type for alert {alert_number} (GHSA {ghsa_id})."
        )

    if advisory.get("type") != "malware":
        raise GitHubSecurityCliError(
            "Dependabot alert "
            f"{alert_number} is not backed by a malware advisory "
            f"(type={advisory.get('type')})."
        )

    enriched_alert = dict(alert)
    enriched_alert["malware_advisory"] = advisory
    return enriched_alert


def fetch_secret_scanning_alerts(
    context: RepoContext, query: dict[str, Any]
) -> list[dict[str, Any]]:
    """List secret scanning alerts."""

    response = api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/secret-scanning/alerts",
        params=query,
    )
    return expect_list(response.data, "secret scanning alerts")


def fetch_secret_scanning_alert(
    context: RepoContext,
    *,
    alert_number: int,
    show_secret_values: bool,
) -> dict[str, Any]:
    """Fetch one secret scanning alert."""

    response = api_request(
        context,
        endpoint=(
            f"/repos/{context.owner}/{context.repo}/secret-scanning/alerts/{alert_number}"
        ),
        params={"hide_secret": False if show_secret_values else True},
    )
    return expect_dict(response.data, "secret scanning alert")


def build_secret_scanning_update_payload(arguments: Any) -> dict[str, Any]:
    """Build a secret scanning alert update payload."""

    payload: dict[str, Any] = {"state": arguments.state}

    if arguments.state == "resolved":
        if arguments.resolution is None:
            raise GitHubSecurityCliError(
                "--resolution is required when resolving a secret scanning alert."
            )
        payload["resolution"] = arguments.resolution
        if arguments.comment is not None:
            payload["resolution_comment"] = arguments.comment
    else:
        if arguments.resolution is not None:
            raise GitHubSecurityCliError(
                "--resolution can only be used when state is resolved."
            )
        if arguments.comment is not None:
            payload["resolution_comment"] = arguments.comment

    if arguments.unassign:
        if arguments.assignee is not None:
            raise GitHubSecurityCliError(
                "Use either --assignee or --unassign, but not both."
            )
        payload["assignee"] = None
    elif arguments.assignee is not None:
        payload["assignee"] = arguments.assignee

    return payload


def update_secret_scanning_alert(
    context: RepoContext, arguments: Any
) -> dict[str, Any]:
    """Resolve, reopen, or reassign a secret scanning alert."""

    payload = build_secret_scanning_update_payload(arguments)
    if arguments.dry_run:
        return {
            "dry_run": True,
            "endpoint": f"/repos/{context.owner}/{context.repo}/secret-scanning/alerts/{arguments.alert}",
            "payload": payload,
        }

    response = api_request(
        context,
        endpoint=(
            f"/repos/{context.owner}/{context.repo}/secret-scanning/alerts/{arguments.alert}"
        ),
        method="PATCH",
        body=payload,
    )
    return expect_dict(response.data, "updated secret scanning alert")


def fetch_secret_locations(
    context: RepoContext,
    *,
    alert_number: int,
    page: int,
    per_page: int,
) -> list[dict[str, Any]]:
    """Fetch secret scanning locations for one alert."""

    response = api_request(
        context,
        endpoint=(
            f"/repos/{context.owner}/{context.repo}/secret-scanning/alerts/{alert_number}/locations"
        ),
        params={"page": page, "per_page": per_page},
    )
    return expect_list(response.data, "secret scanning locations")


def fetch_secret_scan_history(context: RepoContext) -> dict[str, Any]:
    """Fetch the secret scanning scan history for the repository."""

    response = api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/secret-scanning/scan-history",
    )
    return expect_dict(response.data, "secret scanning scan history")


def fetch_repository_overview(context: RepoContext) -> dict[str, Any]:
    """Fetch repository metadata and security_and_analysis settings."""

    response = api_request(
        context, endpoint=f"/repos/{context.owner}/{context.repo}"
    )
    repository = expect_dict(response.data, "repository overview")
    return {
        "api_base_url": context.api_base_url,
        "full_name": context.full_name,
        "html_url": repository.get("html_url"),
        "private": repository.get("private"),
        "security_and_analysis": repository.get("security_and_analysis"),
        "visibility": repository.get("visibility"),
        "web_base_url": context.web_base_url,
    }


def summarize_alert_collection(
    result: dict[str, Any], *, sample_size: int, summary_kind: str
) -> dict[str, Any]:
    """Convert a safe list-call result into a compact summary payload."""

    if not result["ok"]:
        return {"error": result["error"], "ok": False}

    alerts = expect_list(result["data"], f"{summary_kind} alerts")
    counts_by_state = Counter(
        str(alert.get("state", "unknown")) for alert in alerts
    )
    return {
        "counts_by_state": dict(counts_by_state),
        "ok": True,
        "sample_alerts": alerts[:sample_size],
        "total": len(alerts),
    }


def build_summary(context: RepoContext, arguments: Any) -> dict[str, Any]:
    """Build a cross-surface security summary for the repository."""

    code_scanning_result = safe_api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/code-scanning/alerts",
        params={"page": 1, "per_page": arguments.per_page},
    )
    dependabot_result = safe_api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/dependabot/alerts",
        params={"per_page": arguments.per_page},
    )
    secret_scanning_result = safe_api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/secret-scanning/alerts",
        params={
            "page": 1,
            "per_page": arguments.per_page,
            "hide_secret": True,
        },
    )

    advisory_cache: dict[str, dict[str, Any] | None] = {}

    summary_sections: dict[str, Any] = {
        "code_scanning": summarize_alert_collection(
            code_scanning_result,
            sample_size=arguments.sample_size,
            summary_kind="code_scanning",
        ),
        "dependabot": summarize_alert_collection(
            dependabot_result,
            sample_size=arguments.sample_size,
            summary_kind="dependabot",
        ),
        "secret_scanning": summarize_alert_collection(
            secret_scanning_result,
            sample_size=arguments.sample_size,
            summary_kind="secret_scanning",
        ),
    }

    summary: dict[str, Any] = {
        "api_base_url": context.api_base_url,
        "full_name": context.full_name,
        "repository_html_url": f"{context.web_base_url}/{context.full_name}",
        "token_env": context.token_env_name,
        "sections": summary_sections,
    }

    if dependabot_result["ok"]:
        dependabot_alerts = expect_list(
            dependabot_result["data"], "Dependabot alerts"
        )
        malware_alerts, lookup_failures = classify_malware_alerts(
            context,
            dependabot_alerts,
            advisory_cache,
        )
        summary_sections["malware"] = {
            "counts_by_state": dict(
                Counter(
                    str(alert.get("state", "unknown"))
                    for alert in malware_alerts
                )
            ),
            "lookup_failures": lookup_failures,
            "ok": True,
            "sample_alerts": malware_alerts[: arguments.sample_size],
            "total": len(malware_alerts),
        }
    else:
        summary_sections["malware"] = {
            "depends_on": "dependabot",
            "error": dependabot_result["error"],
            "ok": False,
        }

    return summary


def build_export_alerts(
    context: RepoContext, arguments: Any
) -> dict[str, Any]:
    """Export full alert collections for bulk triage workflows."""

    overview = fetch_repository_overview(context)
    code_scanning_result = safe_api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/code-scanning/alerts",
        params={
            "page": 1,
            "per_page": arguments.per_page,
            "state": arguments.code_scanning_state,
        },
    )
    dependabot_result = safe_api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/dependabot/alerts",
        params={
            "per_page": arguments.per_page,
            "state": arguments.dependabot_state,
        },
    )
    secret_scanning_result = safe_api_request(
        context,
        endpoint=f"/repos/{context.owner}/{context.repo}/secret-scanning/alerts",
        params={
            "page": 1,
            "per_page": arguments.per_page,
            "state": arguments.secret_scanning_state,
            "hide_secret": False if arguments.show_secret_values else True,
        },
    )

    export_sections: dict[str, Any] = {
        "code_scanning": code_scanning_result,
        "dependabot": dependabot_result,
        "secret_scanning": secret_scanning_result,
    }

    export_bundle: dict[str, Any] = {
        "api_base_url": context.api_base_url,
        "full_name": context.full_name,
        "repository": overview,
        "sections": export_sections,
        "token_env": context.token_env_name,
    }

    if dependabot_result["ok"]:
        advisories_cache: dict[str, dict[str, Any] | None] = {}
        dependabot_alerts = expect_list(
            dependabot_result["data"], "Dependabot alerts"
        )
        malware_alerts, lookup_failures = classify_malware_alerts(
            context,
            dependabot_alerts,
            advisories_cache,
        )
        export_sections["malware"] = {
            "alerts": malware_alerts,
            "lookup_failures": lookup_failures,
            "ok": True,
            "total": len(malware_alerts),
        }
    else:
        export_sections["malware"] = {
            "depends_on": "dependabot",
            "error": dependabot_result["error"],
            "ok": False,
        }

    return export_bundle


def build_bulk_code_scanning_query(arguments: Any) -> dict[str, Any]:
    """Build selection query parameters for bulk code-scanning updates."""

    return filter_non_null_values(
        {
            "tool_name": arguments.tool_name,
            "tool_guid": arguments.tool_guid,
            "state": arguments.select_state,
            "severity": arguments.severity,
            "assignees": arguments.assignee_filter,
            "ref": arguments.ref,
            "pr": arguments.pr,
            "sort": arguments.sort,
            "direction": arguments.direction,
            "page": arguments.page,
            "per_page": arguments.per_page,
        }
    )


def build_bulk_dependabot_query(arguments: Any) -> dict[str, Any]:
    """Build selection query parameters for bulk Dependabot updates."""

    return filter_non_null_values(
        {
            "state": arguments.select_state,
            "severity": arguments.severity,
            "ecosystem": arguments.ecosystem,
            "package": arguments.package,
            "manifest": arguments.manifest,
            "epss_percentage": arguments.epss_percentage,
            "has": arguments.has_filter,
            "assignee": arguments.assignee_filter,
            "scope": arguments.scope,
            "sort": arguments.sort,
            "direction": arguments.direction,
            "before": arguments.before,
            "after": arguments.after,
            "per_page": arguments.per_page,
        }
    )


def build_bulk_secret_scanning_query(arguments: Any) -> dict[str, Any]:
    """Build selection query parameters for bulk secret-scanning updates."""

    return filter_non_null_values(
        {
            "state": arguments.select_state,
            "secret_type": arguments.secret_type,
            "resolution": arguments.resolution_filter,
            "assignee": arguments.assignee_filter,
            "validity": arguments.validity,
            "is_publicly_leaked": (
                True if arguments.is_publicly_leaked else None
            ),
            "is_multi_repo": True if arguments.is_multi_repo else None,
            "hide_secret": False if arguments.show_secret_values else True,
            "sort": arguments.sort,
            "direction": arguments.direction,
            "page": arguments.page,
            "per_page": arguments.per_page,
        }
    )


def get_bulk_mutation_target_state(
    *, arguments: Any, current_state: str, surface: str
) -> str:
    """Resolve the target state for one bulk alert mutation."""

    target_state = arguments.target_state or current_state
    allowed_states_by_surface = {
        "code-scanning": {"open", "dismissed"},
        "dependabot": {"open", "dismissed"},
        "malware": {"open", "dismissed"},
        "secret-scanning": {"open", "resolved"},
    }

    allowed_states = allowed_states_by_surface[surface]
    if target_state not in allowed_states:
        raise GitHubSecurityCliError(
            f"Surface '{surface}' does not support target state '{target_state}'."
        )

    return target_state


def build_bulk_update_namespace(
    *, alert: dict[str, Any], arguments: Any, surface: str
) -> SimpleNamespace:
    """Build an update namespace for one selected bulk alert mutation."""

    current_state = str(alert.get("state", "unknown"))
    target_state = get_bulk_mutation_target_state(
        arguments=arguments,
        current_state=current_state,
        surface=surface,
    )
    alert_number = alert.get("number")
    if not isinstance(alert_number, int):
        raise GitHubSecurityCliError(
            f"Selected alert is missing an integer alert number for surface '{surface}'."
        )

    if surface == "code-scanning":
        return SimpleNamespace(
            alert=alert_number,
            assignees=arguments.assignees,
            clear_assignees=arguments.clear_assignees,
            comment=arguments.comment,
            create_request=arguments.create_request,
            dismissed_reason=arguments.dismissed_reason,
            dry_run=arguments.dry_run,
            state=target_state,
        )

    if surface in {"dependabot", "malware"}:
        return SimpleNamespace(
            alert=alert_number,
            assignees=arguments.assignees,
            clear_assignees=arguments.clear_assignees,
            comment=arguments.comment,
            dismissed_reason=arguments.dismissed_reason,
            dry_run=arguments.dry_run,
            state=target_state,
        )

    if arguments.assignees is not None and len(arguments.assignees) > 1:
        raise GitHubSecurityCliError(
            "Secret scanning bulk updates accept at most one --assignee value."
        )

    return SimpleNamespace(
        alert=alert_number,
        assignee=(arguments.assignees[0] if arguments.assignees else None),
        comment=arguments.comment,
        dry_run=arguments.dry_run,
        resolution=arguments.resolution,
        state=target_state,
        unassign=arguments.clear_assignees,
    )


def summarize_selected_alert(
    alert: dict[str, Any], surface: str
) -> dict[str, Any]:
    """Create a compact selected-alert summary for bulk results."""

    summary = {
        "alert_number": alert.get("number"),
        "html_url": alert.get("html_url"),
        "state": alert.get("state"),
        "surface": surface,
    }

    if surface == "code-scanning":
        rule = alert.get("rule")
        if isinstance(rule, dict):
            summary["rule_id"] = rule.get("id") or rule.get("name")
            summary["severity"] = rule.get(
                "security_severity_level"
            ) or rule.get("severity")
        return summary

    if surface in {"dependabot", "malware"}:
        vulnerability = alert.get("security_vulnerability")
        if isinstance(vulnerability, dict):
            package = vulnerability.get("package")
            if isinstance(package, dict):
                summary["package"] = package.get("name")
                summary["ecosystem"] = package.get("ecosystem")
            summary["severity"] = vulnerability.get("severity")
        dependency = alert.get("dependency")
        if isinstance(dependency, dict):
            summary["manifest_path"] = dependency.get("manifest_path")
        return summary

    summary["secret_type"] = alert.get("secret_type")
    summary["resolution"] = alert.get("resolution")
    return summary


def select_bulk_alerts(
    context: RepoContext, arguments: Any
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Resolve the alerts targeted by a bulk-update command."""

    surface = arguments.surface
    advisory_cache: dict[str, dict[str, Any] | None] = {}
    lookup_failures: list[dict[str, Any]] = []

    if arguments.alerts:
        selected_alerts: list[dict[str, Any]] = []
        for alert_number in arguments.alerts:
            if surface == "code-scanning":
                selected_alerts.append(
                    fetch_code_scanning_alert(context, alert_number)
                )
                continue
            if surface == "dependabot":
                selected_alerts.append(
                    fetch_dependabot_alert(context, alert_number)
                )
                continue
            if surface == "malware":
                if arguments.skip_malware_check:
                    selected_alerts.append(
                        fetch_dependabot_alert(context, alert_number)
                    )
                else:
                    selected_alerts.append(
                        maybe_raise_if_not_malware(
                            context, alert_number, advisory_cache
                        )
                    )
                continue
            selected_alerts.append(
                fetch_secret_scanning_alert(
                    context,
                    alert_number=alert_number,
                    show_secret_values=arguments.show_secret_values,
                )
            )
        return selected_alerts, lookup_failures

    if surface == "code-scanning":
        return (
            fetch_code_scanning_alerts(
                context, build_bulk_code_scanning_query(arguments)
            ),
            lookup_failures,
        )

    if surface == "dependabot":
        return (
            fetch_dependabot_alerts(
                context, build_bulk_dependabot_query(arguments)
            ),
            lookup_failures,
        )

    if surface == "malware":
        dependabot_alerts = fetch_dependabot_alerts(
            context, build_bulk_dependabot_query(arguments)
        )
        malware_alerts, lookup_failures = classify_malware_alerts(
            context,
            dependabot_alerts,
            advisory_cache,
        )
        return malware_alerts, lookup_failures

    return (
        fetch_secret_scanning_alerts(
            context, build_bulk_secret_scanning_query(arguments)
        ),
        lookup_failures,
    )


def bulk_update_alerts(context: RepoContext, arguments: Any) -> dict[str, Any]:
    """Bulk update alerts across one selected GitHub security surface."""

    selected_alerts, lookup_failures = select_bulk_alerts(context, arguments)
    if arguments.limit is not None:
        selected_alerts = selected_alerts[: arguments.limit]

    selected_summaries = [
        summarize_selected_alert(alert, arguments.surface)
        for alert in selected_alerts
    ]

    if arguments.dry_run:
        preview_updates = [
            build_bulk_update_namespace(
                alert=alert,
                arguments=arguments,
                surface=arguments.surface,
            ).__dict__
            for alert in selected_alerts
        ]
        return {
            "dry_run": True,
            "lookup_failures": lookup_failures,
            "selected_alerts": selected_summaries,
            "selected_count": len(selected_alerts),
            "surface": arguments.surface,
            "update_requests": preview_updates,
        }

    successes: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for alert in selected_alerts:
        try:
            update_args = build_bulk_update_namespace(
                alert=alert,
                arguments=arguments,
                surface=arguments.surface,
            )
            if arguments.surface == "code-scanning":
                result = update_code_scanning_alert(context, update_args)
            elif arguments.surface in {"dependabot", "malware"}:
                result = update_dependabot_alert(context, update_args)
            else:
                result = update_secret_scanning_alert(context, update_args)
            successes.append(result)
        except GitHubSecurityCliError as exc:
            failures.append(
                {
                    "alert_number": alert.get("number"),
                    "message": str(exc),
                    "type": type(exc).__name__,
                }
            )

    return {
        "failures": failures,
        "lookup_failures": lookup_failures,
        "selected_alerts": selected_summaries,
        "selected_count": len(selected_alerts),
        "success_count": len(successes),
        "surface": arguments.surface,
        "updated_alerts": successes,
    }


def handle_command(context: RepoContext, arguments: Any) -> Any:
    """Dispatch the parsed command."""

    command = arguments.command

    if command == "summary":
        return build_summary(context, arguments)

    if command == "repo-security-overview":
        return fetch_repository_overview(context)

    if command == "export-alerts":
        return build_export_alerts(context, arguments)

    if command == "bulk-update-alerts":
        return bulk_update_alerts(context, arguments)

    if command == "list-code-scanning":
        return fetch_code_scanning_alerts(
            context, build_code_scanning_query(arguments)
        )

    if command == "show-code-scanning":
        alert = fetch_code_scanning_alert(context, arguments.alert)
        if arguments.include_instances:
            alert["instances"] = fetch_code_scanning_instances(
                context,
                arguments.alert,
                page=1,
                per_page=arguments.instances_per_page,
            )
        if arguments.include_autofix:
            alert["autofix"] = fetch_code_scanning_autofix(
                context, arguments.alert
            )
        return alert

    if command == "update-code-scanning":
        return update_code_scanning_alert(context, arguments)

    if command == "list-dependabot":
        return fetch_dependabot_alerts(
            context, build_dependabot_query(arguments)
        )

    if command == "show-dependabot":
        return fetch_dependabot_alert(context, arguments.alert)

    if command == "update-dependabot":
        return update_dependabot_alert(context, arguments)

    if command == "list-malware":
        advisories_cache: dict[str, dict[str, Any] | None] = {}
        alerts = fetch_dependabot_alerts(
            context, build_dependabot_query(arguments)
        )
        malware_alerts, lookup_failures = classify_malware_alerts(
            context,
            alerts,
            advisories_cache,
        )
        return {
            "alerts": malware_alerts,
            "lookup_failures": lookup_failures,
            "total": len(malware_alerts),
        }

    if command == "show-malware":
        return maybe_raise_if_not_malware(context, arguments.alert, {})

    if command == "update-malware":
        if not arguments.skip_malware_check:
            maybe_raise_if_not_malware(context, arguments.alert, {})
        return update_dependabot_alert(context, arguments)

    if command == "list-secret-scanning":
        return fetch_secret_scanning_alerts(
            context, build_secret_scanning_query(arguments)
        )

    if command == "show-secret-scanning":
        return fetch_secret_scanning_alert(
            context,
            alert_number=arguments.alert,
            show_secret_values=arguments.show_secret_values,
        )

    if command == "update-secret-scanning":
        return update_secret_scanning_alert(context, arguments)

    if command == "list-secret-locations":
        return fetch_secret_locations(
            context,
            alert_number=arguments.alert,
            page=arguments.page,
            per_page=arguments.per_page,
        )

    if command == "secret-scan-history":
        return fetch_secret_scan_history(context)

    if command == "api-call":
        response = api_request(
            context,
            endpoint=arguments.endpoint,
            method=arguments.method,
            params=parse_name_value_pairs(arguments.query_params),
            body=(
                None
                if arguments.body_json is None
                else json.loads(arguments.body_json)
            ),
        )
        return {
            "data": response.data,
            "status_code": response.status_code,
            "url": response.url,
        }

    raise GitHubSecurityCliError(f"Unsupported command '{command}'.")
