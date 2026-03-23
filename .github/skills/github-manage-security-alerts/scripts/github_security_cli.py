from __future__ import annotations

import argparse
import sys

from github_security_common import (
    CODE_SCANNING_DISMISS_REASONS,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SUMMARY_PAGE_SIZE,
    DEFAULT_SUMMARY_SAMPLE_SIZE,
    DEPENDABOT_DISMISS_REASONS,
    GitHubSecurityCliError,
    SECRET_SCANNING_RESOLUTIONS,
)

GLOBAL_FLAG_OPTIONS = {"--json"}
GLOBAL_VALUE_OPTIONS = {
    "--api-base-url",
    "--repo",
    "--repository",
    "--token-env",
    "--web-base-url",
}


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments."""

    parser = argparse.ArgumentParser(
        description=(
            "Inspect and manage GitHub repository security alerts using a token "
            "stored in an environment variable."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--repo",
        default=".",
        help="Path inside the target repository checkout.",
    )
    parser.add_argument(
        "--repository",
        default=None,
        help="Explicit repository in owner/repo format or a GitHub repository URL.",
    )
    parser.add_argument(
        "--api-base-url",
        default=None,
        help="Explicit GitHub API base URL override.",
    )
    parser.add_argument(
        "--web-base-url",
        default=None,
        help="Explicit GitHub web base URL override.",
    )
    parser.add_argument(
        "--token-env",
        action="append",
        dest="token_envs",
        default=None,
        help=(
            "Environment variable name that may contain the GitHub token. "
            "Repeat to provide fallbacks."
        ),
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON instead of human-readable text.",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    summary_parser = subparsers.add_parser(
        "summary",
        help="Fetch a cross-surface summary of repository security alerts.",
    )
    summary_parser.add_argument(
        "--sample-size",
        type=int,
        default=DEFAULT_SUMMARY_SAMPLE_SIZE,
        help="Number of sample alerts to include per alert family.",
    )
    summary_parser.add_argument(
        "--per-page",
        type=int,
        default=DEFAULT_SUMMARY_PAGE_SIZE,
        help="Maximum alerts to inspect per alert family for the summary.",
    )

    subparsers.add_parser(
        "repo-security-overview",
        help="Inspect repository security_and_analysis settings and basic repository metadata.",
    )
    add_export_alerts_parser(subparsers)
    add_bulk_update_alerts_parser(subparsers)
    add_code_scanning_list_parser(subparsers)
    add_code_scanning_show_parser(subparsers)
    add_code_scanning_update_parser(subparsers)
    add_dependabot_list_parser(subparsers)
    add_dependabot_show_parser(subparsers)
    add_dependabot_update_parser(subparsers)
    add_malware_list_parser(subparsers)
    add_malware_show_parser(subparsers)
    add_malware_update_parser(subparsers)
    add_secret_scanning_list_parser(subparsers)
    add_secret_scanning_show_parser(subparsers)
    add_secret_scanning_update_parser(subparsers)
    add_secret_locations_parser(subparsers)
    subparsers.add_parser(
        "secret-scan-history",
        help="Inspect the latest secret scanning scan history for the repository.",
    )
    add_api_call_parser(subparsers)

    return parser.parse_args(normalize_global_argument_order(sys.argv[1:]))


def normalize_global_argument_order(arguments: list[str]) -> list[str]:
    """Allow global options to appear before or after the subcommand."""

    normalized_prefix: list[str] = []
    normalized_suffix: list[str] = []
    index = 0

    while index < len(arguments):
        argument = arguments[index]

        if argument in GLOBAL_FLAG_OPTIONS:
            normalized_prefix.append(argument)
            index += 1
            continue

        if argument in GLOBAL_VALUE_OPTIONS:
            if index + 1 >= len(arguments):
                raise GitHubSecurityCliError(
                    f"Expected a value after global option '{argument}'."
                )
            normalized_prefix.extend([argument, arguments[index + 1]])
            index += 2
            continue

        normalized_suffix.append(argument)
        index += 1

    return [*normalized_prefix, *normalized_suffix]


def add_export_alerts_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "export-alerts",
        help="Export full alert collections across supported GitHub security surfaces.",
    )
    parser.add_argument(
        "--per-page",
        type=int,
        default=DEFAULT_SUMMARY_PAGE_SIZE,
        help="Maximum number of alerts to request from each alert family.",
    )
    parser.add_argument(
        "--code-scanning-state",
        default=None,
        help="Optional code scanning state filter.",
    )
    parser.add_argument(
        "--dependabot-state",
        default=None,
        help="Optional Dependabot state filter.",
    )
    parser.add_argument(
        "--secret-scanning-state",
        default=None,
        help="Optional secret scanning state filter.",
    )
    parser.add_argument(
        "--show-secret-values",
        action="store_true",
        help="Do not request secret redaction for secret scanning exports.",
    )


def add_bulk_update_alerts_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "bulk-update-alerts",
        help="Bulk dismiss, reopen, resolve, or assign alerts across one security surface.",
    )
    parser.add_argument(
        "--surface",
        required=True,
        choices=(
            "code-scanning",
            "dependabot",
            "malware",
            "secret-scanning",
        ),
        help="Alert surface to target.",
    )
    parser.add_argument(
        "--alert",
        action="append",
        dest="alerts",
        type=int,
        default=None,
        help="Explicit alert number to update. Repeat for multiple alerts.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of matched alerts to update.",
    )
    parser.add_argument(
        "--select-state",
        default=None,
        help="Current-state filter used when selecting alerts by query.",
    )
    parser.add_argument(
        "--severity",
        default=None,
        help="Severity filter for code scanning or Dependabot selection.",
    )
    parser.add_argument(
        "--assignee-filter",
        default=None,
        help="Assignee filter used during alert selection.",
    )
    parser.add_argument(
        "--target-state",
        default=None,
        help="Desired new state. When omitted, assignment-only changes reuse each alert's current state.",
    )
    parser.add_argument(
        "--dismissed-reason",
        default=None,
        help="Dismissal reason for code scanning, Dependabot, or malware alerts.",
    )
    parser.add_argument(
        "--resolution",
        default=None,
        help="Resolution when bulk-resolving secret scanning alerts.",
    )
    parser.add_argument(
        "--comment",
        default=None,
        help="Optional dismissal or resolution comment.",
    )
    parser.add_argument(
        "--assignee",
        action="append",
        dest="assignees",
        default=None,
        help="Assignee login to apply. Repeat where the surface supports multiple assignees.",
    )
    parser.add_argument(
        "--clear-assignees",
        action="store_true",
        help="Remove all assignees, or unassign for secret scanning.",
    )
    parser.add_argument(
        "--create-request",
        action="store_true",
        help="Request a dismissal request when bulk-updating code scanning alerts.",
    )
    parser.add_argument(
        "--skip-malware-check",
        action="store_true",
        help="Skip malware advisory verification when the surface is malware.",
    )
    parser.add_argument(
        "--show-secret-values",
        action="store_true",
        help="Do not request secret redaction when selecting secret scanning alerts.",
    )
    parser.add_argument(
        "--tool-name",
        default=None,
        help="Code scanning tool-name filter.",
    )
    parser.add_argument(
        "--tool-guid",
        default=None,
        help="Code scanning tool-GUID filter.",
    )
    parser.add_argument(
        "--ref",
        default=None,
        help="Code scanning ref filter.",
    )
    parser.add_argument(
        "--pr",
        type=int,
        default=None,
        help="Code scanning pull-request filter.",
    )
    parser.add_argument(
        "--ecosystem",
        default=None,
        help="Dependabot or malware ecosystem filter.",
    )
    parser.add_argument(
        "--package",
        default=None,
        help="Dependabot or malware package-name filter.",
    )
    parser.add_argument(
        "--manifest",
        default=None,
        help="Dependabot or malware manifest-path filter.",
    )
    parser.add_argument(
        "--epss-percentage",
        default=None,
        help="Dependabot or malware EPSS filter.",
    )
    parser.add_argument(
        "--has",
        dest="has_filter",
        default=None,
        help="Dependabot or malware has-filter, for example patch.",
    )
    parser.add_argument(
        "--scope",
        default=None,
        help="Dependabot or malware dependency-scope filter.",
    )
    parser.add_argument(
        "--before",
        default=None,
        help="Dependabot or malware cursor filter.",
    )
    parser.add_argument(
        "--after",
        default=None,
        help="Dependabot or malware cursor filter.",
    )
    parser.add_argument(
        "--secret-type",
        default=None,
        help="Secret scanning secret-type filter.",
    )
    parser.add_argument(
        "--resolution-filter",
        default=None,
        help="Secret scanning current-resolution filter.",
    )
    parser.add_argument(
        "--validity",
        default=None,
        help="Secret scanning validity filter.",
    )
    parser.add_argument(
        "--is-publicly-leaked",
        action="store_true",
        help="Filter secret scanning alerts to publicly leaked ones.",
    )
    parser.add_argument(
        "--is-multi-repo",
        action="store_true",
        help="Filter secret scanning alerts to multi-repo ones.",
    )
    parser.add_argument(
        "--sort",
        default=None,
        help="Surface-specific sort field.",
    )
    parser.add_argument(
        "--direction",
        default=None,
        help="Surface-specific sort direction.",
    )
    parser.add_argument(
        "--page",
        type=int,
        default=1,
        help="Surface-specific page number for code or secret scanning selection.",
    )
    parser.add_argument(
        "--per-page",
        type=int,
        default=DEFAULT_SUMMARY_PAGE_SIZE,
        help="Maximum number of alerts to request during selection.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show the selected alerts and planned payload without mutating anything.",
    )


def add_code_scanning_common_filters(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--tool-name", default=None, help="Filter by tool name."
    )
    parser.add_argument(
        "--tool-guid", default=None, help="Filter by tool GUID."
    )
    parser.add_argument("--state", default=None, help="Alert state filter.")
    parser.add_argument("--severity", default=None, help="Severity filter.")
    parser.add_argument("--assignees", default=None, help="Assignee filter.")
    parser.add_argument("--ref", default=None, help="Git ref filter.")
    parser.add_argument(
        "--pr", type=int, default=None, help="Pull request number filter."
    )
    parser.add_argument("--sort", default=None, help="Sort field.")
    parser.add_argument("--direction", default=None, help="Sort direction.")
    parser.add_argument("--page", type=int, default=1, help="Page number.")
    parser.add_argument(
        "--per-page",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Number of alerts per page.",
    )


def add_code_scanning_list_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "list-code-scanning",
        help="List code scanning alerts for a repository.",
    )
    add_code_scanning_common_filters(parser)


def add_code_scanning_show_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "show-code-scanning",
        help="Show one code scanning alert, optionally with instances and autofix status.",
    )
    parser.add_argument(
        "--alert", required=True, type=int, help="Code scanning alert number."
    )
    parser.add_argument(
        "--include-instances",
        action="store_true",
        help="Also fetch alert instances.",
    )
    parser.add_argument(
        "--include-autofix",
        action="store_true",
        help="Also fetch autofix status.",
    )
    parser.add_argument(
        "--instances-per-page",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Instances page size when --include-instances is used.",
    )


def add_code_scanning_update_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "update-code-scanning",
        help="Dismiss, reopen, or reassign a code scanning alert.",
    )
    parser.add_argument(
        "--alert", required=True, type=int, help="Code scanning alert number."
    )
    parser.add_argument(
        "--state",
        required=True,
        choices=("open", "dismissed"),
        help="Desired alert state.",
    )
    parser.add_argument(
        "--dismissed-reason",
        default=None,
        choices=CODE_SCANNING_DISMISS_REASONS,
        help="Dismissal reason when state is dismissed.",
    )
    parser.add_argument(
        "--comment", default=None, help="Optional dismissal comment."
    )
    parser.add_argument(
        "--assignee",
        action="append",
        dest="assignees",
        default=None,
        help="Assignee login to apply. Repeat for multiple assignees.",
    )
    parser.add_argument(
        "--clear-assignees",
        action="store_true",
        help="Remove all assignees.",
    )
    parser.add_argument(
        "--create-request",
        action="store_true",
        help="Ask GitHub to create an alert dismissal request when supported.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )


def add_dependabot_common_filters(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--state", default=None, help="Alert state filter.")
    parser.add_argument("--severity", default=None, help="Severity filter.")
    parser.add_argument("--ecosystem", default=None, help="Ecosystem filter.")
    parser.add_argument("--package", default=None, help="Package-name filter.")
    parser.add_argument(
        "--manifest", default=None, help="Manifest-path filter."
    )
    parser.add_argument("--epss-percentage", default=None, help="EPSS filter.")
    parser.add_argument(
        "--has",
        dest="has_filter",
        default=None,
        help="Has filter, for example patch.",
    )
    parser.add_argument("--assignee", default=None, help="Assignee filter.")
    parser.add_argument(
        "--scope", default=None, help="Dependency scope filter."
    )
    parser.add_argument("--sort", default=None, help="Sort field.")
    parser.add_argument("--direction", default=None, help="Sort direction.")
    parser.add_argument(
        "--before", default=None, help="Cursor for the previous page."
    )
    parser.add_argument(
        "--after", default=None, help="Cursor for the next page."
    )
    parser.add_argument(
        "--per-page",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Number of alerts per page.",
    )


def add_dependabot_list_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "list-dependabot",
        help="List Dependabot alerts for a repository.",
    )
    add_dependabot_common_filters(parser)


def add_dependabot_show_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "show-dependabot", help="Show one Dependabot alert."
    )
    parser.add_argument(
        "--alert", required=True, type=int, help="Dependabot alert number."
    )


def add_dependabot_update_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "update-dependabot",
        help="Dismiss, reopen, or reassign a Dependabot alert.",
    )
    parser.add_argument(
        "--alert", required=True, type=int, help="Dependabot alert number."
    )
    parser.add_argument(
        "--state",
        required=True,
        choices=("open", "dismissed"),
        help="Desired alert state.",
    )
    parser.add_argument(
        "--dismissed-reason",
        default=None,
        choices=DEPENDABOT_DISMISS_REASONS,
        help="Dismissal reason when state is dismissed.",
    )
    parser.add_argument(
        "--comment", default=None, help="Optional dismissal comment."
    )
    parser.add_argument(
        "--assignee",
        action="append",
        dest="assignees",
        default=None,
        help="Assignee login to apply. Repeat for multiple assignees.",
    )
    parser.add_argument(
        "--clear-assignees",
        action="store_true",
        help="Remove all assignees.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )


def add_malware_list_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "list-malware",
        help="List Dependabot malware alerts for a repository.",
    )
    add_dependabot_common_filters(parser)


def add_malware_show_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "show-malware",
        help="Show one malware alert, backed by a Dependabot alert whose advisory type is malware.",
    )
    parser.add_argument(
        "--alert", required=True, type=int, help="Alert number."
    )


def add_malware_update_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "update-malware",
        help="Dismiss, reopen, or reassign a malware alert via the Dependabot alert API.",
    )
    parser.add_argument(
        "--alert", required=True, type=int, help="Alert number."
    )
    parser.add_argument(
        "--state",
        required=True,
        choices=("open", "dismissed"),
        help="Desired alert state.",
    )
    parser.add_argument(
        "--dismissed-reason",
        default=None,
        choices=DEPENDABOT_DISMISS_REASONS,
        help="Dismissal reason when state is dismissed.",
    )
    parser.add_argument(
        "--comment", default=None, help="Optional dismissal comment."
    )
    parser.add_argument(
        "--assignee",
        action="append",
        dest="assignees",
        default=None,
        help="Assignee login to apply. Repeat for multiple assignees.",
    )
    parser.add_argument(
        "--clear-assignees",
        action="store_true",
        help="Remove all assignees.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )
    parser.add_argument(
        "--skip-malware-check",
        action="store_true",
        help="Apply the update without verifying the alert maps to a malware advisory.",
    )


def add_secret_scanning_common_filters(
    parser: argparse.ArgumentParser,
) -> None:
    parser.add_argument("--state", default=None, help="Alert state filter.")
    parser.add_argument(
        "--secret-type", default=None, help="Secret type filter."
    )
    parser.add_argument(
        "--resolution", default=None, help="Resolution filter."
    )
    parser.add_argument("--assignee", default=None, help="Assignee filter.")
    parser.add_argument("--validity", default=None, help="Validity filter.")
    parser.add_argument(
        "--is-publicly-leaked",
        action="store_true",
        help="Filter to publicly leaked alerts.",
    )
    parser.add_argument(
        "--is-multi-repo",
        action="store_true",
        help="Filter to multi-repo alerts.",
    )
    parser.add_argument("--sort", default=None, help="Sort field.")
    parser.add_argument("--direction", default=None, help="Sort direction.")
    parser.add_argument("--page", type=int, default=1, help="Page number.")
    parser.add_argument(
        "--per-page",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Number of alerts per page.",
    )
    parser.add_argument(
        "--show-secret-values",
        action="store_true",
        help="Do not request secret redaction from the API.",
    )


def add_secret_scanning_list_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "list-secret-scanning",
        help="List secret scanning alerts for a repository.",
    )
    add_secret_scanning_common_filters(parser)


def add_secret_scanning_show_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "show-secret-scanning", help="Show one secret scanning alert."
    )
    parser.add_argument(
        "--alert",
        required=True,
        type=int,
        help="Secret scanning alert number.",
    )
    parser.add_argument(
        "--show-secret-values",
        action="store_true",
        help="Do not request secret redaction from the API.",
    )


def add_secret_scanning_update_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "update-secret-scanning",
        help="Resolve, reopen, or reassign a secret scanning alert.",
    )
    parser.add_argument(
        "--alert",
        required=True,
        type=int,
        help="Secret scanning alert number.",
    )
    parser.add_argument(
        "--state",
        required=True,
        choices=("open", "resolved"),
        help="Desired alert state.",
    )
    parser.add_argument(
        "--resolution",
        default=None,
        choices=SECRET_SCANNING_RESOLUTIONS,
        help="Resolution when state is resolved.",
    )
    parser.add_argument(
        "--comment", default=None, help="Optional resolution comment."
    )
    parser.add_argument(
        "--assignee",
        default=None,
        help="Assign the alert to this user login.",
    )
    parser.add_argument(
        "--unassign",
        action="store_true",
        help="Remove the current assignee.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the intended mutation without sending it.",
    )


def add_secret_locations_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "list-secret-locations",
        help="List all known locations for a secret scanning alert.",
    )
    parser.add_argument(
        "--alert",
        required=True,
        type=int,
        help="Secret scanning alert number.",
    )
    parser.add_argument("--page", type=int, default=1, help="Page number.")
    parser.add_argument(
        "--per-page",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Number of locations per page.",
    )


def add_api_call_parser(
    subparsers: argparse._SubParsersAction[argparse.ArgumentParser],
) -> None:
    parser = subparsers.add_parser(
        "api-call",
        help="Raw GitHub API fallback for anything not wrapped yet.",
    )
    parser.add_argument(
        "--endpoint",
        required=True,
        help="API endpoint path, for example /repos/OWNER/REPO/code-scanning/default-setup.",
    )
    parser.add_argument("--method", default="GET", help="HTTP method.")
    parser.add_argument(
        "--query-param",
        action="append",
        dest="query_params",
        default=None,
        help="Query parameter in key=value form. Repeat for multiple parameters.",
    )
    parser.add_argument(
        "--body-json",
        default=None,
        help="Optional JSON request body for POST, PATCH, or PUT operations.",
    )
