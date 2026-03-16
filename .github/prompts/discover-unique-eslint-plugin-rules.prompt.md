---
name: discover-unique-eslint-plugin-rules
description: "🤖🤖 Use this prompt to discover new ESLint rule ideas that fit the repository's niche and are not already covered by other major plugins, then implement the top candidates."
argument-hint: Provide any rule themes, ecosystems, or rule families to target first, if applicable. Optionally specify number of rules to implement.
---

# Task: Discover and Implement Net-New Rule Opportunities for This ESLint Plugin Repository

Research and identify rule ideas that are relevant to this repository's domain and goals but are not already well-covered by other major ESLint plugins.

We want to have rules that are useful, high quality, and arent duplicating any other plugins (unless it has benefit)

Make sure to check the presets and adjust them for the new rules.

Use any user-provided direction first; otherwise scan the current rule catalog and repository goals.

## Operating loop

Repeat the following until you exhaust the high-value search space:

1. Inventory the current repo rule set, presets, docs, and utility themes.
2. Research nearby ecosystems and competing plugins such as `@typescript-eslint`, `eslint-plugin-unicorn`, `eslint-plugin-import`, `eslint-plugin-sonarjs`, `eslint-plugin-regexp`, `eslint-plugin-functional`, etc, and any other relevant plugin families. Use web or research tools when available.
3. Identify candidate rule gaps that are:
   - genuinely relevant to this repository's domain, target users, and plugin goals
   - not obvious duplicates of existing mainstream rules
   - implementable with reliable AST or type-aware detection
   - likely to support an autofix or high-quality suggestion when possible
4. For each strong candidate, capture:
   - proposed rule name
   - targeted pattern and example code
   - why it belongs in this repository specifically
   - novelty or non-duplication check
   - autofix or suggestion feasibility
   - likely preset placement
   - implementation complexity and risk
5. Keep iterating until the remaining ideas are low-value, redundant, or too speculative.
6. Implement all the canidates that you feel would be a good fit for the repository, starting with the highest priority ones. For each implemented rule, add comprehensive tests, documentation, and metadata.
7. After implementation, run all validation commands and ensure the new rules integrate well with the existing codebase and presets without causing issues. Make any necessary adjustments based on test results or feedback.
