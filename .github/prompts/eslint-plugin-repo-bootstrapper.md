---
name: eslint-plugin-repo-bootstrapper
description: "🤖🤖 Use this prompt to bootstrap a new ESLint plugin repository by porting an existing plugin's rules, tests, and docs into my standardized modern ESLint plugin template."
argument-hint: Provide the folder name of the existing plugin to port, such as `eslint-plugin-legacy`.
---

This is a comprehensive, multi-step task to port a legacy ESLint plugin into my standardized modern ESLint plugin template. I will repeat this prompt as needed to give you time to accomplish all tasks. Work autonomously and use your intuition to figure out the next logical step.

**Project Context & Current State:**
1. We are adapting an old plugin currently located in the folder: `./[SOURCE_PLUGIN_FOLDER]`
2. The root of this repository has been scaffolded using my template (based on my `eslint-plugin-typefest` repo). All root `package.json` deps/dev-deps are already installed.
3. The target stack uses TypeScript and a Docusaurus documentation site.
4. The root contains configuration files copied from my template. Do NOT just delete and recreate them (tsconfig, lint configs, etc.). Instead, **adapt** them. Use the strict rules and configs already present as your baseline.

**Your Instructions:**
5. **Adapt & Migrate:** Move rules, tests, and docs from `./[SOURCE_PLUGIN_FOLDER]` into the template's strict folder structure (`src/`, `docs/`, `test/`).
6. **Strict Linting:** Update the entire repo (from `package.json` to GitHub release workflows). The lint config is very strict and must stay that way. It should work for the most part, but make slight adjustments if absolutely necessary.
7. **Modernize:** Rewrite all rules in TypeScript and update them to modern ESLint 10 plugin standards.
8. **Cleanup:** You may delete files from `./[SOURCE_PLUGIN_FOLDER]` ONLY after you have fully copied, updated, and verified the respective rule/doc.

**Definition of Done (Final Goals):**
A. All rules are updated for ESLint 10 and written in TypeScript.
B. **0 lint warnings/errors, 0 type errors, and 0 failing tests.**
C. Docusaurus site is fully functional via the copied config, with updated documentation for every rule, ready for release.
D. The entire project perfectly matches the layout, doc standards, and coding standards of my `eslint-plugin-typefest` template.

Work methodically through these requirements without taking shortcuts or cheating. If you hit limits, stop at a logical checkpoint so we can continue in the next prompt.
