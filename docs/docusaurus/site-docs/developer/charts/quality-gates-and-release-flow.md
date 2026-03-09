---
title: Quality Gates and Release Flow
description: CI quality gates and the release-hardening path for eslint-plugin-typefest.
sidebar_position: 4
---

# Quality gates and release flow

This state diagram shows the expected quality path from implementation through release readiness.

```mermaid
stateDiagram-v2
    [*] --> Design
    Design --> Implement
    Implement --> LocalChecks

    state LocalChecks {
      [*] --> Typecheck
      Typecheck --> UnitTests
      UnitTests --> LintAll
      LintAll --> DocsBuild
      DocsBuild --> BenchOptional
      BenchOptional --> [*]
    }

    LocalChecks --> PRReady: all checks green
    LocalChecks --> Implement: any check fails

    PRReady --> CI

    state CI {
      [*] --> Install
      Install --> Build
      Build --> Test
      Test --> Lint
      Lint --> Docs
      Docs --> PackageCheck
      PackageCheck --> [*]
    }

    CI --> ReleaseCandidate: all required gates pass
    CI --> Implement: failure triage required

    ReleaseCandidate --> ReleaseCheck: npm run release:check
    ReleaseCheck --> PublishReady: successful dry-run pack + gates
    ReleaseCheck --> Implement: fix regressions

    PublishReady --> [*]
```

## Gate intent

- **Typecheck/Test/Lint** protect runtime correctness and rule quality.
- **Docs build** ensures documentation and API pages remain valid.
- **Package checks** prevent broken public artifacts.
- **Release check** is the final integrated confidence pass.
