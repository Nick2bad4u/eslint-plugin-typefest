#!/usr/bin/env python3
"""Inspect and manage project-level SonarCloud or SonarQube resources."""

from __future__ import annotations

import argparse
import base64
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib import error, parse, request

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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Inspect and manage project-level SonarCloud or SonarQube resources "
            "using an environment-variable token."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--repo",
        default=".",
        help="Path inside the target repository or project checkout.",
    )
    parser.add_argument(
        "--project-key",
        default=None,
        help=(
            "Explicit Sonar project key. If omitted, the script tries to read "
            "sonar.projectKey from sonar-project.properties."
        ),
    )
    parser.add_argument(
        "--organization",
        default=None,
        help=(
            "Explicit Sonar organization key. If omitted, the script tries to read "
            "sonar.organization from sonar-project.properties."
        ),
    )
    parser.add_argument(
        "--base-url",
        default=None,
        help=(
            "Sonar base URL. Defaults to sonar.host.url from "
            "sonar-project.properties or SonarCloud."
        ),
    )
    parser.add_argument(
        "--token-env",
        action="append",
        dest="token_envs",
        default=None,
        help=(
            "Environment variable name that may contain the Sonar token. "
            "Repeat to provide fallbacks."
        ),
    )
    parser.add_argument(
        "--auth-scheme",
        choices=("auto", "bearer", "basic"),
        default=DEFAULT_AUTH_SCHEME,
        help=(
            "Authentication scheme to use. 'auto' tries Bearer first, then Basic "
            "for compatibility with older endpoints."
        ),
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON instead of text output.",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    summary_parser = subparsers.add_parser(
        "summary",
        help="Fetch a summary of issues, hotspots, quality gate, and measures.",
    )
    add_issue_listing_args(summary_parser, include_page=False)
    summary_parser.add_argument(
        "--hotspot-status",
        default=DEFAULT_HOTSPOT_STATUS,
        help="Hotspot lifecycle status to query.",
    )
    summary_parser.add_argument(
        "--sample-size",
        type=int,
        default=5,
        help="Number of issue and hotspot samples to include.",
    )
    summary_parser.add_argument(
        "--metrics",
        default=DEFAULT_SUMMARY_METRICS,
        help="Comma-separated metric keys to include in the summary.",
    )

    list_issues_parser = subparsers.add_parser(
        "list-issues",
        help="List Sonar issues for the resolved project.",
    )
    add_issue_listing_args(list_issues_parser, include_page=True)

    issue_changelog_parser = subparsers.add_parser(
        "issue-changelog",
        help="Fetch the changelog/activity for one issue.",
    )
    issue_changelog_parser.add_argument("--issue", required=True, help="Issue key.")

    issue_comment_parser = subparsers.add_parser(
        "comment-issue",
        help="Add a comment to one issue.",
    )
    issue_comment_parser.add_argument("--issue", required=True, help="Issue key.")
    issue_comment_parser.add_argument("--text", required=True, help="Comment text.")
    issue_comment_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    issue_assign_parser = subparsers.add_parser(
        "assign-issue",
        help="Assign or unassign one issue.",
    )
    issue_assign_parser.add_argument("--issue", required=True, help="Issue key.")
    issue_assign_parser.add_argument(
        "--assignee",
        required=True,
        help="Assignee login. Use an empty string to unassign.",
    )
    issue_assign_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    issue_tags_parser = subparsers.add_parser(
        "set-issue-tags",
        help="Replace the tags on one issue.",
    )
    issue_tags_parser.add_argument("--issue", required=True, help="Issue key.")
    issue_tags_parser.add_argument(
        "--tag",
        action="append",
        dest="tags",
        default=None,
        help="Tag to apply. Repeat or pass comma-separated values.",
    )
    issue_tags_parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear all tags instead of setting tags.",
    )
    issue_tags_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    transition_issue_parser = subparsers.add_parser(
        "transition-issue",
        help="Apply a workflow transition to one or more Sonar issues.",
    )
    transition_issue_parser.add_argument(
        "--issue",
        action="append",
        dest="issues",
        required=True,
        help="Issue key to transition. Repeat for multiple issues.",
    )
    transition_issue_parser.add_argument(
        "--transition",
        required=True,
        help="Issue transition such as resolve, wontfix, falsepositive, or accept.",
    )
    transition_issue_parser.add_argument(
        "--comment",
        default=None,
        help="Optional comment to add alongside the issue transition.",
    )
    transition_issue_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    list_hotspots_parser = subparsers.add_parser(
        "list-hotspots",
        help="List security hotspots for the resolved project.",
    )
    add_hotspot_listing_args(list_hotspots_parser)
    list_hotspots_parser.add_argument(
        "--page",
        type=int,
        default=1,
        help="Hotspot search page number.",
    )
    list_hotspots_parser.add_argument(
        "--include-details",
        action="store_true",
        help="Fetch api/hotspots/show for each returned hotspot.",
    )

    show_hotspot_parser = subparsers.add_parser(
        "show-hotspot",
        help="Show one security hotspot, including its activity fields.",
    )
    show_hotspot_parser.add_argument(
        "--hotspot",
        required=True,
        help="Hotspot key.",
    )

    review_hotspot_parser = subparsers.add_parser(
        "review-hotspot",
        help="Change the review status of one or more security hotspots.",
    )
    review_hotspot_parser.add_argument(
        "--hotspot",
        action="append",
        dest="hotspots",
        required=True,
        help="Hotspot key to update. Repeat for multiple hotspots.",
    )
    review_hotspot_parser.add_argument(
        "--status",
        required=True,
        help="Target hotspot status value, for example REVIEWED.",
    )
    review_hotspot_parser.add_argument(
        "--resolution",
        required=True,
        help="Target hotspot resolution, for example SAFE or FIXED.",
    )
    review_hotspot_parser.add_argument(
        "--comment",
        default=None,
        help="Optional comment to add alongside the hotspot review.",
    )
    review_hotspot_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    measures_parser = subparsers.add_parser(
        "measures",
        help="Fetch current metric values for a component or project.",
    )
    measures_parser.add_argument(
        "--metric",
        action="append",
        dest="metrics",
        default=None,
        help="Metric key to fetch. Repeat or pass comma-separated values.",
    )
    measures_parser.add_argument(
        "--component",
        default=None,
        help="Component key. Defaults to the resolved project key.",
    )

    measures_history_parser = subparsers.add_parser(
        "measures-history",
        help="Fetch metric history for a component or project.",
    )
    measures_history_parser.add_argument(
        "--metric",
        action="append",
        dest="metrics",
        required=True,
        help="Metric key to fetch. Repeat or pass comma-separated values.",
    )
    measures_history_parser.add_argument(
        "--component",
        default=None,
        help="Component key. Defaults to the resolved project key.",
    )
    measures_history_parser.add_argument(
        "--from-date",
        default=None,
        help="Optional start date filter accepted by Sonar, for example 2026-03-01.",
    )
    measures_history_parser.add_argument(
        "--to-date",
        default=None,
        help="Optional end date filter accepted by Sonar, for example 2026-03-22.",
    )

    project_info_parser = subparsers.add_parser(
        "project-info",
        help="Show the resolved project component details.",
    )
    project_info_parser.add_argument(
        "--component",
        default=None,
        help="Optional component key. Defaults to the resolved project key.",
    )

    quality_gate_status_parser = subparsers.add_parser(
        "quality-gate-status",
        help="Fetch the current quality gate status for the project.",
    )
    quality_gate_status_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )

    subparsers.add_parser(
        "list-quality-gates",
        help="List available quality gates.",
    )

    get_quality_gate_parser = subparsers.add_parser(
        "get-quality-gate",
        help="Show the quality gate currently associated with the project.",
    )
    get_quality_gate_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )

    set_quality_gate_parser = subparsers.add_parser(
        "set-quality-gate",
        help="Associate the project with a quality gate.",
    )
    gate_group = set_quality_gate_parser.add_mutually_exclusive_group(required=True)
    gate_group.add_argument(
        "--gate-id",
        default=None,
        help="Quality gate id.",
    )
    gate_group.add_argument(
        "--gate-name",
        default=None,
        help="Quality gate name. The script resolves the id automatically.",
    )
    set_quality_gate_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )
    set_quality_gate_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    unset_quality_gate_parser = subparsers.add_parser(
        "unset-quality-gate",
        help="Remove the project's explicit quality gate association.",
    )
    unset_quality_gate_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )
    unset_quality_gate_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    list_quality_profiles_parser = subparsers.add_parser(
        "list-quality-profiles",
        help="List quality profiles relevant to the project.",
    )
    list_quality_profiles_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )
    list_quality_profiles_parser.add_argument(
        "--language",
        default=None,
        help="Optional language filter, for example ts or js.",
    )
    list_quality_profiles_parser.add_argument(
        "--quality-profile",
        default=None,
        help="Optional exact quality profile key filter.",
    )

    quality_profile_changelog_parser = subparsers.add_parser(
        "quality-profile-changelog",
        help="Fetch the changelog for one quality profile.",
    )
    quality_profile_changelog_parser.add_argument(
        "--quality-profile",
        required=True,
        help="Quality profile key.",
    )

    set_quality_profile_parser = subparsers.add_parser(
        "set-quality-profile",
        help="Associate the project with a quality profile.",
    )
    set_quality_profile_parser.add_argument(
        "--quality-profile",
        required=True,
        help="Quality profile key.",
    )
    set_quality_profile_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )
    set_quality_profile_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    unset_quality_profile_parser = subparsers.add_parser(
        "unset-quality-profile",
        help="Remove the project association from a quality profile.",
    )
    unset_quality_profile_parser.add_argument(
        "--quality-profile",
        required=True,
        help="Quality profile key.",
    )
    unset_quality_profile_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )
    unset_quality_profile_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    settings_values_parser = subparsers.add_parser(
        "settings-values",
        help="List project settings values.",
    )
    settings_values_parser.add_argument(
        "--key",
        action="append",
        dest="keys",
        default=None,
        help="Setting key to fetch. Repeat or pass comma-separated values.",
    )
    settings_values_parser.add_argument(
        "--component",
        default=None,
        help="Optional component key override. Defaults to the project key.",
    )

    settings_definitions_parser = subparsers.add_parser(
        "settings-definitions",
        help="List setting definitions for a project.",
    )
    settings_definitions_parser.add_argument(
        "--key",
        action="append",
        dest="keys",
        default=None,
        help="Setting key to fetch. Repeat or pass comma-separated values.",
    )
    settings_definitions_parser.add_argument(
        "--component",
        default=None,
        help="Optional component key override. Defaults to the project key.",
    )

    settings_set_parser = subparsers.add_parser(
        "settings-set",
        help="Set a project setting value.",
    )
    settings_set_parser.add_argument("--key", required=True, help="Setting key.")
    setting_values_group = settings_set_parser.add_mutually_exclusive_group(
        required=True
    )
    setting_values_group.add_argument(
        "--value",
        default=None,
        help="Single setting value.",
    )
    setting_values_group.add_argument(
        "--values",
        nargs="+",
        default=None,
        help="Multiple setting values. These are sent as a comma-separated list.",
    )
    settings_set_parser.add_argument(
        "--component",
        default=None,
        help="Optional component key override. Defaults to the project key.",
    )
    settings_set_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    settings_reset_parser = subparsers.add_parser(
        "settings-reset",
        help="Reset a project setting to its inherited/default value.",
    )
    settings_reset_parser.add_argument("--key", required=True, help="Setting key.")
    settings_reset_parser.add_argument(
        "--component",
        default=None,
        help="Optional component key override. Defaults to the project key.",
    )
    settings_reset_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    search_project_tags_parser = subparsers.add_parser(
        "search-project-tags",
        help="Search available project tags.",
    )
    search_project_tags_parser.add_argument(
        "--query-text",
        default=None,
        help="Optional search text.",
    )
    search_project_tags_parser.add_argument(
        "--page-size",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Maximum number of tags to fetch.",
    )

    set_project_tags_parser = subparsers.add_parser(
        "set-project-tags",
        help="Replace the tags on the current project.",
    )
    set_project_tags_parser.add_argument(
        "--project",
        default=None,
        help="Optional project key override.",
    )
    set_project_tags_parser.add_argument(
        "--tag",
        action="append",
        dest="tags",
        default=None,
        help="Tag to apply. Repeat or pass comma-separated values.",
    )
    set_project_tags_parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear all project tags instead of setting tags.",
    )
    set_project_tags_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )

    api_call_parser = subparsers.add_parser(
        "api-call",
        help="Call any Sonar API endpoint directly as an escape hatch.",
    )
    api_call_parser.add_argument(
        "--endpoint",
        required=True,
        help=(
            "API endpoint path such as /api/issues/search or a full URL like "
            "https://api.sonarcloud.io/organizations/organizations"
        ),
    )
    api_call_parser.add_argument(
        "--method",
        choices=("GET", "POST"),
        default="GET",
        help="HTTP method.",
    )
    api_call_parser.add_argument(
        "--query-param",
        action="append",
        dest="query_params",
        default=None,
        help="Query parameter in key=value form. Repeat as needed.",
    )
    api_call_parser.add_argument(
        "--form-param",
        action="append",
        dest="form_params",
        default=None,
        help="Form parameter in key=value form. Repeat as needed.",
    )
    api_call_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended request without sending it.",
    )

    return parser.parse_args(normalize_global_args(sys.argv[1:]))


def normalize_global_args(argv: list[str]) -> list[str]:
    flags_with_values = {
        "--repo",
        "--project-key",
        "--organization",
        "--base-url",
        "--token-env",
        "--auth-scheme",
    }
    flags_without_values = {"--json"}

    global_args: list[str] = []
    other_args: list[str] = []
    index = 0
    while index < len(argv):
        argument = argv[index]

        if argument in flags_without_values:
            global_args.append(argument)
            index += 1
            continue

        if argument in flags_with_values:
            next_index = index + 1
            if next_index >= len(argv):
                raise SonarCliError(f"Missing value for global argument: {argument}")

            global_args.extend((argument, argv[next_index]))
            index += 2
            continue

        other_args.append(argument)
        index += 1

    return [*global_args, *other_args]


def add_issue_listing_args(
    parser: argparse.ArgumentParser, *, include_page: bool
) -> None:
    parser.add_argument(
        "--issue-statuses",
        default=DEFAULT_ISSUE_STATUSES,
        help="Comma-separated Sonar issue statuses to query.",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Maximum number of issues to fetch in one page.",
    )
    if include_page:
        parser.add_argument(
            "--page",
            type=int,
            default=1,
            help="Issue search page number.",
        )
    parser.add_argument(
        "--extra-query",
        action="append",
        dest="extra_query",
        default=None,
        help="Extra api/issues/search parameter in key=value form. Repeat as needed.",
    )


def add_hotspot_listing_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--hotspot-status",
        default=DEFAULT_HOTSPOT_STATUS,
        help="Hotspot lifecycle status to query.",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Maximum number of hotspots to fetch in one page.",
    )
    parser.add_argument(
        "--extra-query",
        action="append",
        dest="extra_query",
        default=None,
        help="Extra api/hotspots/search parameter in key=value form. Repeat as needed.",
    )


def main() -> int:
    try:
        args = parse_args()
        context = resolve_context(args)
        payload = dispatch_command(args, context)
        emit_output(payload, as_json=args.json)
        return 0
    except SonarCliError as error_message:
        print(f"Error: {error_message}", file=sys.stderr)
        return 1


def dispatch_command(args: argparse.Namespace, context: ProjectContext) -> Any:
    if args.command == "summary":
        return build_summary(args, context)

    if args.command == "list-issues":
        return fetch_issues(
            context=context,
            issue_statuses=args.issue_statuses,
            page=args.page,
            page_size=args.page_size,
            extra_query=parse_name_value_pairs(
                args.extra_query, argument_name="extra-query"
            ),
        )

    if args.command == "issue-changelog":
        return fetch_issue_changelog(context=context, issue_key=args.issue)

    if args.command == "comment-issue":
        return add_issue_comment(
            context=context,
            issue_key=args.issue,
            text=args.text,
            dry_run=args.dry_run,
        )

    if args.command == "assign-issue":
        return assign_issue(
            context=context,
            issue_key=args.issue,
            assignee=args.assignee,
            dry_run=args.dry_run,
        )

    if args.command == "set-issue-tags":
        return set_issue_tags(
            context=context,
            issue_key=args.issue,
            tags=resolve_tag_values(args.tags, clear=args.clear, argument_name="tag"),
            dry_run=args.dry_run,
        )

    if args.command == "transition-issue":
        return transition_issues(
            context=context,
            issue_keys=args.issues,
            transition=args.transition,
            comment=args.comment,
            dry_run=args.dry_run,
        )

    if args.command == "list-hotspots":
        return fetch_hotspots(
            context=context,
            hotspot_status=args.hotspot_status,
            page=args.page,
            page_size=args.page_size,
            include_details=args.include_details,
            extra_query=parse_name_value_pairs(
                args.extra_query, argument_name="extra-query"
            ),
        )

    if args.command == "show-hotspot":
        return fetch_hotspot_detail(context=context, hotspot_key=args.hotspot)

    if args.command == "review-hotspot":
        return review_hotspots(
            context=context,
            hotspot_keys=args.hotspots,
            status=args.status,
            resolution=args.resolution,
            comment=args.comment,
            dry_run=args.dry_run,
        )

    if args.command == "measures":
        return fetch_measures(
            context=context,
            component=args.component or context.project_key,
            metrics=resolve_csv_values(args.metrics, argument_name="metric")
            or resolve_csv_values([DEFAULT_SUMMARY_METRICS], argument_name="metric"),
        )

    if args.command == "measures-history":
        return fetch_measure_history(
            context=context,
            component=args.component or context.project_key,
            metrics=resolve_csv_values(args.metrics, argument_name="metric"),
            from_date=args.from_date,
            to_date=args.to_date,
        )

    if args.command == "project-info":
        return fetch_project_component_info(
            context=context,
            component=args.component or context.project_key,
        )

    if args.command == "quality-gate-status":
        return fetch_quality_gate_status(
            context=context,
            project_key=args.project or context.project_key,
        )

    if args.command == "list-quality-gates":
        return list_quality_gates(context=context)

    if args.command == "get-quality-gate":
        return fetch_project_quality_gate(
            context=context,
            project_key=args.project or context.project_key,
        )

    if args.command == "set-quality-gate":
        return set_quality_gate(
            context=context,
            project_key=args.project or context.project_key,
            gate_id=args.gate_id,
            gate_name=args.gate_name,
            dry_run=args.dry_run,
        )

    if args.command == "unset-quality-gate":
        return unset_quality_gate(
            context=context,
            project_key=args.project or context.project_key,
            dry_run=args.dry_run,
        )

    if args.command == "list-quality-profiles":
        return list_quality_profiles(
            context=context,
            project_key=args.project or context.project_key,
            language=args.language,
            quality_profile=args.quality_profile,
        )

    if args.command == "quality-profile-changelog":
        return fetch_quality_profile_changelog(
            context=context,
            quality_profile_key=args.quality_profile,
        )

    if args.command == "set-quality-profile":
        return set_quality_profile(
            context=context,
            project_key=args.project or context.project_key,
            quality_profile_key=args.quality_profile,
            dry_run=args.dry_run,
        )

    if args.command == "unset-quality-profile":
        return unset_quality_profile(
            context=context,
            project_key=args.project or context.project_key,
            quality_profile_key=args.quality_profile,
            dry_run=args.dry_run,
        )

    if args.command == "settings-values":
        return fetch_settings_values(
            context=context,
            component=args.component or context.project_key,
            keys=resolve_csv_values(args.keys, argument_name="key"),
        )

    if args.command == "settings-definitions":
        return fetch_settings_definitions(
            context=context,
            component=args.component or context.project_key,
            keys=resolve_csv_values(args.keys, argument_name="key"),
        )

    if args.command == "settings-set":
        return set_setting_value(
            context=context,
            component=args.component or context.project_key,
            key=args.key,
            value=args.value,
            values=args.values,
            dry_run=args.dry_run,
        )

    if args.command == "settings-reset":
        return reset_setting_value(
            context=context,
            component=args.component or context.project_key,
            key=args.key,
            dry_run=args.dry_run,
        )

    if args.command == "search-project-tags":
        return search_project_tags(
            context=context,
            query_text=args.query_text,
            page_size=args.page_size,
        )

    if args.command == "set-project-tags":
        return set_project_tags(
            context=context,
            project_key=args.project or context.project_key,
            tags=resolve_tag_values(args.tags, clear=args.clear, argument_name="tag"),
            dry_run=args.dry_run,
        )

    if args.command == "api-call":
        return direct_api_call(
            context=context,
            endpoint=args.endpoint,
            method=args.method,
            query=parse_name_value_pairs(
                args.query_params, argument_name="query-param"
            ),
            form=parse_name_value_pairs(args.form_params, argument_name="form-param"),
            dry_run=args.dry_run,
        )

    raise SonarCliError(f"Unsupported command: {args.command}")


def resolve_context(args: argparse.Namespace) -> ProjectContext:
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


def build_summary(args: argparse.Namespace, context: ProjectContext) -> dict[str, Any]:
    issues = fetch_issues(
        context=context,
        issue_statuses=args.issue_statuses,
        page=1,
        page_size=args.page_size,
        extra_query=parse_name_value_pairs(
            args.extra_query, argument_name="extra-query"
        ),
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


def drop_none_values(values: dict[str, str | None]) -> dict[str, str]:
    return {key: value for key, value in values.items() if value is not None}


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
    except Exception:  # pragma: no cover - best effort only
        raw_body = ""

    if raw_body:
        return raw_body

    return http_error.reason or "no additional error details"


def emit_output(payload: Any, *, as_json: bool) -> None:
    if as_json:
        print(json.dumps(payload, indent=2))
        return

    if not isinstance(payload, dict):
        print(payload)
        return

    print(render_text(payload))


def render_text(payload: dict[str, Any]) -> str:
    lines: list[str] = []

    for label, key in (
        ("Project", "projectKey"),
        ("Repo", "repoRoot"),
        ("Organization", "organization"),
        ("Base URL", "baseUrl"),
        ("Token env", "tokenEnv"),
        ("Auth scheme", "authScheme"),
    ):
        value = payload.get(key)
        if isinstance(value, str) and value:
            lines.append(f"{label}: {value}")

    open_issues = payload.get("openIssues")
    if isinstance(open_issues, dict):
        lines.append(f"Open issues: {open_issues.get('total', 0)}")
        sample = open_issues.get("sample")
        if isinstance(sample, list) and sample:
            lines.append("Issue sample:")
            lines.extend(format_sample_items(sample, key_field="key"))

    hotspots = payload.get("hotspots")
    if isinstance(hotspots, dict):
        lines.append(f"Hotspots: {hotspots.get('total', 0)}")
        sample = hotspots.get("sample")
        if isinstance(sample, list) and sample:
            lines.append("Hotspot sample:")
            lines.extend(format_sample_items(sample, key_field="key"))

    quality_gate_status = payload.get("qualityGateStatus")
    if isinstance(quality_gate_status, dict):
        project_status = quality_gate_status.get("projectStatus")
        if isinstance(project_status, dict):
            status = project_status.get("status")
            if isinstance(status, str):
                lines.append(f"Quality gate status: {status}")

    quality_gate = payload.get("qualityGate")
    if isinstance(quality_gate, dict):
        name = quality_gate.get("name") or quality_gate.get("qualityGate", {}).get(
            "name"
        )
        if isinstance(name, str) and name:
            lines.append(f"Quality gate: {name}")

    measures = payload.get("measures")
    if isinstance(measures, dict):
        component = measures.get("component")
        if isinstance(component, dict):
            lines.append("Measures:")
            raw_measures = component.get("measures")
            if isinstance(raw_measures, list):
                lines.extend(format_sample_items(raw_measures, key_field="metric"))

    results = payload.get("results")
    if isinstance(results, list):
        lines.append("Results:")
        lines.extend(format_sample_items(results, key_field=None))

    issues = payload.get("issues")
    if isinstance(issues, list):
        lines.append(f"Issues returned: {len(issues)}")
        lines.extend(format_sample_items(issues, key_field="key"))

    hotspot_items = payload.get("hotspots")
    if isinstance(hotspot_items, list):
        lines.append(f"Hotspots returned: {len(hotspot_items)}")
        lines.extend(format_sample_items(hotspot_items, key_field="key"))

    details = payload.get("details")
    if isinstance(details, list) and details:
        lines.append(f"Detail items returned: {len(details)}")
        lines.extend(format_sample_items(details, key_field="key"))

    if not lines:
        return json.dumps(payload, indent=2)

    return "\n".join(lines)


def format_sample_items(items: list[Any], *, key_field: str | None) -> list[str]:
    rendered: list[str] = []
    for item in items:
        if not isinstance(item, dict):
            rendered.append(f"- {item}")
            continue

        identifier = ""
        if key_field is not None:
            key_value = item.get(key_field)
            if isinstance(key_value, str) and key_value:
                identifier = f"{key_value}: "

        detail_parts: list[str] = []
        for candidate_key in (
            "status",
            "resolution",
            "component",
            "line",
            "message",
            "name",
            "metric",
            "value",
        ):
            candidate_value = item.get(candidate_key)
            if isinstance(candidate_value, str) and candidate_value:
                detail_parts.append(candidate_value)
            elif isinstance(candidate_value, int):
                detail_parts.append(f"line {candidate_value}")

        rendered.append(f"- {identifier}{' | '.join(detail_parts)}")

    return rendered


if __name__ == "__main__":
    raise SystemExit(main())
