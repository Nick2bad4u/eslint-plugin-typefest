from __future__ import annotations

from typing import Any, Iterable

from sonar_manage_api import (
    ProjectContext,
    RequestSpec,
    SonarCliError,
    api_request,
    drop_none_values,
)
from sonar_manage_common import (
    build_dry_run_payload,
    build_dry_run_result,
    extract_issue_state,
    normalize_keys,
)


def fetch_issues(
    *,
    context: ProjectContext,
    issue_statuses: str,
    page: int,
    page_size: int,
    extra_query: dict[str, str] | None,
) -> dict[str, Any]:
    query = {
        "componentKeys": context.project_key,
        "statuses": issue_statuses,
        "p": str(max(1, page)),
        "ps": str(max(1, page_size)),
        "s": "FILE_LINE",
        "asc": "true",
        "additionalFields": "_all",
    }
    query.update(extra_query or {})

    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/issues/search",
            query=query,
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected Sonar issues payload.")

    return payload


def fetch_issue_changelog(*, context: ProjectContext, issue_key: str) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/issues/changelog",
            query={"issue": issue_key},
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError(f"Unexpected issue changelog payload for {issue_key}.")

    return payload


def add_issue_comment(
    *,
    context: ProjectContext,
    issue_key: str,
    text: str,
    dry_run: bool,
) -> dict[str, Any]:
    if not text.strip():
        raise SonarCliError("--text must not be empty.")

    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/issues/add_comment",
        form={
            "issue": issue_key,
            "text": text,
        },
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Add issue comment",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    return {
        "projectKey": context.project_key,
        "issue": issue_key,
        "commentAdded": True,
        "text": text,
    }


def assign_issue(
    *,
    context: ProjectContext,
    issue_key: str,
    assignee: str,
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/issues/assign",
        form={
            "issue": issue_key,
            "assignee": assignee,
        },
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Assign issue",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    refreshed = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/issues/search",
            query={"issues": issue_key, "additionalFields": "_all"},
        ),
    )
    return extract_issue_state(refreshed, issue_key)


def set_issue_tags(
    *,
    context: ProjectContext,
    issue_key: str,
    tags: list[str],
    dry_run: bool,
) -> dict[str, Any]:
    request_spec = RequestSpec(
        method="POST",
        endpoint="/api/issues/set_tags",
        form={
            "issue": issue_key,
            "tags": ",".join(tags),
        },
    )

    if dry_run:
        return build_dry_run_payload(
            context=context,
            description="Set issue tags",
            request_spec=request_spec,
        )

    api_request(context=context, spec=request_spec)
    refreshed = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/issues/search",
            query={"issues": issue_key, "additionalFields": "_all"},
        ),
    )
    return extract_issue_state(refreshed, issue_key)


def transition_issues(
    *,
    context: ProjectContext,
    issue_keys: Iterable[str],
    transition: str,
    comment: str | None,
    dry_run: bool,
) -> dict[str, Any]:
    normalized_transition = transition.strip()
    if not normalized_transition:
        raise SonarCliError("--transition must not be empty.")

    results: list[dict[str, Any]] = []
    for issue_key in normalize_keys(issue_keys, argument_name="issue"):
        request_spec = RequestSpec(
            method="POST",
            endpoint="/api/issues/do_transition",
            form=drop_none_values(
                {
                    "issue": issue_key,
                    "transition": normalized_transition,
                    "comment": comment,
                }
            ),
        )

        if dry_run:
            results.append(
                build_dry_run_result(
                    description="Transition issue",
                    request_spec=request_spec,
                )
            )
            continue

        api_request(context=context, spec=request_spec)
        refreshed = api_request(
            context=context,
            spec=RequestSpec(
                method="GET",
                endpoint="/api/issues/search",
                query={"issues": issue_key, "additionalFields": "_all"},
            ),
        )
        results.append(extract_issue_state(refreshed, issue_key))

    return {
        "projectKey": context.project_key,
        "transition": normalized_transition,
        "dryRun": dry_run,
        "results": results,
    }


def fetch_hotspots(
    *,
    context: ProjectContext,
    hotspot_status: str,
    page: int,
    page_size: int,
    include_details: bool,
    extra_query: dict[str, str] | None,
) -> dict[str, Any]:
    query = {
        "projectKey": context.project_key,
        "status": hotspot_status,
        "p": str(max(1, page)),
        "ps": str(max(1, page_size)),
    }
    query.update(extra_query or {})

    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/hotspots/search",
            query=query,
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError("Unexpected Sonar hotspots payload.")

    if include_details:
        hotspot_items = payload.get("hotspots", [])
        details: list[dict[str, Any]] = []
        if isinstance(hotspot_items, list):
            for hotspot in hotspot_items:
                hotspot_key = hotspot.get("key") if isinstance(hotspot, dict) else None
                if isinstance(hotspot_key, str) and hotspot_key:
                    details.append(
                        fetch_hotspot_detail(context=context, hotspot_key=hotspot_key)
                    )

        payload = {**payload, "details": details}

    return payload


def fetch_hotspot_detail(
    *, context: ProjectContext, hotspot_key: str
) -> dict[str, Any]:
    payload = api_request(
        context=context,
        spec=RequestSpec(
            method="GET",
            endpoint="/api/hotspots/show",
            query={"hotspot": hotspot_key},
        ),
    )

    if not isinstance(payload, dict):
        raise SonarCliError(f"Unexpected hotspot detail payload for {hotspot_key}.")

    return payload


def review_hotspots(
    *,
    context: ProjectContext,
    hotspot_keys: Iterable[str],
    status: str,
    resolution: str,
    comment: str | None,
    dry_run: bool,
) -> dict[str, Any]:
    normalized_status = status.strip()
    normalized_resolution = resolution.strip()
    if not normalized_status:
        raise SonarCliError("--status must not be empty.")
    if not normalized_resolution:
        raise SonarCliError("--resolution must not be empty.")

    results: list[dict[str, Any]] = []
    for hotspot_key in normalize_keys(hotspot_keys, argument_name="hotspot"):
        request_spec = RequestSpec(
            method="POST",
            endpoint="/api/hotspots/change_status",
            form=drop_none_values(
                {
                    "hotspot": hotspot_key,
                    "status": normalized_status,
                    "resolution": normalized_resolution,
                    "comment": comment,
                }
            ),
        )

        if dry_run:
            results.append(
                build_dry_run_result(
                    description="Review hotspot",
                    request_spec=request_spec,
                )
            )
            continue

        api_request(context=context, spec=request_spec)
        refreshed = fetch_hotspot_detail(context=context, hotspot_key=hotspot_key)
        results.append(
            {
                "hotspot": hotspot_key,
                "status": refreshed.get("status"),
                "resolution": normalized_resolution,
                "line": refreshed.get("line"),
                "message": refreshed.get("message"),
            }
        )

    return {
        "projectKey": context.project_key,
        "status": normalized_status,
        "resolution": normalized_resolution,
        "dryRun": dry_run,
        "results": results,
    }
