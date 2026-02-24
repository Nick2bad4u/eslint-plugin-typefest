#!/usr/bin/env bash
# Removes all contents of the temp directory.
# Linux/macOS equivalent of the provided PowerShell script.

set -euo pipefail

VERBOSE=0
WHAT_IF=0

for arg in "$@"; do
    case "$arg" in
        -v | --verbose) VERBOSE=1 ;;
        -n | --what-if | --dry-run) WHAT_IF=1 ;;
        -h | --help)
            cat << 'EOF'
Usage: remove-temp.sh [--verbose] [--what-if]

Options:
	-v, --verbose    Print verbose output
	-n, --what-if    Show what would be removed without deleting
	-h, --help       Show this help message
EOF
            exit 0
            ;;
        *)
            echo "Unknown option: $arg" >&2
            exit 1
            ;;
    esac
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
TEMP_PATH="$(cd -- "$SCRIPT_DIR/../../../temp" 2> /dev/null && pwd -P || true)"

if [[ -n "${TEMP_PATH}" && -d "${TEMP_PATH}" ]]; then
    ((VERBOSE)) && echo "Removing contents of: ${TEMP_PATH}"

    shopt -s dotglob nullglob
    items=("${TEMP_PATH}"/*)
    shopt -u dotglob nullglob

    if ((${#items[@]} > 0)); then
        if ((WHAT_IF)); then
            for item in "${items[@]}"; do
                echo "Would remove: ${item}"
            done
        else
            rm -rf -- "${items[@]}"
        fi
    fi

    ((VERBOSE)) && echo "Temp directory cleaned successfully."
else
    ((VERBOSE)) && echo "Temp directory not found, nothing to clean: ${SCRIPT_DIR}/../../../temp"
fi
