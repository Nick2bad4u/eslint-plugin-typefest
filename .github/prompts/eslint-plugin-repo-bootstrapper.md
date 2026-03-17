---
name: eslint-plugin-repo-bootstrapper
description: "🤖🤖 Use this prompt to bootstrap a new ESLint plugin repository by porting an existing plugin's rules, tests, and docs into my standardized modern ESLint plugin template."
argument-hint: Provide the folder name of the existing plugin to port, such as `eslint-plugin-legacy`.
---

This is a comprehensive, multi-step task to port a legacy ESLint plugin into my standardized modern ESLint plugin template. I will repeat this prompt as needed to give you time to accomplish all tasks. Work autonomously and use your intuition to figure out the next logical step. Copilot instructions for specific folders have already been added to the repo, so be sure to follow those as well.

**Project Context & Current State:**
1. We are adapting an old plugin currently located in the folder: `./[SOURCE_PLUGIN_FOLDER]`
2. The root of this repository has been scaffolded using my template (based on my `eslint-plugin-typefest` repo). All root `package.json` dependencies & devDependencies are already installed.
3. The target stack uses TypeScript and a Docusaurus documentation site.
4. The root contains configuration files copied from my template. Do NOT just delete and recreate them (tsconfig, lint configs, etc.). Instead, **adapt** them. Use the strict rules and configs already present as your baseline.

**Your Instructions:**
5. **Adapt & Migrate:** Move rules, tests, and docs from `./[SOURCE_PLUGIN_FOLDER]` into the template's strict folder structure (`src/`, `docs/`, `test/`).
6. **Strict Linting:** Update the entire repo (from `package.json` to GitHub release workflows). The lint config is very strict and must stay that way. It should work for the most part, but make slight adjustments if absolutely necessary. The only thing you need to do is update the local plugin import in the ESLint config. You should never turn off a rule unless it's absolutely necessary, but prefer to use inline ESLint disable comments for any exceptions rather than changing the config. The goal is to have 0 lint warnings/errors with the new code.
7. **Typing & TSConfig:** We run an extremely strict TSConfig. You may need to add types or make adjustments to get the code to compile without errors. The goal is to have 0 type errors with the new code.
8. **Modernize:** Rewrite all rules in TypeScript and update them to modern ESLint 10 plugin standards.
9. **Cleanup:** You may delete files from `./[SOURCE_PLUGIN_FOLDER]` ONLY after you have fully copied, updated, and verified the respective rule/doc.
10. **Documentation:** Update the Docusaurus config and docs for each rule, ensuring they match the style and standards of my template. ESLint meta data CANNOT be runtime injected into the docs via helpers, it has to be static. You must manually copy and update all relevant information for each rule, such as descriptions, options, examples, etc.
11. **Testing:** Ensure all tests are updated and passing with well-written test cases that cover all edge cases.
12. **Docusaurus:** Ensure the Docusaurus site is fully functional with the copied config and updated documentation. Make sure any documentation, examples, or site content is updated to reflect the new rules and standards. Look for any references to the old plugin name or rules and update them accordingly.
13. **Scripts & Misc:** We have a few custom remark plugins and a few scripts that should help you keep the docs and readme in sync and up to date. Update any package.json scripts if needed, most of them should work without changes, but make adjustments if necessary to fit the new plugin's structure and rules.
14. **Review & Refine:** After you have everything ported and updated, do a thorough review of the entire codebase, documentation, and tests to ensure everything is perfect and meets the standards of my template. Make any necessary refinements or improvements to ensure the highest quality.

**Definition of Done (Final Goals):**
A. All rules are updated for ESLint 10 and written in TypeScript.
B. **0 lint warnings/errors, 0 type errors, and 0 failing tests.**
C. Docusaurus site is fully functional via the copied config, with updated documentation for every rule, ready for release.
D. The entire project perfectly matches the layout, doc standards, and coding standards of my `eslint-plugin-typefest` template.
E. Feel free to make improvements to this template if you see anything that should be added to help with future plugin bootstrapping. I want to make this process as smooth and efficient as possible for future plugins.

Work methodically through these requirements without taking shortcuts or cheating. This prompt will repeat a few times to give you plenty of time to do accurate, high-quality work. If you hit limits, stop at a logical checkpoint so we can continue in the next prompt. Get as much done as you can in each prompt, but prioritize quality and accuracy over quantity. The goal is to have a perfectly bootstrapped plugin that meets all the criteria above.
