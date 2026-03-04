---
name: review-hacky-brittle-fixes
description: Describe when to use this prompt
argument-hint: Provide any trouble spots or specific areas of the codebase to focus on, if applicable.
agent: BeastMode-[3.1]
---

# Task: Comprehensive Repository Quality & Scalability Audit

You are tasked with a deep-scan and refactor of this entire repository. This project is a high-traffic plugin with an expected user base of 300k-500k. Stability, performance, and maintainability are critical.

Search the codebase exhaustively to identify and resolve the following categories of issues:

### 1. Fragility & Brittle Implementations
- **Regex Hardening:** Replace brittle, non-descriptive, or overly complex regex with robust patterns or dedicated parsing logic.
- **Magic Strings/Numbers:** Identify hardcoded values that should be constants or configuration-driven.
- **Type Safety:** Fix loose typing or 'any' usage that could lead to runtime crashes.

### 2. Consistency & Standardized Logic
- **Unified Rule Logic:** Audit all rules/modules. If a fix or optimization was applied to one rule, ensure it is standardized across all similar rules.
- **Error Handling:** Ensure a consistent error-reporting and recovery strategy across the entire plugin. No silent failures.

### 3. Architectural Integrity
- **Pattern Alignment:** Identify "one-off" hacks or weird workarounds. Refactor them to follow the project's primary architectural patterns.
- **Dependency Review:** Look for unnecessary complexity in how modules interact. Simplify circular dependencies or deep nesting.

### 4. Production Readiness & Best Practices
- **Performance:** Optimize hot paths (loops, heavy string manipulation) to ensure the plugin doesn't lag for the 500k users.
- **Syntax & Compatibility:** Ensure modern, clean syntax while maintaining compatibility with the target runtime environments.

### Execution Plan:
1. **Search Phase:** Use semantic and lexical search to map out the core logic and identify patterns.
2. **Analysis Phase:** Flag every instance of the issues listed above.
3. **Refactor Phase:** Apply fixes iteratively. Priority is given to "breaking" potential and runtime stability.
4. **Validation:** Double-check that refactors don't introduce regression in existing rules.

Treat this as a mission-critical audit. Search hard, be pedantic, and prioritize long-term stability.
