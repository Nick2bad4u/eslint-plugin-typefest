from __future__ import annotations

from typing import Any

DEFAULT_PAGE_SIZE = 30
DEFAULT_SUMMARY_PAGE_SIZE = 100
DEFAULT_SUMMARY_SAMPLE_SIZE = 3

CODE_SCANNING_DISMISS_REASONS = (
    "false positive",
    "won't fix",
    "used in tests",
)
DEPENDABOT_DISMISS_REASONS = (
    "fix_started",
    "inaccurate",
    "no_bandwidth",
    "not_used",
    "tolerable_risk",
)
SECRET_SCANNING_RESOLUTIONS = (
    "false_positive",
    "wont_fix",
    "revoked",
    "pattern_edited",
    "pattern_deleted",
    "used_in_tests",
)


class GitHubSecurityCliError(RuntimeError):
    """Raised when the helper cannot complete the requested operation."""


def parse_name_value_pairs(pairs: list[str] | None) -> dict[str, str]:
    """Parse repeated key=value CLI inputs into a mapping."""

    result: dict[str, str] = {}

    for pair in pairs or []:
        if "=" not in pair:
            raise GitHubSecurityCliError(
                f"Expected key=value input but received '{pair}'."
            )
        key, value = pair.split("=", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            raise GitHubSecurityCliError(
                f"Expected non-empty key in '{pair}'."
            )
        result[key] = value

    return result


def filter_non_null_values(values: dict[str, Any]) -> dict[str, Any]:
    """Remove null values from a mapping."""

    return {key: value for key, value in values.items() if value is not None}


def normalize_repeated_values(values: list[str] | None) -> list[str]:
    """Deduplicate repeated CLI values while preserving order."""

    deduped_values: list[str] = []
    seen_values: set[str] = set()

    for value in values or []:
        for candidate in [
            item.strip() for item in value.split(",") if item.strip()
        ]:
            if candidate in seen_values:
                continue
            seen_values.add(candidate)
            deduped_values.append(candidate)

    return deduped_values


def expect_dict(value: Any, label: str) -> dict[str, Any]:
    """Require a dictionary-shaped API payload."""

    if not isinstance(value, dict):
        raise GitHubSecurityCliError(
            f"Expected {label} payload to be an object but received {type(value).__name__}."
        )

    return value


def expect_list(value: Any, label: str) -> list[dict[str, Any]]:
    """Require a list-of-dicts API payload."""

    if not isinstance(value, list):
        raise GitHubSecurityCliError(
            f"Expected {label} payload to be a list but received {type(value).__name__}."
        )

    result: list[dict[str, Any]] = []
    for item in value:
        result.append(expect_dict(item, label))
    return result
