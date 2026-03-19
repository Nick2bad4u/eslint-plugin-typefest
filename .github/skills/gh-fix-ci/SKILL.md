---
name: "gh-fix-ci"
description: "Use when a user asks to debug or fix a failing GitHub Actions run or failing PR checks; use `gh` to inspect workflow runs, jobs, checks, and logs, identify the root cause, and implement the fix directly"
argument-hint: "`repo` (optional, default `.`), plus either `run` (workflow run URL/id) or `pr` (optional, defaults to current branch PR)"
compatibility: "Requires GitHub CLI authentication with appropriate scopes (repo + workflow)."
disable-model-invocation: false
user-invocable: true
license: "Unlicense"
---


# GitHub Actions Failure Fix

## Overview

Use gh to locate failing GitHub Actions workflow runs or failing PR checks, fetch actionable logs, identify the root cause from the failure snippet, and implement the fix directly.

Prereq: authenticate with the standard GitHub CLI once (for example, run `gh auth login`), then confirm with `gh auth status` (repo + workflow scopes are typically required).

## Inputs

- `repo`: path inside the repo (default `.`)
- `run`: workflow run id or URL (optional)
- `pr`: PR number or URL (optional; defaults to current branch PR when `run` is not provided)
- `gh` authentication for the repo host

The bundled helper is repository-agnostic: point `--repo` at any local checkout that `gh` can access, not just this repository.

## Quick start

- `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --run "https://github.com/org/repo/actions/runs/123456789"`
- `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --pr "<number-or-url>"`
- Add `--json` if you want machine-friendly output for summarization.

## Workflow

1. Verify gh authentication.
   - Run `gh auth status` in the repo.
   - If unauthenticated, ask the user to run `gh auth login` (ensuring repo + workflow scopes) before proceeding.
2. Resolve the target.
    - If the user provides a workflow run id or URL, use that directly.
    - Otherwise, resolve the current branch PR via `gh pr view --json number,url`, or use the provided PR number/URL.
3. Inspect failing GitHub Actions failures.
    - Preferred: run the bundled script (handles gh field drift, workflow-run job discovery, and job-log fallbacks):
      - Workflow run: `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --run "<run-id-or-url>"`
      - PR checks: `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --pr "<number-or-url>"`
       - Add `--json` for machine-friendly output.
    - Manual fallback for workflow runs:
       - `gh run view <run_id> --json name,workflowName,conclusion,status,url,event,headBranch,headSha`
       - `gh api "/repos/<owner>/<repo>/actions/runs/<run_id>/jobs?per_page=100"`
       - For each failing job: `gh api "/repos/<owner>/<repo>/actions/jobs/<job_id>/logs" > "<path>"`
       - If job logs are unavailable, fall back to: `gh run view <run_id> --log`
    - Manual fallback for PR checks:
       - `gh pr checks <pr> --json name,state,bucket,link,startedAt,completedAt,workflow`
          - If a field is rejected, rerun with the available fields reported by `gh`.
       - For each failing check with a GitHub Actions URL, extract the run id from `detailsUrl` and inspect that run.
4. Scope non-GitHub Actions checks.
    - If a failing PR check `detailsUrl` is not a GitHub Actions run, label it as external and only report the URL.
    - Do not attempt Buildkite or other providers; keep the workflow lean.
5. Summarize failures for the user.
   - Provide the failing check name, run URL (if any), and a concise log snippet.
   - Call out missing logs explicitly.
6. Implement the fix.
   - Identify the root cause from the failure snippet and the surrounding codebase.
   - Apply the fix directly: edit source files, tests, config, or workflow YAML as needed.
   - Summarize what was changed and why.
   - Suggest running the relevant tests locally to confirm, then ask if the user wants to open a PR.
7. Recheck status.
   - After changes, suggest re-running the relevant tests and either `gh pr checks <pr>` or `gh run view <run_id>` to confirm.

## Bundled Resources

### scripts/inspect_github_actions_failures.py

Fetch failing PR checks or workflow-run jobs, pull GitHub Actions logs, and extract a failure snippet. Exits non-zero when failures remain so it can be used in automation.

Usage examples:
- `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --run "23273258930"`
- `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --run "https://github.com/org/repo/actions/runs/23273258930" --json`
- `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --pr "123"`
- `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --pr "https://github.com/org/repo/pull/123" --json`
- `python "<path-to-skill>/scripts/inspect_github_actions_failures.py" --repo "." --max-lines 200 --context 40`
