---
title: Architecture and Operations Charts
description: Visual architecture and workflow diagrams for maintainers and contributors.
sidebar_position: 0
---

# Architecture and operations charts

This section provides high-signal diagrams for the plugin architecture, rule execution lifecycle, metadata/docs synchronization, validation planning, docs generation pipeline, and release quality gates.

## Chart set

- System architecture overview
- Rule lifecycle and autofix flow
- Docs and API pipeline
- Rule catalog and docs synchronization
- Change impact and validation matrix
- Quality gates and release flow
- Typed rule semantic analysis flow
- Import-safe autofix decision tree
- Preset composition and rule matrix
- Docs link integrity and anchor stability
- Typed rule performance budget and hotspots
- Diagnostics and regression triage loop
- Preset semver and deprecation lifecycle
- Rule authoring to release lifecycle

Use the **Charts** category in the Developer sidebar to navigate between these pages.

## Recommended reading order

1. Start with the system architecture overview.
2. Review rule lifecycle details to understand runtime behavior.
3. Understand docs and API generation dependencies.
4. Follow rule catalog/docs synchronization to prevent metadata drift.
5. Use the change-impact matrix to choose the right validation depth per change.
6. Use quality-gate and release flow for day-to-day maintenance and CI decisions.
7. Use the typed-rule semantic flow when debugging parser-services/checker failures.
8. Use the import-safe autofix tree for fix/suggest safety triage.
9. Use the preset composition matrix when modifying recommendation/config composition.
10. Use docs link integrity flow to triage broken anchor and route references quickly.
11. Use typed-rule performance budget flow before expanding semantic checks.
12. Use diagnostics triage loop to convert failing gates into root-cause fixes.
13. Use preset semver lifecycle when modifying preset membership or defaults.
14. Use rule authoring lifecycle as the contributor handoff/checklist map.
