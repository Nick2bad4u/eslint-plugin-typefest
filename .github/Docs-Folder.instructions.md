---
name: "Copilot-Instructions-ESLint-Docs"
description: "Instructions for writing perfect ESLint rule documentation."
applyTo: "docs/**"
---

<instructions>
  <goal>

## Your Goal for ESLint Rule Documentation

- Your goal is to make every ESLint rule documentation file (`.md`) totally self-contained, allowing a developer to understand *why* the rule exists, *what* it flags, and *how* to fix it without looking at the source code.
- You adhere strictly to the `typescript-eslint` and standard ESLint documentation style guides.

  </goal>

  <structure>

## Documentation Structure

Every rule documentation file must follow this exact Markdown structure:

1.  **Title:** The rule ID as the H1 header (e.g., `# my-plugin/no-unsafe-types`).
2.  **Description:** A short, one-sentence description of what the rule does.
3.  **Meta Badges (Optional but recommended):** Badges for `Recommended`, `Fixable`, `Type Checked`.
4.  **Rule Details:** An explanation of the problem the rule solves. Why is this pattern bad?
5.  **Examples:**
    - Use `❌ Incorrect` and `✅ Correct` headers.
    - **Crucial:** Always include code blocks with specific comments explaining *why* a line is incorrect.
    - If the rule is configurable, show examples for different configurations.
6.  **Options (if applicable):**
    - A TypeScript interface definition of the options object.
    - Default values clearly marked.
    - Examples for each option.
7.  **When Not To Use It:** specific scenarios where disabling this rule is acceptable.
8.  **Further Reading:** Links to MDN, TypeScript docs, or relevant specs.

  </structure>

  <style>

## Style & Tone

- **Voice:** Professional, objective, and helpful. Avoid slang.
- **Clarity:** Use active voice. "This rule reports..." instead of "This rule is used to report...".
- **Code Blocks:**
  - Always tag code blocks with `ts` or `tsx` (since this is a TypeScript plugin).
  - Use `// eslint-disable-next-line` or specific comments in examples only if necessary to clarify context, but usually, just show the raw code that triggers the error.
- **Configuration:**
  - Assume **Flat Config** (`eslint.config.mjs`) for all configuration examples.
  - Do not use legacy `.eslintrc` JSON snippets.

  </style>

  <guidelines>

## Writing Guidelines

- **The "Why":** Never just say "Don't do X." Explain the consequence.
  - *Bad:* "Don't use `any`."
  - *Good:* "Using `any` bypasses the TypeScript type checker, which can lead to runtime errors that strict typing would otherwise catch."
- **The "Fix":** If the rule is `fixable`, explicitly state what the auto-fixer does (e.g., "The auto-fixer will replace `var` with `let`.").
- **Type Information:** If the rule requires type information (`parserServices`), add a specific note at the top of the docs:
  > ⚠️ This rule requires type information to run. It will not work without `parserOptions.project` or `projectService` configured.
- **Consistency:** Ensure the examples actually trigger the rule. Do not use hypothetical examples that strictly wouldn't fail the specific AST selector of the rule.

  </guidelines>

  <examples>

## Example Template

```markdown
# my-plugin/require-readonly-types

Enforces that all array and object types are explicitly marked as `readonly`.

## Rule Details

Mutable types in functional programming patterns can lead to accidental side effects. This rule ensures that data passed around your application remains immutable.

### ❌ Incorrect

```ts
function processItems(items: string[]) {
  items.push("new"); // Mutation!
}

interface User {
  tags: string[];
}
```

### ✅ Correct

```ts
function processItems(items: readonly string[]) {
  // items.push("new"); // TypeScript Error
}

interface User {
  tags: ReadonlyArray<string>;
}
```

## Options

This rule accepts a single option object:

```ts
type Options = {
  // If true, ignores local variables.
  ignoreLocals?: boolean;
}
```

### `ignoreLocals: true`

Examples of **correct** code with `{ "ignoreLocals": true }`:

```ts
function task() {
  const localList: string[] = []; // Allowed because it's local
  localList.push("temp");
}
```
```

  </examples>
</instructions>
