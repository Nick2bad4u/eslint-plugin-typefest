#!/usr/bin/env python3
"""Inspect and manage GitHub repository security alerts."""

from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))


def main() -> int:
    """CLI entry point."""

    from github_security_api import GitHubApiError, resolve_context
    from github_security_cli import parse_args
    from github_security_common import GitHubSecurityCliError
    from github_security_operations import handle_command
    from github_security_render import emit_output

    arguments = parse_args()

    try:
        context = resolve_context(arguments)
        payload = handle_command(context, arguments)
        emit_output(payload, as_json=arguments.json, command=arguments.command)
    except (
        GitHubApiError,
        GitHubSecurityCliError,
        json.JSONDecodeError,
    ) as exc:
        if arguments.json:
            print(
                json.dumps(
                    {
                        "error": {
                            "command": arguments.command,
                            "message": str(exc),
                            "type": type(exc).__name__,
                        }
                    },
                    indent=2,
                    sort_keys=True,
                ),
                file=sys.stderr,
            )
        else:
            print(f"Error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
