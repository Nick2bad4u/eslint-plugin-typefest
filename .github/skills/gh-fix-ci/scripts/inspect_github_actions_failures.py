#!/usr/bin/env python3
"""Inspect failing GitHub Actions workflow runs or PR checks for any repo."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from shutil import which
from typing import Any, Iterable, Sequence

FAILURE_CONCLUSIONS = {
    "failure",
    "cancelled",
    "timed_out",
    "action_required",
}

FAILURE_STATES = {
    "failure",
    "error",
    "cancelled",
    "timed_out",
    "action_required",
}

FAILURE_BUCKETS = {"fail"}

STRONG_FAILURE_LINE_PATTERNS = (
    re.compile(r"##\[error\]", re.IGNORECASE),
    re.compile(r"\bprocess completed with exit code\s+[1-9]\d*\b", re.IGNORECASE),
    re.compile(r"\bno coverage reports found\b", re.IGNORECASE),
    re.compile(r"\bfailed to run\b", re.IGNORECASE),
    re.compile(r"\btraceback\b", re.IGNORECASE),
    re.compile(r"\bexception\b", re.IGNORECASE),
    re.compile(r"\bpanic\b", re.IGNORECASE),
    re.compile(r"\bfatal\b", re.IGNORECASE),
    re.compile(r"\bsegmentation fault\b", re.IGNORECASE),
    re.compile(r"\btimeout\b", re.IGNORECASE),
    re.compile(r"\bassert(?:ion)?\b", re.IGNORECASE),
)

WEAK_FAILURE_LINE_PATTERNS = (
    re.compile(r"\b(?:error|failed?|failure)\b", re.IGNORECASE),
)

NON_FAILURE_LINE_PATTERNS = (
    re.compile(r"\berror\s*=\s*none\b", re.IGNORECASE),
    re.compile(r"requestresult\(error=none", re.IGNORECASE),
    re.compile(r"\bstatus_code\s*=\s*20\d\b", re.IGNORECASE),
    re.compile(r"--fail-on-error\b", re.IGNORECASE),
)

DEFAULT_MAX_LINES = 160
DEFAULT_CONTEXT_LINES = 30
PENDING_LOG_MARKERS = (
    "still in progress",
    "log will be available when it is complete",
)


class GhResult:
    def __init__(self, returncode: int, stdout: str, stderr: str):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


def run_gh_command(args: Sequence[str], cwd: Path) -> GhResult:
    process = subprocess.run(
        ["gh", *args],
        cwd=cwd,
        text=True,
        capture_output=True,
    )
    return GhResult(process.returncode, process.stdout, process.stderr)


def run_gh_command_raw(args: Sequence[str], cwd: Path) -> tuple[int, bytes, str]:
    process = subprocess.run(
        ["gh", *args],
        cwd=cwd,
        capture_output=True,
    )
    stderr = process.stderr.decode(errors="replace")
    return process.returncode, process.stdout, stderr


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Inspect failing GitHub Actions PR checks or workflow runs,\n"
            "fetch GitHub Actions logs, and extract a "
            "failure snippet."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--repo", default=".", help="Path inside the target Git repository."
    )
    target_group = parser.add_mutually_exclusive_group()
    target_group.add_argument(
        "--pr",
        default=None,
        help="PR number or URL (defaults to current branch PR).",
    )
    target_group.add_argument(
        "--run",
        default=None,
        help=(
            "Workflow run id or URL "
            "(for example, https://github.com/org/repo/actions/runs/123)."
        ),
    )
    parser.add_argument("--max-lines", type=int, default=DEFAULT_MAX_LINES)
    parser.add_argument("--context", type=int, default=DEFAULT_CONTEXT_LINES)
    parser.add_argument(
        "--json", action="store_true", help="Emit JSON instead of text output."
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = find_git_root(Path(args.repo))
    if repo_root is None:
        print("Error: not inside a Git repository.", file=sys.stderr)
        return 1

    if not ensure_gh_available(repo_root):
        return 1

    if args.run:
        return inspect_run_failure(
            run_value=args.run,
            repo_root=repo_root,
            max_lines=max(1, args.max_lines),
            context=max(1, args.context),
            emit_json=args.json,
        )

    pr_value = resolve_pr(args.pr, repo_root)
    if pr_value is None:
        return 1

    checks = fetch_checks(pr_value, repo_root)
    if checks is None:
        return 1

    failing = [c for c in checks if is_failing(c)]
    if not failing:
        print(f"PR #{pr_value}: no failing checks detected.")
        return 0

    results = []
    for check in failing:
        results.append(
            analyze_check(
                check,
                repo_root=repo_root,
                max_lines=max(1, args.max_lines),
                context=max(1, args.context),
            )
        )

    if args.json:
        print(json.dumps({"pr": pr_value, "results": results}, indent=2))
    else:
        render_results(pr_value, results)

    return 1


def inspect_run_failure(
    run_value: str,
    repo_root: Path,
    max_lines: int,
    context: int,
    emit_json: bool,
) -> int:
    run_id = resolve_run(run_value)
    if run_id is None:
        return 1

    requested_job_id = extract_job_id(run_value)
    run_metadata = fetch_run_metadata(run_id, repo_root) or {}
    jobs = fetch_run_jobs(run_id, repo_root)
    if jobs is None:
        return 1

    if requested_job_id is not None:
        selected_jobs = [
            job for job in jobs if str(job.get("id") or "") == requested_job_id
        ]
        if not selected_jobs:
            print(
                f"Error: job {requested_job_id} was not found in workflow run {run_id}.",
                file=sys.stderr,
            )
            return 1
    else:
        selected_jobs = [job for job in jobs if is_failing(job)]
        if not selected_jobs:
            print(f"Workflow run {run_id}: no failing jobs detected.")
            return 0

    results = [
        analyze_job(
            job,
            run_id=run_id,
            repo_root=repo_root,
            max_lines=max_lines,
            context=context,
            run_metadata=run_metadata,
        )
        for job in selected_jobs
    ]

    if emit_json:
        print(
            json.dumps(
                {
                    "mode": "run",
                    "run": {
                        "input": run_value,
                        "runId": run_id,
                        "jobId": requested_job_id,
                        "metadata": run_metadata,
                    },
                    "results": results,
                },
                indent=2,
            )
        )
    else:
        render_run_results(
            run_id=run_id,
            results=results,
            run_metadata=run_metadata,
            requested_job_id=requested_job_id,
        )

    return 1 if any(is_failing(job) for job in selected_jobs) else 0


def find_git_root(start: Path) -> Path | None:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=start,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        return None
    return Path(result.stdout.strip())


def ensure_gh_available(repo_root: Path) -> bool:
    if which("gh") is None:
        print("Error: gh is not installed or not on PATH.", file=sys.stderr)
        return False
    result = run_gh_command(["auth", "status"], cwd=repo_root)
    if result.returncode == 0:
        return True
    message = (result.stderr or result.stdout or "").strip()
    print(message or "Error: gh not authenticated.", file=sys.stderr)
    return False


def resolve_pr(pr_value: str | None, repo_root: Path) -> str | None:
    if pr_value:
        return pr_value
    result = run_gh_command(["pr", "view", "--json", "number"], cwd=repo_root)
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "").strip()
        print(message or "Error: unable to resolve PR.", file=sys.stderr)
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        print("Error: unable to parse PR JSON.", file=sys.stderr)
        return None
    number = data.get("number")
    if not number:
        print("Error: no PR number found.", file=sys.stderr)
        return None
    return str(number)


def resolve_run(run_value: str) -> str | None:
    extracted_run_id = extract_run_id(run_value)
    if extracted_run_id is not None:
        return extracted_run_id
    print(
        f"Error: unable to resolve a workflow run id from: {run_value}",
        file=sys.stderr,
    )
    return None


def fetch_checks(pr_value: str, repo_root: Path) -> list[dict[str, Any]] | None:
    primary_fields = [
        "name",
        "state",
        "conclusion",
        "detailsUrl",
        "startedAt",
        "completedAt",
    ]
    result = run_gh_command(
        ["pr", "checks", pr_value, "--json", ",".join(primary_fields)],
        cwd=repo_root,
    )
    if result.returncode != 0:
        message = "\n".join(filter(None, [result.stderr, result.stdout])).strip()
        available_fields = parse_available_fields(message)
        if available_fields:
            fallback_fields = [
                "name",
                "state",
                "bucket",
                "link",
                "startedAt",
                "completedAt",
                "workflow",
            ]
            selected_fields = [
                field for field in fallback_fields if field in available_fields
            ]
            if not selected_fields:
                print(
                    "Error: no usable fields available for gh pr checks.",
                    file=sys.stderr,
                )
                return None
            result = run_gh_command(
                ["pr", "checks", pr_value, "--json", ",".join(selected_fields)],
                cwd=repo_root,
            )
            if result.returncode != 0:
                message = (result.stderr or result.stdout or "").strip()
                print(message or "Error: gh pr checks failed.", file=sys.stderr)
                return None
        else:
            print(message or "Error: gh pr checks failed.", file=sys.stderr)
            return None
    try:
        data = json.loads(result.stdout or "[]")
    except json.JSONDecodeError:
        print("Error: unable to parse checks JSON.", file=sys.stderr)
        return None
    if not isinstance(data, list):
        print("Error: unexpected checks JSON shape.", file=sys.stderr)
        return None
    return data


def is_failing(check: dict[str, Any]) -> bool:
    conclusion = normalize_field(check.get("conclusion"))
    if conclusion in FAILURE_CONCLUSIONS:
        return True
    state = normalize_field(check.get("state") or check.get("status"))
    if state in FAILURE_STATES:
        return True
    bucket = normalize_field(check.get("bucket"))
    return bucket in FAILURE_BUCKETS


def fetch_run_jobs(run_id: str, repo_root: Path) -> list[dict[str, Any]] | None:
    repo_slug = fetch_repo_slug(repo_root)
    if not repo_slug:
        print(
            "Error: unable to resolve repository name for workflow jobs.",
            file=sys.stderr,
        )
        return None

    endpoint = f"/repos/{repo_slug}/actions/runs/{run_id}/jobs?per_page=100"
    result = run_gh_command(["api", endpoint], cwd=repo_root)
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "").strip()
        print(
            message or f"Error: unable to fetch jobs for workflow run {run_id}.",
            file=sys.stderr,
        )
        return None

    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        print("Error: unable to parse workflow jobs JSON.", file=sys.stderr)
        return None

    if isinstance(data, dict):
        jobs = data.get("jobs")
        if isinstance(jobs, list):
            return [job for job in jobs if isinstance(job, dict)]

    print("Error: unexpected workflow jobs JSON shape.", file=sys.stderr)
    return None


def analyze_check(
    check: dict[str, Any],
    repo_root: Path,
    max_lines: int,
    context: int,
) -> dict[str, Any]:
    url = check.get("detailsUrl") or check.get("link") or ""
    run_id = extract_run_id(url)
    job_id = extract_job_id(url)
    base: dict[str, Any] = {
        "name": check.get("name", ""),
        "conclusion": check.get("conclusion")
        or check.get("state")
        or check.get("status")
        or check.get("bucket")
        or "",
        "detailsUrl": url,
        "runId": run_id,
        "jobId": job_id,
    }

    if run_id is None:
        base["status"] = "external"
        base["note"] = "No GitHub Actions run id detected in detailsUrl."
        return base

    metadata = fetch_run_metadata(run_id, repo_root)
    log_text, log_error, log_status = fetch_check_log(
        run_id=run_id,
        job_id=job_id,
        repo_root=repo_root,
    )

    if log_status == "pending":
        base["status"] = "log_pending"
        base["note"] = log_error or "Logs are not available yet."
        if metadata:
            base["run"] = metadata
        return base

    if log_error:
        base["status"] = "log_unavailable"
        base["error"] = log_error
        if metadata:
            base["run"] = metadata
        return base

    snippet = extract_failure_snippet(log_text, max_lines=max_lines, context=context)
    base["status"] = "ok"
    base["run"] = metadata or {}
    base["logSnippet"] = snippet
    base["logTail"] = tail_lines(log_text, max_lines)
    return base


def analyze_job(
    job: dict[str, Any],
    run_id: str,
    repo_root: Path,
    max_lines: int,
    context: int,
    run_metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    job_id_value = job.get("id")
    job_id = str(job_id_value) if job_id_value is not None else None
    base: dict[str, Any] = {
        "name": job.get("name", ""),
        "conclusion": job.get("conclusion") or job.get("status") or "",
        "detailsUrl": job.get("html_url") or "",
        "runId": run_id,
        "jobId": job_id,
    }

    if run_metadata:
        base["run"] = run_metadata

    if job_id is None:
        base["status"] = "log_unavailable"
        base["error"] = "No GitHub Actions job id detected."
        return base

    log_text, log_error = fetch_job_log(job_id, repo_root)
    if not log_error:
        snippet = extract_failure_snippet(
            log_text, max_lines=max_lines, context=context
        )
        base["status"] = "ok"
        base["logSnippet"] = snippet
        base["logTail"] = tail_lines(log_text, max_lines)
        return base

    if is_log_pending_message(log_error):
        base["status"] = "log_pending"
        base["note"] = log_error or "Logs are not available yet."
        return base

    run_log_text, run_log_error = fetch_run_log(run_id, repo_root)
    if not run_log_error and run_log_text:
        snippet = extract_failure_snippet(
            run_log_text, max_lines=max_lines, context=context
        )
        base["status"] = "ok"
        base["note"] = (
            "Using the full workflow run log because the job-specific log "
            "was unavailable."
        )
        base["logSnippet"] = snippet
        base["logTail"] = tail_lines(run_log_text, max_lines)
        return base

    base["status"] = "log_unavailable"
    base["error"] = log_error
    if run_log_error and run_log_error != log_error:
        base["note"] = f"Run-log fallback also failed: {run_log_error}"
    return base


def extract_run_id(url: str) -> str | None:
    if not url:
        return None
    if url.isdigit():
        return url
    for pattern in (r"/actions/runs/(\d+)", r"/runs/(\d+)"):
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def extract_job_id(url: str) -> str | None:
    if not url:
        return None
    match = re.search(r"/actions/runs/\d+/job/(\d+)", url)
    if match:
        return match.group(1)
    match = re.search(r"/job/(\d+)", url)
    if match:
        return match.group(1)
    return None


def fetch_run_metadata(run_id: str, repo_root: Path) -> dict[str, Any] | None:
    fields = [
        "conclusion",
        "status",
        "workflowName",
        "name",
        "event",
        "headBranch",
        "headSha",
        "url",
    ]
    result = run_gh_command(
        ["run", "view", run_id, "--json", ",".join(fields)], cwd=repo_root
    )
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict):
        return None
    return data


def fetch_check_log(
    run_id: str,
    job_id: str | None,
    repo_root: Path,
) -> tuple[str, str, str]:
    if job_id:
        job_log, job_error = fetch_job_log(job_id, repo_root)
        if not job_error:
            return job_log, "", "ok"

        run_log_text, run_log_error = fetch_run_log(run_id, repo_root)
        if not run_log_error:
            return run_log_text, "", "ok"

        if is_log_pending_message(job_error) or is_log_pending_message(run_log_error):
            return "", job_error or run_log_error, "pending"

        return "", job_error or run_log_error, "error"

    log_text, log_error = fetch_run_log(run_id, repo_root)
    if not log_error:
        return log_text, "", "ok"

    if is_log_pending_message(log_error):
        return "", log_error, "pending"

    return "", log_error, "error"


def fetch_run_log(run_id: str, repo_root: Path) -> tuple[str, str]:
    result = run_gh_command(["run", "view", run_id, "--log"], cwd=repo_root)
    if result.returncode != 0:
        error = (result.stderr or result.stdout or "").strip()
        return "", error or "gh run view failed"
    return result.stdout, ""


def fetch_job_log(job_id: str, repo_root: Path) -> tuple[str, str]:
    repo_slug = fetch_repo_slug(repo_root)
    if not repo_slug:
        return "", "Error: unable to resolve repository name for job logs."
    endpoint = f"/repos/{repo_slug}/actions/jobs/{job_id}/logs"
    returncode, stdout_bytes, stderr = run_gh_command_raw(
        ["api", endpoint], cwd=repo_root
    )
    if returncode != 0:
        message = (stderr or stdout_bytes.decode(errors="replace")).strip()
        return "", message or "gh api job logs failed"
    if is_zip_payload(stdout_bytes):
        return "", "Job logs returned a zip archive; unable to parse."
    return stdout_bytes.decode(errors="replace"), ""


def fetch_repo_slug(repo_root: Path) -> str | None:
    result = run_gh_command(["repo", "view", "--json", "nameWithOwner"], cwd=repo_root)
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        return None
    name_with_owner = data.get("nameWithOwner")
    if not name_with_owner:
        return None
    return str(name_with_owner)


def normalize_field(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip().lower()


def parse_available_fields(message: str) -> list[str]:
    if "Available fields:" not in message:
        return []
    fields: list[str] = []
    collecting = False
    for line in message.splitlines():
        if "Available fields:" in line:
            collecting = True
            continue
        if not collecting:
            continue
        field = line.strip()
        if not field:
            continue
        fields.append(field)
    return fields


def is_log_pending_message(message: str) -> bool:
    lowered = message.lower()
    return any(marker in lowered for marker in PENDING_LOG_MARKERS)


def is_zip_payload(payload: bytes) -> bool:
    return payload.startswith(b"PK")


def extract_failure_snippet(log_text: str, max_lines: int, context: int) -> str:
    lines = log_text.splitlines()
    if not lines:
        return ""

    marker_index = find_failure_index(lines)
    if marker_index is None:
        return "\n".join(lines[-max_lines:])

    start = max(0, marker_index - context)
    end = min(len(lines), marker_index + context + 1)
    window = lines[start:end]
    if len(window) > max_lines:
        window = window[-max_lines:]
    return "\n".join(window)


def find_failure_index(lines: Sequence[str]) -> int | None:
    strong_match_index = find_last_matching_index(lines, STRONG_FAILURE_LINE_PATTERNS)
    if strong_match_index is not None:
        return strong_match_index

    weak_match_index = find_last_matching_index(lines, WEAK_FAILURE_LINE_PATTERNS)
    if weak_match_index is not None:
        return weak_match_index

    return None


def find_last_matching_index(
    lines: Sequence[str],
    patterns: Sequence[re.Pattern[str]],
) -> int | None:
    for idx in range(len(lines) - 1, -1, -1):
        if line_matches_patterns(lines[idx], patterns):
            return idx
    return None


def line_matches_patterns(line: str, patterns: Sequence[re.Pattern[str]]) -> bool:
    if any(pattern.search(line) for pattern in NON_FAILURE_LINE_PATTERNS):
        return False
    return any(pattern.search(line) for pattern in patterns)


def tail_lines(text: str, max_lines: int) -> str:
    if max_lines <= 0:
        return ""
    lines = text.splitlines()
    return "\n".join(lines[-max_lines:])


def render_results(pr_number: str, results: Iterable[dict[str, Any]]) -> None:
    results_list = list(results)
    print(f"PR #{pr_number}: {len(results_list)} failing checks analyzed.")
    for result in results_list:
        print("-" * 60)
        print(f"Check: {result.get('name', '')}")
        if result.get("detailsUrl"):
            print(f"Details: {result['detailsUrl']}")
        run_id = result.get("runId")
        if run_id:
            print(f"Run ID: {run_id}")
        job_id = result.get("jobId")
        if job_id:
            print(f"Job ID: {job_id}")
        conclusion = result.get("conclusion") or ""
        if conclusion:
            print(f"Check conclusion: {conclusion}")
        status = result.get("status", "unknown")
        print(f"Log status: {status}")

        run_meta = result.get("run", {})
        if run_meta:
            branch = run_meta.get("headBranch", "")
            sha = (run_meta.get("headSha") or "")[:12]
            workflow = run_meta.get("workflowName") or run_meta.get("name") or ""
            conclusion = run_meta.get("conclusion") or run_meta.get("status") or ""
            print(f"Workflow: {workflow} ({conclusion})")
            if branch or sha:
                print(f"Branch/SHA: {branch} {sha}")
            if run_meta.get("url"):
                print(f"Run URL: {run_meta['url']}")

        if result.get("note"):
            print(f"Note: {result['note']}")

        if result.get("error"):
            print(f"Error fetching logs: {result['error']}")
            continue

        snippet = result.get("logSnippet") or ""
        if snippet:
            print("Failure snippet:")
            print(indent_block(snippet, prefix="  "))
        else:
            print("No snippet available.")
    print("-" * 60)


def render_run_results(
    run_id: str,
    results: Iterable[dict[str, Any]],
    run_metadata: dict[str, Any],
    requested_job_id: str | None,
) -> None:
    results_list = list(results)
    if requested_job_id is not None:
        print(
            f"Workflow run {run_id} job {requested_job_id}: "
            f"{len(results_list)} job analyzed."
        )
    else:
        print(f"Workflow run {run_id}: {len(results_list)} failing jobs analyzed.")

    if run_metadata:
        workflow = run_metadata.get("workflowName") or run_metadata.get("name") or ""
        conclusion = run_metadata.get("conclusion") or run_metadata.get("status") or ""
        event = run_metadata.get("event") or ""
        branch = run_metadata.get("headBranch", "")
        sha = (run_metadata.get("headSha") or "")[:12]
        if workflow or conclusion:
            print(f"Workflow: {workflow} ({conclusion})")
        if event:
            print(f"Event: {event}")
        if branch or sha:
            print(f"Branch/SHA: {branch} {sha}")
        if run_metadata.get("url"):
            print(f"Run URL: {run_metadata['url']}")

    for result in results_list:
        print("-" * 60)
        print(f"Job: {result.get('name', '')}")
        if result.get("detailsUrl"):
            print(f"Details: {result['detailsUrl']}")
        job_id = result.get("jobId")
        if job_id:
            print(f"Job ID: {job_id}")
        conclusion = result.get("conclusion") or ""
        if conclusion:
            print(f"Job conclusion: {conclusion}")
        print(f"Log status: {result.get('status', 'unknown')}")

        if result.get("note"):
            print(f"Note: {result['note']}")

        if result.get("error"):
            print(f"Error fetching logs: {result['error']}")
            continue

        snippet = result.get("logSnippet") or ""
        if snippet:
            print("Failure snippet:")
            print(indent_block(snippet, prefix="  "))
        else:
            print("No snippet available.")
    print("-" * 60)


def indent_block(text: str, prefix: str = "  ") -> str:
    return "\n".join(f"{prefix}{line}" for line in text.splitlines())


if __name__ == "__main__":
    raise SystemExit(main())
