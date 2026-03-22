from __future__ import annotations

import json
from typing import Any


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
        name = payload.get("name") or quality_gate.get("name")
        if not isinstance(name, str):
            nested = quality_gate.get("qualityGate")
            if isinstance(nested, dict):
                nested_name = nested.get("name")
                if isinstance(nested_name, str):
                    name = nested_name
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
