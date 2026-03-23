from __future__ import annotations

import json
from typing import Any

from github_security_common import expect_dict


def render_text(command: str, payload: Any) -> str:
    """Render command output as human-readable text."""

    if command == "summary":
        return render_summary(payload)
    if command == "repo-security-overview":
        return render_repo_security_overview(payload)
    if command == "bulk-update-alerts":
        return render_json_like(payload)
    if command == "list-code-scanning":
        return render_code_scanning_list(payload)
    if command == "show-code-scanning":
        return render_json_like(payload)
    if command == "update-code-scanning":
        return render_update_result(payload)
    if command == "list-dependabot":
        return render_dependabot_list(payload)
    if command == "show-dependabot":
        return render_json_like(payload)
    if command == "update-dependabot":
        return render_update_result(payload)
    if command == "list-malware":
        return render_dependabot_list(
            payload, heading="Dependabot malware alerts"
        )
    if command == "show-malware":
        return render_json_like(payload)
    if command == "update-malware":
        return render_update_result(payload)
    if command == "list-secret-scanning":
        return render_secret_scanning_list(payload)
    if command == "show-secret-scanning":
        return render_json_like(payload)
    if command == "update-secret-scanning":
        return render_update_result(payload)
    if command == "list-secret-locations":
        return render_secret_locations(payload)
    if command == "secret-scan-history":
        return render_json_like(payload)
    if command == "export-alerts":
        return render_json_like(payload)
    if command == "api-call":
        return render_json_like(payload)

    return render_json_like(payload)


def emit_output(payload: Any, *, as_json: bool, command: str) -> None:
    """Print output in JSON or text form."""

    if as_json:
        print(json.dumps(payload, indent=2, sort_keys=True))
        return

    text_payload = payload
    if command == "list-malware" and isinstance(payload, dict):
        text_payload = payload.get("alerts", [])
    print(render_text(command, text_payload))
    if (
        command == "list-malware"
        and isinstance(payload, dict)
        and payload.get("lookup_failures")
    ):
        print("\nMalware advisory lookup failures:")
        print(json.dumps(payload["lookup_failures"], indent=2, sort_keys=True))


def render_summary(payload: dict[str, Any]) -> str:
    """Render a repository security summary."""

    lines = [
        f"Repository: {payload['full_name']}",
        f"Repository URL: {payload['repository_html_url']}",
        f"API base URL: {payload['api_base_url']}",
        f"Token environment variable: {payload['token_env']}",
        "",
        "Sections:",
    ]

    for section_name in (
        "code_scanning",
        "dependabot",
        "malware",
        "secret_scanning",
    ):
        section = payload["sections"][section_name]
        pretty_name = section_name.replace("_", " ")
        lines.append(f"- {pretty_name}:")
        if not section.get("ok"):
            error_payload = section.get("error", {})
            lines.append(
                "  status: unavailable "
                f"({error_payload.get('status_code', 'n/a')}) "
                f"{error_payload.get('message', 'unknown error')}"
            )
            continue

        counts = section.get("counts_by_state", {})
        lines.append(f"  total: {section.get('total', 0)}")
        if counts:
            lines.append(
                "  counts: "
                + ", ".join(
                    f"{state}={count}"
                    for state, count in sorted(counts.items())
                )
            )
        samples = section.get("sample_alerts", [])
        if samples:
            lines.append("  samples:")
            for alert in samples:
                lines.append(
                    f"    - {render_alert_brief(alert, section_name)}"
                )
        lookup_failures = section.get("lookup_failures")
        if lookup_failures:
            lines.append(
                f"  malware-type lookup failures: {len(lookup_failures)}"
            )

    return "\n".join(lines)


def render_repo_security_overview(payload: dict[str, Any]) -> str:
    """Render repository settings overview."""

    lines = [
        f"Repository: {payload['full_name']}",
        f"Repository URL: {payload.get('html_url')}",
        f"Visibility: {payload.get('visibility')}",
        f"Private: {payload.get('private')}",
        f"API base URL: {payload['api_base_url']}",
        "",
        "security_and_analysis:",
        json.dumps(
            payload.get("security_and_analysis"), indent=2, sort_keys=True
        ),
    ]
    return "\n".join(lines)


def render_code_scanning_list(alerts: list[dict[str, Any]]) -> str:
    """Render code scanning alerts as lines of text."""

    return render_alert_list(
        alerts, heading="Code scanning alerts", kind="code_scanning"
    )


def render_dependabot_list(
    alerts: list[dict[str, Any]],
    *,
    heading: str = "Dependabot alerts",
) -> str:
    """Render Dependabot alerts as lines of text."""

    return render_alert_list(alerts, heading=heading, kind="dependabot")


def render_secret_scanning_list(alerts: list[dict[str, Any]]) -> str:
    """Render secret scanning alerts as lines of text."""

    return render_alert_list(
        alerts, heading="Secret scanning alerts", kind="secret_scanning"
    )


def render_secret_locations(locations: list[dict[str, Any]]) -> str:
    """Render secret scanning locations."""

    if not locations:
        return "No secret locations found."

    lines = ["Secret scanning alert locations:"]
    for location in locations:
        location_type = location.get("type", "unknown")
        details = location.get("details")
        if isinstance(details, dict):
            lines.append(
                f"- {location_type}: {json.dumps(details, sort_keys=True)}"
            )
        else:
            lines.append(f"- {location_type}: {details}")

    return "\n".join(lines)


def render_alert_list(
    alerts: list[dict[str, Any]], *, heading: str, kind: str
) -> str:
    """Render a generic alert list with one alert per line."""

    if not alerts:
        return f"{heading}: none"

    lines = [f"{heading} ({len(alerts)}):"]
    for alert in alerts:
        lines.append(f"- {render_alert_brief(alert, kind)}")
    return "\n".join(lines)


def render_alert_brief(alert: dict[str, Any], kind: str) -> str:
    """Create a one-line summary for one alert."""

    number = alert.get("number", "?")
    state = alert.get("state", "unknown")
    html_url = alert.get("html_url")

    if kind == "code_scanning":
        rule = (
            expect_dict(alert.get("rule") or {}, "code scanning rule")
            if alert.get("rule") is not None
            else {}
        )
        instance = (
            expect_dict(
                alert.get("most_recent_instance") or {},
                "code scanning instance",
            )
            if alert.get("most_recent_instance") is not None
            else {}
        )
        location = (
            expect_dict(
                instance.get("location") or {}, "code scanning location"
            )
            if instance.get("location") is not None
            else {}
        )
        severity = (
            rule.get("security_severity_level")
            or rule.get("severity")
            or "unknown"
        )
        rule_name = rule.get("id") or rule.get("name") or "unknown-rule"
        path = location.get("path") or "<unknown-path>"
        return (
            f"#{number} [{state}] severity={severity} rule={rule_name} "
            f"path={path} url={html_url}"
        )

    if kind in {"dependabot", "malware"}:
        vulnerability = (
            expect_dict(
                alert.get("security_vulnerability") or {},
                "Dependabot vulnerability",
            )
            if alert.get("security_vulnerability") is not None
            else {}
        )
        package = (
            expect_dict(
                vulnerability.get("package") or {}, "Dependabot package"
            )
            if vulnerability.get("package") is not None
            else {}
        )
        dependency = (
            expect_dict(alert.get("dependency") or {}, "Dependabot dependency")
            if alert.get("dependency") is not None
            else {}
        )
        severity = (
            vulnerability.get("severity") or alert.get("state") or "unknown"
        )
        if package.get("name") is not None:
            package_name = package.get("name")
        elif isinstance(dependency.get("package"), dict):
            package_name = dependency["package"].get("name")
        else:
            package_name = None
        manifest_path = dependency.get("manifest_path") or "<unknown-manifest>"
        ghsa_id = (
            alert.get("security_advisory", {}).get("ghsa_id")
            if isinstance(alert.get("security_advisory"), dict)
            else None
        )
        ghsa_id = ghsa_id or "unknown-ghsa"
        malware_suffix = " malware" if kind == "malware" else ""
        return (
            f"#{number} [{state}] severity={severity} package={package_name} "
            f"manifest={manifest_path} ghsa={ghsa_id}{malware_suffix} url={html_url}"
        )

    if kind == "secret_scanning":
        secret_type = alert.get("secret_type") or "unknown-secret-type"
        resolution = alert.get("resolution") or "unresolved"
        validity = alert.get("validity") or "unknown"
        leaked = alert.get("publicly_leaked")
        return (
            f"#{number} [{state}] secret_type={secret_type} resolution={resolution} "
            f"validity={validity} publicly_leaked={leaked} url={html_url}"
        )

    return f"#{number} [{state}] url={html_url}"


def render_update_result(payload: dict[str, Any]) -> str:
    """Render dry-run or mutation results."""

    if payload.get("dry_run"):
        return "Dry run:\n" + json.dumps(payload, indent=2, sort_keys=True)

    return json.dumps(payload, indent=2, sort_keys=True)


def render_json_like(payload: Any) -> str:
    """Render arbitrary payloads as pretty JSON."""

    return json.dumps(payload, indent=2, sort_keys=True)
