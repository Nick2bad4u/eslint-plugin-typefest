# Prefer TypeFest JsonObject

Require TypeFest `JsonObject` over equivalent explicit `Record<string, JsonValue>` aliases.

## What it checks

- `Record<string, JsonValue>`

## Why

`JsonObject` communicates intent directly and avoids repeating verbose JSON object alias patterns.
