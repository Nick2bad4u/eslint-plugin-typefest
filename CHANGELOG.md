<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[d233b9c](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d233b9c2b49f5f87e10e2c2ee04deed9765f54a3)...
[aeb72ee](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/aeb72eeeb9be48054bf96209b07ff62e9f777d33)]
([compare](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/d233b9c2b49f5f87e10e2c2ee04deed9765f54a3...aeb72eeeb9be48054bf96209b07ff62e9f777d33))


### ✨ Features

- ✨ [feat] Update test coverage scripts and enhance JUnit reporting
 - 🔧 Modify coverage job to run tests with JUnit report generation
 - 📄 Add verification for JUnit artifact existence
 - 📤 Implement upload of test results to Codecov
 - 🔍 Refactor assertions in prefer-ts-extras-is-empty, prefer-ts-extras-is-infinite, and prefer-ts-extras-not tests to use regex matching for improved accuracy

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fe9b0b3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fe9b0b3d4133560154045a82ec981920ba847574)


- ✨ [feat] Add ESLint 9 compatibility checks and update documentation
 - 🛠️ [fix] Implement ESLint 9 compatibility smoke checks in a new script
 - 🔧 [build] Update CI configuration to include ESLint 9 compatibility job
 - 📝 [docs] Add compatibility section to README with supported ESLint versions
 - 🔧 [build] Update package.json and package-lock.json for ESLint 9 compatibility
 - 🚜 [refactor] Simplify regex patterns in typed-rule.ts for test file detection

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8e7a5a8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8e7a5a8890c707d01bd8af285ff7bd3eb53a9698)


- ✨ [feat] Enhance ESLint Benchmarking and Add New Fixtures
 - 🛠️ [fix] Update ESLint rule types to use `import("eslint").Linter.RulesRecord` for better type safety.
 - ✨ [feat] Introduce new benchmark file globs for `recommendedZeroMessageFixture` and `safeCastToStressFixture`.
 - 📝 [docs] Add `recommended-zero-message.baseline.ts` to provide a baseline workload for the recommended preset.
 - 📝 [docs] Create `safe-cast-to.stress.ts` to test the `prefer-ts-extras-safe-cast-to` rule under stress conditions.
 - ⚡ [perf] Improve `assertMeaningfulBenchmarkSignal` to accept options for maximum and minimum reported problems.
 - ✨ [feat] Add new benchmarks for the `prefer-ts-extras-safe-cast-to` rule with both fixing and non-fixing scenarios.
 - 👷 [ci] Update `run-eslint-stats.mjs` to handle new benchmark scenarios and improve reporting with comparison capabilities.
 - 🧹 [chore] Introduce `codecov.yml` for better coverage reporting and management.
 - 🎨 [style] Refactor `lint-actionlint.mjs` to improve output readability with colored console messages.
 - ⚡ [perf] Optimize `vite.config.ts` to include source files in coverage reporting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(72b72c3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72b72c3d76e79c5c48b80909a5f26f5d304afd53)


- ✨ [feat] Update rules to require 'frozen: false' for typefest ESLint rules
 - 📝 Added 'frozen: false' to the documentation of multiple TypeFest ESLint rules to indicate that these rules are not frozen and can be modified in the future.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(110d7dd)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/110d7dd4ad77096226ed311227c6e9dc54b8669a)


- ✨ [feat] Adds preset-tagged rule recommendations

✨ [feat] Expands rule documentation metadata to support preset-based recommendation tags, so guidance maps cleanly to multiple preset levels.
 - Adds stricter metadata typing to improve consistency and catch invalid recommendation values earlier.

✨ [feat] Populates recommendation targets across the rule set, including core preset tiers and specialized preset groups.
 - Improves downstream docs and config tooling by making recommendation intent explicit per rule.

🛠️ [fix] Tightens runtime validation for optional configuration inputs and nullable objects.
 - Prevents empty or non-string values from being treated as valid and reduces fragile fallback behavior.

🚜 [refactor] Applies consistency cleanups in scripts and internal utilities, including style normalization and stricter readonly typing.
🧪 [test] Updates test helpers and mocks to align with stricter type expectations and explicit undefined checks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(155c352)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/155c352f4fdb9a3ac38104a5b11b67ede23aefe4)


- ✨ [feat] Enhance TypeFest rule tests with detailed metadata and messages
 - 🛠️ [fix] Refactor rule tests to include `ruleId`, `docsDescription`, and `messages` for better clarity and maintainability
 - 📝 [docs] Update documentation strings to specify the purpose of each rule, emphasizing the preference for TypeFest types over aliases
 - 🔧 [build] Add inline invalid and valid test cases for various TypeFest rules, ensuring comprehensive coverage
 - ⚡ [perf] Optimize test structure by consolidating repetitive code patterns into reusable functions
 - 🧪 [test] Introduce new test cases for edge scenarios, including whitespace formatting and generic type handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(db8f3d9)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db8f3d907e5b7dff0f98dc648045e96776573ba2)


- ✨ [feat] Enhance prefer-ts-extras-is-equal-type tests with metadata validation
 - 📝 Add metadata loading function for `prefer-ts-extras-is-equal-type` rule
 - ✅ Implement tests for stable report and suggestion messages
 - 🔍 Include checks for default options, documentation, and suggestion messages
 - 🔄 Add inline code examples for conflicting bindings and named imports

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b7735ff)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b7735fff0c81b9b0e938e11e80f466824d347ee6)


- ✨ [feat] Enhance prefer-ts-extras-is-equal-type rule with ts-extras integration
 - 🛠️ [fix] Add support for isEqualType function from ts-extras in ESLint rule
 - 🔧 [build] Update test fixtures to include ts-extras imports and expected outputs
 - 🧪 [test] Extend tests for aliased imports and ensure correct suggestions are provided

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(64beea6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/64beea69975339a2924f307a80baf25d38e4c3c7)


- ✨ [feat] Introduce local Typefest plugin dogfooding rules
 - Added local Typefest plugin for manual dogfooding in ESLint configuration
 - Defined explicit rules for Typefest utilities to enhance linting experience
 - Updated section headers from "MARK" to "SECTION" for consistency across the config

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df8b7be)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/df8b7be5d4074457f8d826c979149f8f861f7c73)


- ✨ [feat] Implement script for temp directory cleanup
 - 🛠️ Update hooks to use new PowerShell script for removing temp files
 - 🛠️ Replace inline commands with calls to `.github/hooks/scripts/remove-temp.ps1`
 - 🛠️ Add logging prompts for Linux and OSX in hooks
 - 📝 Create `remove-temp.ps1` script to handle temp directory cleanup

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(98e032b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/98e032b352efbe56862f5912aaab20d094319018)


- ✨ [feat] Update node configuration and dependencies
 - 🔧 Change "test" directory to "tests" in node options for file system read permissions
 - 🔧 Add additional files to allow file system read permissions including package-lock.json, tsconfig.build.json, eslint.config.js, README.md, CHANGELOG.md, and LICENSE
 - 🔧 Enable extra info on fatal exceptions in node options
 - 🔧 Update test runner configuration to include new test file patterns and coverage settings
 - 🔧 Add support for TypeScript files with .mts extension in coverage include patterns
 - 🔧 Update test coverage thresholds for branches, functions, and lines to 80%
 - 🔧 Adjust test concurrency settings based on CI environment

🔧 [chore] Update package dependencies
 - 🔧 Add @stryker-ignorer/console-all package for improved mutation testing
 - 🔧 Update stylelint-plugin-use-baseline to version 1.2.4
 - 🔧 Update typedoc-plugin-dt-links to version 2.0.43
 - 🔧 Remove eslint-plugin-no-hardcoded-strings as it is no longer needed

🧪 [test] Enhance test coverage for imported type aliases and value symbols
 - 🧪 Add new tests for createSafeTypeNodeReplacementFix and createSafeTypeNodeTextReplacementFix functions
 - 🧪 Implement tests for imported-value-symbols including collectDirectNamedValueImportsFromSource and related functions
 - 🧪 Ensure tests cover various scenarios including type-only imports, different source modules, and multiple local aliases

🧪 [test] Add tests for plugin source configurations
 - 🧪 Verify that plugin configurations build correctly and contain expected rules
 - 🧪 Ensure parser defaults and plugin namespace are registered properly

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5c39e3d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5c39e3d5254fd081c9bd94a35933f21cd396893e)


- ✨ [feat] Add Stryker mutation testing configuration
 - 🛠️ [config] Create .github/workflows/stryker.yml for scheduled and manual mutation testing
 - 🔧 [build] Update package.json scripts for Stryker with concurrency and incremental file options
 - 🔧 [build] Upgrade knip dependency to version 5.85.0
 - 🛠️ [config] Enhance stryker.config.mjs with dashboard integration and improved concurrency settings
 - 🛠️ [config] Adjust thresholds for mutation testing to improve quality metrics

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7608574)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7608574ff670f60b3822c80f981c06e41e61e748)


- ✨ [feat] Update ESLint configuration and dependencies
 - 🔧 Update environment variable for JSON schema validation from `UW_ENABLE_JSON_SCHEMA_VALIDATION` to `ENABLE_JSON_SCHEMA_VALIDATION`
 - 🔧 Change ESLint progress mode variable from `UW_ESLINT_PROGRESS` to `ESLINT_PROGRESS`
 - 🔧 Upgrade `eslint-plugin-node-dependencies` from `1.3.0` to `2.0.0`
 - 🔧 Update dependencies in `eslint-plugin-node-dependencies` to their latest versions
 - 🔧 Modify `package.json` to reflect the updated version of `eslint-plugin-node-dependencies`

🛠️ [fix] Refactor internal logic for variable resolution in scope
 - 🔧 Introduce `getVariableInScopeChain` to streamline variable resolution across scopes
 - 🔧 Refactor `isLocalNameBoundToExpectedImport` to utilize the new variable resolution function

✨ [feat] Enhance TypeFest plugin rule definitions
 - 🔧 Define new rule names for TypeFest and TypeScript extras
 - 🔧 Refactor `typefestRules` to use a more structured approach for rule definitions
 - 🔧 Update the `TypefestRuleId` and `TypefestRuleName` types for better type safety

🧪 [test] Improve typed rule tester and runtime tests
 - 🔧 Specify the type of `typedRuleTester` for better type inference
 - 🔧 Refactor runtime tests to ensure proper mocking and reset of modules

📝 [docs] Update TypeScript configuration files
 - 🔧 Set `isolatedDeclarations` to `true` in `tsconfig.build.json` for better module isolation
 - 🔧 Adjust `tsconfig.eslint.json` to include `isolatedDeclarations` for consistency
 - 🔧 Modify `tsconfig.json` to enable `declaration` and `declarationMap` for improved type definitions

🎨 [style] Refactor Vite configuration for clarity
 - 🔧 Define `vitestConfig` with explicit type for better readability and maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8afc040)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8afc040b174fd9de7074b1ef149837163aa8dddf)


- ✨ [feat] Adds import-safe autofixes to lint rules

✨ [feat] Expands many helper/type preference diagnostics to deliver automatic fixes or targeted suggestions, reducing manual migrations while keeping behavior stable.
 - Applies rewrites only when required imports exist and local scope checks confirm replacements are safe.
 - Falls back to non-fixing reports or suggestions when safety cannot be proven.
 - Tightens pattern matching for guard, nullish, and infinity checks so automatic rewrites only occur for semantically reliable forms.

🚜 [refactor] Introduces shared safe-replacement utilities for full type-node and custom-text substitutions, unifying fix generation across value and type rule paths.

🛠️ [fix] Preserves runtime boolean semantics in type-equality rewrites to prevent logical drift during suggested replacements.

🔧 [build] Updates lint-related dependency versions to align with newer parser/plugin compatibility.

🧪 [test] Adds broad invalid-case coverage with expected autofix and suggestion outputs to verify safety gates and rewrite correctness.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bfc3d8d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bfc3d8d98165dd6866d558d059a2f6cd46369752)


- ✨ [feat] Adds safe autofixes for preference rules

✨ [feat] Enables automatic rewrites to preferred utility-style calls when compatible value imports are already in scope.
 - Improves rule usability by turning actionable guidance into one-step fixes.
 - Preserves behavior by rewriting receiver-based method/member usage into equivalent function-call forms.

🚜 [refactor] Introduces shared, scope-aware import resolution and fixer builders used across array/object preference checks.
 - Resolves direct named and aliased value imports while ignoring type-only imports.
 - Verifies symbol binding through scope lookup to avoid unsafe fixes when names are shadowed or unresolved.
 - Applies fixes only for safe syntax patterns and marks the updated rules as code-fixable for consistent tooling behavior.

🧪 [test] Expands coverage with inline autofix scenarios for all updated preference checks.
 - Validates expected transformed output when safe imports exist.
 - Retains non-fixable and report-only paths to reduce regression risk.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(25a1784)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25a1784bf26d1d3e9023f21ed2d2023e1d628e02)


- ✨ [feat] Add authors configuration for blog
 - Introduced authors.yml to define contributors for the blog
 - Added Alice Example with image, title, and social links
 - Added Nick2bad4u with image, title, permalink, and social links

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(53bf4a6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/53bf4a66503c9a0274fea8af7b4cc1ee70c485ac)


- ✨ [feat] Add favicon and enhance ESLint Config Inspector build script
 - 🆕 Introduce favicon.ico to Docusaurus static assets for improved branding
 - 🔧 Refactor build-eslint-inspector.mjs to streamline the build process
 - 📦 Implement local testing version creation for easier development
 - 🔄 Update asset path fixing logic for better subdirectory deployment
 - 📄 Create index redirect page for improved SEO and usability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2359e0c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2359e0c73d136715759ac931708f1f494a23a447)


- ✨ [feat] Enhance documentation and CI workflow
 - 📝 [docs] Add CLI debugging and config inspection guide
 - 📝 [docs] Create IDE integration guide for VS Code
 - 📝 [docs] Introduce maintainer performance profiling documentation
 - 📝 [docs] Provide examples for Node.js ESLint API usage
 - 🔧 [build] Update deploy workflow to include full git history and build steps
 - 🛠️ [fix] Add processors property to plugin contract for compatibility
 - 🧪 [test] Implement rule metadata integrity tests to ensure proper documentation and schema
 - 🎨 [style] Add logo images for improved branding

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a8ce34a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a8ce34af2b417febf44ca290ff535ba226c44a7f)


- ✨ [feat] Integrate Stryker for mutation testing and enhance changelog generation
 - 🔧 Add scripts for changelog generation, preview, and release notes using git-cliff
 - 🛠️ Introduce Stryker configuration for mutation testing with TypeScript support
 - 🧪 Add mutation testing commands to package.json for local and CI environments
 - 🎨 Create a new vitest configuration file for Stryker to manage test execution
 - 📝 Update tsconfig for ESLint to include new vitest configuration
 - 🎨 Refactor type casting in imported-type-aliases test for improved readability
 - 🎨 Adjust formatting in prefer-type-fest-tagged-brands test for consistency

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2c6b5ef)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2c6b5ef32519e49d3162d67786ba71cce83daf01)


- ✨ [feat] Adds TypeFest typing preference rules

✨ [feat] Expands typed linting to standardize common type patterns on canonical utility aliases.
 - Replaces ad-hoc constructor, abstract-constructor, deep utility, and exclusive-union patterns with consistent utility-first guidance.
 - Improves type consistency across projects and reduces alias drift between teams.
 - Preserves better literal-union authoring ergonomics while keeping primitive compatibility.

🚜 [refactor] Updates plugin registration and typed rule grouping to include the new preferences.
 - Ensures new rules are exposed and categorized with existing type-focused rule sets.
 - Keeps test-file paths excluded to avoid noisy or misleading diagnostics in test code.

📝 [docs] Adds full rule documentation for each new preference.
 - Provides rationale, incorrect/correct examples, flat-config usage, and opt-out guidance to support adoption.

🧪 [test] Adds typed fixtures and rule coverage for valid, invalid, and skipped-path scenarios.
 - Confirms diagnostics trigger only on intended patterns and remain silent in test fixtures.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dcd7a6f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/dcd7a6ffeea657c615551a71e08bcf6e7afbc4df)


- ✨ [feat] Add modern docs UI enhancements

✨ [feat] Adds a client-side enhancement module to improve documentation site UX with scroll progress feedback, interactive hover behavior, fallback reveal animations, theme-toggle animation, dynamic accents, and desktop cursor lighting.
 - Re-initializes effects after route transitions and cleans up listeners, observers, timers, and injected elements to keep SPA navigation stable and prevent stale handlers.
 - Respects reduced-motion preferences and mobile breakpoints so enhancements stay accessible and lightweight across devices.

📝 [docs] Updates rule and test helper comments to use clearer, more consistent parameter and return wording.
 - Improves readability and maintenance confidence without changing runtime or linting behavior.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d81f477)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d81f47784ebb46ade581d9f8f58fd073bd088608)


- ✨ [feat] Enhance documentation structure and content for eslint-plugin-typefest
 - 📝 [docs] Update docusaurus configuration to include new pages for rules overview and getting started
 - 📝 [docs] Add new sidebar categories and links for presets and rules
 - 📝 [docs] Create detailed markdown files for each preset: minimal, recommended, strict, all, type-fest types, and type-guards
 - 📝 [docs] Introduce getting started and overview documentation to guide users
 - 🎨 [style] Update CSS styles to accommodate new sidebar categories and enhance visual hierarchy
 - 🧹 [chore] Add type definitions for custom CSS modules to improve TypeScript support
 - 🔧 [build] Include typed-css-modules in package.json for CSS module type generation
 - 🧹 [chore] Clean up package.json and package-lock.json to ensure proper dependency management

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a73ec43)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a73ec4395f4b8c8977837a94ca16fbb998da3989)


- ✨ [feat] Update Docusaurus homepage links and text
 - 🔗 Change the primary button link from "/docs/getting-started" to "/docs/intro"
 - 📝 Update button text from "Read the docs" to "Start with Overview"
 - 🔗 Change the secondary button link from "/docs/rules" to "/docs/developer/api"
 - 📝 Update button text from "Browse rules" to "Explore Developer API"

🛠️ [fix] Enhance ESLint configuration for CSS and Docusaurus
 - 🎨 Add new ESLint plugins: "@docusaurus/eslint-plugin", "eslint-plugin-css-modules", "eslint-plugin-no-hardcoded-strings", and "eslint-plugin-undefined-css-classes"
 - ⚙️ Update ESLint rules for CSS files to include checks for empty blocks and undefined CSS classes
 - 🔧 Adjust Docusaurus ESLint rules to improve code quality and maintainability

🔧 [build] Update package dependencies
 - 📦 Upgrade "eslint-plugin-compat" to version 6.2.0
 - 📦 Upgrade "eslint-plugin-jsdoc" to version 62.6.0
 - 📦 Upgrade "eslint-plugin-sonarjs" to version 4.0.0
 - 📦 Upgrade "eslint-plugin-storybook" to version 10.2.10
 - 📦 Upgrade "eslint-plugin-toml" to version 1.1.1
 - 📦 Upgrade "eslint-plugin-yml" to version 3.2.1
 - 📦 Upgrade "storybook" to version 10.2.10
 - 📦 Upgrade "typescript" peer dependency to version 5.9.3

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(413a896)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/413a896d53a2576852b4bc02e554478137e50477)


- ✨ [feat] Enhance ESLint Plugin and Documentation

 - 🛠️ [build] Add workspaces support for Docusaurus in package.json
 - 📝 [docs] Introduce new scripts for documentation management:
   - 📜 [scripts] Add build-eslint-inspector.mjs to build static ESLint Config Inspector
   - 🔗 [scripts] Implement check-doc-links.mjs to verify documentation links
   - 🧹 [scripts] Create lint-actionlint.mjs for linting GitHub Actions workflows
   - ✅ [scripts] Add verify-eslint-inspector.mjs to validate ESLint Inspector integration
 - 🛠️ [fix] Update tsconfig.eslint.json to include TypeScript files in docs directory
 - 📝 [docs] Add tsdoc.json for TypeScript documentation configuration
 - 🧹 [chore] Clean up and optimize existing scripts for better maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(17f1583)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/17f1583bc3a8ca11d587c827ac23d73895fd8c98)


- ✨ [feat] Enhance TypeFest ESLint Plugin with TypeScript Support
 - 🆕 Add TypeScript parser as a dependency to improve compatibility with TypeScript files.
 - 🔧 Update package.json to include TypeScript as a peer dependency, ensuring users have the correct version.
 - 🛠️ Refactor plugin structure to utilize TypeScript types for improved type safety and clarity.
 - 📜 Introduce detailed documentation for ESLint rules related to TypeFest and TypeScript utilities.
 - 🔄 Restructure rule definitions to enhance maintainability and readability.
 - 🧪 Update tests to validate new configurations and ensure all rules are correctly registered.
 - 🔍 Ensure that experimental rules are properly categorized and excluded from stable configurations.
 - 📝 Modify test cases to reflect changes in the plugin's configuration structure and rule registration.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(58d2f8d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/58d2f8dad12ea27c2417c65490cc542b18a0bcbd)


- ✨ [feat] Add new ESLint rules for TypeScript extras
 - 🎉 Introduced `prefer-ts-extras-is-equal-type` rule to encourage the use of `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertions.
 - 🎉 Introduced `prefer-ts-extras-is-present` rule to promote the use of `isPresent(value)` from `ts-extras` instead of inline nullish comparisons outside filter callbacks.
 - 🛠️ Implemented logic to identify and suggest replacements for `IsEqual<T, U>` and nullish checks in the codebase.
 - 📚 Updated documentation links for both rules to ensure users can access relevant information.

🧪 [test] Add tests for new ESLint rules
 - ✅ Created test cases for `prefer-ts-extras-is-equal-type` to validate correct identification and suggestion of type equality checks.
 - ✅ Created test cases for `prefer-ts-extras-is-present` to ensure proper detection of nullish comparisons and provide suggestions for using `isPresent`.

📝 [docs] Update documentation and test fixtures
 - 📄 Added new documentation files for the newly created rules to guide users on their usage.
 - 📄 Created valid and invalid test fixtures for both rules to ensure comprehensive testing coverage.

🎨 [style] Refactor existing test and configuration files
 - 🧹 Cleaned up import statements in test files for consistency.
 - 🧹 Adjusted test structure to improve readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e731149)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e7311497fccdd2a094cde912c332f28b562a9adb)


- ✨ [feat] Enhance ESLint configuration with new rules and plugins
 - 🔧 Import `defineConfig` and `globalIgnores` from `@eslint/config-helpers`
 - 🔧 Update ESLint rules to include `@eslint-community/eslint-comments` for better comment handling
 - 🔧 Reintroduce TypeScript rules for `tsdoc` and `unused-imports`
 - 🔧 Adjust various rule settings for improved linting accuracy and performance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2cb3cac)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2cb3cac8a808b97edc8e28aecad7c65bce1c22b0)


- ✨ [feat] Introduce new rules for TypeScript extras

 - ✨ [feat] Add `prefer-ts-extras-as-writable` rule
   - Enforces the use of `asWritable(value)` from `ts-extras` over `Writable<T>` assertions from `type-fest`.
   - Includes logic to identify and report incorrect usages in TypeScript files.
   - Provides comprehensive tests for valid and invalid cases.

 - ✨ [feat] Add `prefer-ts-extras-safe-cast-to` rule
   - Requires the use of `safeCastTo<T>(value)` from `ts-extras` for type-safe assertions instead of direct `as` casts.
   - Implements checks to ensure type safety and reports violations.
   - Includes tests to validate the functionality of the rule.

 - 🛠️ [fix] Update imports to use `import type` for TypeScript types
   - Changes imports in multiple files to use `import type` for better type-only imports, improving performance and clarity.

 - 🧪 [test] Add tests for new rules
   - Comprehensive test cases for both `prefer-ts-extras-as-writable` and `prefer-ts-extras-safe-cast-to` rules.
   - Includes valid and invalid scenarios to ensure robust rule enforcement.

 - 🧹 [chore] Update rule tester utilities
   - Adjustments to the rule tester to accommodate new rules and ensure compatibility with existing tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7702d74)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7702d7457c6a6f278e1a3ed786e9c46fa04dc6d0)


- ✨ [feat] Add .madgerc and .npmpackagejsonlintrc.json configuration files
 - Introduced .madgerc for managing TypeScript file extensions and visualization settings
 - Configured file extensions including ts, tsx, js, and others for better compatibility
 - Set up detective options for TypeScript and TSX with specific configurations
 - Added .npmpackagejsonlintrc.json for npm package JSON linting rules
 - Defined strict rules for dependencies, devDependencies, and various package properties
 - Included validation for author names and license types to ensure compliance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(52dea7a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/52dea7a2b170f4a07f7975d2c12f26773aa6fd5c)


- ✨ [feat] Enhance ESLint configuration and testing setup
 - 🔧 [build] Update global ignores to include test fixtures
 - 🔧 [build] Modify test file patterns for improved matching
 - 🧪 [test] Refactor assertions to use toBeTruthy() for clarity
 - 🧪 [test] Update test descriptions for better readability
 - 🧪 [test] Ensure all exported configs register the plugin correctly
 - 🧪 [test] Validate existence of documentation files for rules
 - 🔧 [build] Adjust Vite configuration for parallel test execution

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(570a740)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/570a7402f6ea936368bf1dd9364c107327357582)


- ✨ [feat] Adds canonical TypeFest alias lint rules

✨ [feat] Adds new typed lint coverage that prefers canonical utility-type naming for index-signature omission and key-level non-nullable, readonly, and required transformations.
 - Reduces migration friction across utility libraries and keeps public typing patterns consistent.
 - Keeps intentional test-file skip behavior so checks stay focused on production-facing type usage.

📝 [docs] Documents the new rule set with clear check scope and rationale.
 - Improves discoverability and explains why canonical naming is enforced.

🔧 [build] Updates lint and test infrastructure to better support rule adoption and test reliability.
 - Introduces a dedicated test lint profile with testing-focused plugins and safeguards against focused-only tests.
 - Adds serial and parallel test run scripts plus environment-driven worker and file-parallelism controls for faster local runs and safer CI defaults.
 - Expands resolver project coverage and aligns configuration compatibility notes for newer ESLint runtime behavior.

🧪 [test] Adds comprehensive fixtures and rule tests for valid, invalid, namespace, and test-path skip scenarios.
 - Strengthens plugin export assertions so newly added rules stay registered in exposed presets.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fdaf37b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fdaf37b4f0b1e9185e9d6b82c8cc11befb8f32d8)


- ✨ [feat] Adds canonical TypeFest alias rules

✨ [feat] Adds typed lint coverage that flags imported legacy aliases for all-or-none and at-least-one key groups, and steers usage toward canonical TypeFest utilities to reduce semantic drift.
 - ✨ [feat] Registers the new checks in exported rules and the minimal preset so enforcement is available by default.
 - ✨ [feat] Aligns plugin rule availability by including a previously missing TypeFest preference rule in registration and presets.

📝 [docs] Adds focused rule guides that explain detection scope and why canonical naming improves consistency and migration clarity.

🧪 [test] Expands typed fixtures and rule tests for invalid alias imports, valid canonical usage, namespace import exceptions, and skip-on-test-file behavior.
 - 🧪 [test] Improves existing typed fixtures with additional non-trigger patterns to better guard against false positives.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f3d1dfc)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f3d1dfcb50479d3e1319af1e2f213eb5bb1692d1)


- ✨ [feat] Enforces canonical TypeFest aliases

✨ [feat] Adds broad lint coverage to prefer canonical utility names over legacy or deprecated imported aliases.
 - Improves consistency and lowers migration friction by standardizing type utility vocabulary.
 - Avoids unsafe autofix where migration requires semantic rewrites.

🚜 [refactor] Centralizes imported type-alias detection in a shared internal matcher.
 - Reduces duplicated rule logic and keeps alias matching behavior uniform across checks.

✨ [feat] Expands preset exports with clearer semantic aliases and matching flat variants.
 - Improves preset discoverability while preserving existing preset behavior.

🔧 [build] Upgrades lint tooling to the latest major and updates flat-config compatibility handling.
 - Improves reliability by conditionally skipping incompatible third-party presets.
 - Improves lint runtime with caching, content-based cache strategy, and higher memory limits.

📝 [docs] Documents new rule expectations and clarifies alias-based enforcement in existing guidance.

🧪 [test] Adds comprehensive typed fixtures and rule coverage, including namespace-import pass cases, test-file skip scenarios, and helper property tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(38e7310)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/38e73102067f20b68f8508b95171511b178e3705)


- ✨ [feat] Implement prefer-type-fest-non-empty-tuple rule
 - 📝 Add documentation for the prefer-type-fest-non-empty-tuple rule
 - 🛠️ Create the prefer-type-fest-non-empty-tuple rule logic
 - 🔧 Integrate the rule into the ESLint plugin
 - 🧪 Add test cases for valid and invalid usages of NonEmptyTuple

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4715139)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4715139acd6f3d0f1d0e4a506eee30c84f5fea23)


- ✨ [feat] Enhance TypeScript Extras with New Array and Assertion Utilities
 - 🆕 [feat] Introduce `arrayFirst` and `arrayLast` utilities with valid and invalid test cases
 - 🆕 [feat] Add `assertDefined`, `assertError`, and `assertPresent` utilities with corresponding test cases
 - 🆕 [feat] Implement `isEmpty` and `isInfinite` checks with tests to validate their functionality
 - 🆕 [feat] Create `objectHasIn` utility for object property checks with tests
 - 🆕 [feat] Expand TypeFest integration with `Arrayable`, `JsonArray`, `JsonObject`, and `JsonPrimitive` types
 - 🆕 [feat] Add tests for TypeFest utilities to ensure correct usage and validation
 - 🧪 [test] Add comprehensive tests for all new features to ensure expected behavior and error handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e2d0ec0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e2d0ec00a7925321774f10dcbf9c8237464584b3)


- ✨ [feat] Update package.json and package-lock.json with new remark packages
 - Add "remark" and "remark-cli" for enhanced markdown processing
 - Include "remark-lint" for linting markdown files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a324362)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a3243623759d4219255e750c02b216e6bb5f224d)


- ✨ [feat] Update package.json and package-lock.json with new remark-lint rules
 - 🆕 Add "remark-lint-check-toc" version 1.0.0 for table of contents checks
 - 🆕 Add "remark-lint-heading-capitalization" version 1.3.0 for heading capitalization checks
 - 🆕 Add "remark-lint-list-item-spacing" version 5.0.1 for list item spacing checks
 - 🆕 Add "remark-lint-maximum-heading-length" version 4.1.1 for heading length checks
 - 🆕 Add "remark-lint-maximum-line-length" version 4.1.1 for line length checks
 - 🆕 Add "remark-lint-mdx-jsx-attribute-sort" version 1.0.1 for MDX JSX attribute sorting
 - 🆕 Add "remark-lint-mdx-jsx-no-void-children" version 1.0.1 for MDX JSX void children checks
 - 🆕 Add "remark-lint-no-duplicate-defined-urls" version 3.0.1 for duplicate URL checks
 - 🆕 Add "remark-lint-no-empty-url" version 4.0.1 for empty URL checks
 - 🆕 Add "remark-lint-no-file-name-mixed-case" version 3.0.1 for mixed case file name checks
 - 🆕 Add "remark-lint-no-heading-punctuation" version 4.0.1 for heading punctuation checks
 - 🆕 Add "remark-lint-no-literal-urls" version 4.0.1 for literal URL checks
 - 🆕 Add "remark-lint-strikethrough-marker" version 3.0.1 for strikethrough marker checks
 - 🆕 Add "remark-lint-table-cell-padding" version 5.1.1 for table cell padding checks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(55a2687)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/55a26876bf6c5a78873fe449590b9fde596ec41d)


- ✨ [feat] Enhance TypeScript rule testing and add new type utilities

 - 🔧 [build] Update `tsconfig` files to improve project structure and exclude unnecessary directories
   - Adjust `tsconfig.build.json` to include `exclude` patterns for `.cache`, `dist`, and `node_modules`
   - Modify `tsconfig.eslint.json` to include additional `include` patterns for TypeScript files
   - Refactor `tsconfig.js.json` to streamline configuration and exclude unnecessary files
   - Clean up `tsconfig.json` by removing redundant options and improving `exclude` patterns

 - 🛠️ [fix] Improve type safety in rule tests
   - Refactor `typed-rule-tester.ts` to enhance project service options and allow default projects
   - Create new test fixtures for `prefer-type-fest-*` rules to ensure proper type handling
   - Update existing tests for `prefer-ts-extras-*` rules to use the new testing structure

 - ✨ [feat] Introduce new type utilities using `type-fest`
   - Add `prefer-type-fest-async-return-type` rule to enforce the use of `AsyncReturnType`
   - Implement `prefer-type-fest-except` rule to promote the use of `Except` for type manipulation
   - Create tests for `UnknownArray`, `UnknownMap`, and `UnknownSet` to validate type safety

 - 🧪 [test] Add comprehensive tests for new and existing rules
   - Implement tests for `prefer-type-fest-*` rules to ensure they function as expected
   - Update test cases for `prefer-ts-extras-*` rules to align with new testing methodology

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c7085da)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c7085daeaa35a5fc9a980e327d28113b35a8dcee)


- ✨ [feat] Update dependencies and add Vite configuration for linting

 - 🔧 [build] Upgrade various ESLint plugins and configurations in `package.json` to enhance linting capabilities
   - Added new plugins: `@eslint/config-helpers`, `@eslint/css`, `@eslint/json`, `@eslint/markdown`, `@html-eslint/eslint-plugin`, `@html-eslint/parser`, `@vitest/eslint-plugin`, and many others for improved code quality and support for various file types
   - Updated existing plugins to their latest versions for better performance and features
   - Included `vite` and `vite-tsconfig-paths` for better integration with TypeScript and Vite tooling

 - 🎨 [style] Introduce `vite.config.ts` for Vitest configuration
   - Configured Vitest to run linting and tooling tests with detailed coverage settings
   - Set up environment variables and paths for better project structure and maintainability
   - Defined test settings including coverage thresholds, file exclusions, and test timeouts to ensure robust testing practices
   - Implemented caching and optimization settings for improved performance during test runs

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bd59068)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bd5906889751671df9f18db89fa218f2cbcd763c)


- ✨ [feat] Update package.json with new dependencies for enhanced linting and markdown processing
 - 🆕 Added "@double-great/remark-lint-alt-text" for alt text linting in markdown
 - 🆕 Included "@typescript-eslint/eslint-plugin" and "@typescript-eslint/parser" for improved TypeScript linting
 - 🆕 Introduced "actionlint" for GitHub Actions linting
 - 🆕 Added various "remark-lint" plugins to enforce markdown style and consistency
 - 🆕 Included "remark-math" and "rehype-katex" for better math rendering in markdown
 - 🆕 Added "remark-validate-links" to ensure all links in markdown are valid
 - 🆕 Included "remark-toc" for automatic table of contents generation in markdown files
 - 🆕 Added "remark-preset-lint-recommended" and other presets for consistent linting rules

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a7c1162)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a7c1162a1e8a86c7543310ef491fc7a4cbcaf1a9)


- ✨ [feat] Enhance ESLint Plugin with New Rules and TypeScript Configurations
 - 🆕 [feat] Introduce `prefer-ts-extras-array-concat` rule to enforce usage of `arrayConcat` from `ts-extras` for better typing.
 - 🆕 [feat] Add `prefer-ts-extras-is-finite`, `prefer-ts-extras-is-integer`, and `prefer-ts-extras-is-safe-integer` rules to promote consistent predicate helper usage over native `Number` methods.
 - 🔧 [build] Update `package.json` to include new linting scripts for actions and prettier, and adjust TypeScript configurations for better build management.
 - 🔧 [build] Modify `typecheck` script to include additional TypeScript configurations for comprehensive type checking.
 - 🔧 [build] Update `tsconfig.json` and related configurations to improve project structure and build performance.
 - 🧪 [test] Add tests for new rules to ensure correct functionality and adherence to coding standards.
 - 🧪 [test] Create valid and invalid fixture files for each new rule to facilitate thorough testing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4c55f69)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4c55f695e4a6214348d084e0756ea4af6fac83f1)


- Add prefer-ts-extras rules for array and object utilities [`(e7bdca6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e7bdca6ae1d25f5fcd0ada0b2234d1cf86f5cf03)


- Add prefer-type-fest-value-of rule to enforce ValueOf<T> usage [`(6aa5b95)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6aa5b955e06d923a1e6754e3edb7fa378d095f0c)



### 🛠️ Bug Fixes

- 🛠️ [fix] Remove unused prettier-plugin-jsdoc-type from configuration
 - Eliminated "prettier-plugin-jsdoc-type" from the plugins list in multiple sections of the .prettierrc file

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3d31bbc)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3d31bbc7a6e3e09429df3cc42c134218158c9ee2)


- 🛠️ [fix] Update messages for TypeFest rule tests to improve clarity
 - 📝 Refactor error messages in `prefer-type-fest-set-non-nullable.test.ts` to specify making selected keys non-nullable instead of using legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-set-optional.test.ts` to clarify making selected keys optional instead of using legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-set-readonly.test.ts` to indicate marking selected keys as readonly instead of using legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-set-required.test.ts` to specify making selected keys required instead of using legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-simplify.test.ts` to clarify flattening resolved object and intersection types instead of using legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-tagged-brands.test.ts` to indicate using canonical tagged-brand aliases instead of legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-tuple-of.test.ts` to clarify modeling fixed-length homogeneous tuples instead of using legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-unknown-array.test.ts` to specify using `Readonly<UnknownArray>` instead of legacy types.
 - 📝 Refactor error messages in `prefer-type-fest-unknown-map.test.ts` to clarify using `Readonly<UnknownMap>` instead of legacy types.
 - 📝 Refactor error messages in `prefer-type-fest-unknown-record.test.ts` to improve clarity on reporting unknown record aliases.
 - 📝 Refactor error messages in `prefer-type-fest-unknown-set.test.ts` to specify using `Readonly<UnknownSet>` instead of legacy types.
 - 📝 Refactor error messages in `prefer-type-fest-unwrap-tagged.test.ts` to clarify unwrapping Tagged/Opaque values instead of using legacy aliases.
 - 📝 Refactor error messages in `prefer-type-fest-value-of.test.ts` to improve clarity on indexed-access value unions.
 - 📝 Refactor error messages in `prefer-type-fest-writable.test.ts` to specify removing readonly modifiers from selected keys instead of using legacy aliases.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c606fd2)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c606fd2b73ca23cfb48854fc0170aae43635d1c6)


- 🛠️ [fix] Adds missing-import insertion to autofixes

🛠️ [fix] Improves autofix reliability by applying safe rewrites even when required helper imports are not already present.
 - Adds import insertion for both type-level and value-level replacements, so fixes remain usable instead of failing closed.
 - Preserves safety by keeping scope/shadowing checks before deciding whether direct names can be introduced.

🚜 [refactor] Unifies replacement generation behind shared fix builders to reduce duplicated rule logic.
 - Centralizes how replacements resolve local names, build replacement text, and compose multi-part fixes.
 - Keeps import placement deterministic by inserting after existing imports or at file start when none exist.
 - Tightens internal typing with shared unknown collection types to improve consistency across rule contexts.

🧪 [test] Expands autofix and suggestion coverage to lock in import-aware behavior.
 - Updates many invalid cases to assert concrete transformed output, including scenarios that now require inserted imports.
 - Adds multi-pass expected outputs for fixtures where several findings are fixed across repeated runs.
 - Strengthens suggestion output assertions and mixed line-ending fixtures to guard against regression in real editor flows.

🎨 [style] Applies minor formatting and comment cleanup in auxiliary scripts and config text for readability without changing runtime behavior.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7639e4d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7639e4d3d04fd40ec505141ee4c9d5a6fce34388)


- 🛠️ [fix] Improve documentation link checker functionality
 - Enhance `isUrlLike` function comment for clarity
 - Add pathExists caching to optimize link validation
 - Implement concurrency control for file checks
 - Introduce metrics tracking for link validation results
 - Update error handling and logging for better feedback
 - Refactor link validation logic to reduce redundancy

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(721700d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/721700d4f551e3b9b70675dc68c11b9ccd4f0c72)


- 🛠️ [fix] Guard missing filenames in lint rules

🛠️ [fix] Prevents undefined-path behavior by defaulting missing lint context filenames before test-file short-circuit checks.
 - Improves runtime safety for rule execution in nonstandard or mocked contexts.

🧹 [chore] Expands prompt audit records with host, user, shell version, and ISO timestamp metadata.
 - Improves traceability for local hook activity and environment diagnostics.

👷 [ci] Stabilizes mutation-report publishing metadata.
 - Normalizes repository identity casing and pins dashboard version labeling to a stable branch value.

🧪 [test] Adds broad mutation-focused coverage for rule metadata, filename fallbacks, and edge-case matching/fixing behavior.
 - Introduces shared metadata smoke checks and extends many rule suites with no-fix, suggestion, whitespace-normalization, shadowing, and qualified-type scenarios to reduce survivor regressions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c7c99db)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c7c99dba2a2b84979ad8462087f8c60348cbda73)


- 🛠️ [fix] Improves rule matching and early exits

🛠️ [fix] Improves array-like type detection to reduce missed matches.
 - Normalizes rendered type text before checking suffixes.
 - Uses a single `[]`-based check so readonly array forms are handled consistently.

🚜 [refactor] Moves test-file short-circuiting ahead of import scanning across rules.
 - Avoids unnecessary analysis work for excluded files.
 - Improves rule setup efficiency and keeps behavior consistent.

🛠️ [fix] Makes replacement-name handling explicit in autofix paths.
 - Switches from truthy checks to null checks to prevent accidentally skipping valid replacements.

🔧 [build] Repositions dependency override metadata.
 - Keeps package configuration ordering consistent while retaining the parser version override.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ede063)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3ede06303b78cea7525adb221778dea080e352a9)


- 🛠️ [fix] Stabilizes plugin export defaults

🛠️ [fix] Ensures the published plugin always exposes a complete, predictable object shape.
 - Prevents runtime and integration failures when optional sections are missing from built output.
 - Removes brittle undefined-path handling by applying safe defaults at the entry boundary.

🧪 [test] Improves shared test-run behavior and test failure diagnostics.
 - Uses proper focused-test wiring and generates readable fallback names for unnamed cases.
 - Preserves explicit case names while making anonymous case failures easier to identify.

🧪 [test] Expands rule coverage with broader, named valid/invalid edge cases.
 - Adds stronger regression protection for unions, callback shapes, guard patterns, skip-path behavior, and non-target method/property lookalikes.

📝 [docs] Strengthens quality-first contribution guidance.
 - Reinforces correctness and maintainability over shortcuts, including iterative follow-up when needed.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8f4b499)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8f4b499a6c0285c3cc0b92c4ba08b78af04e8a08)


- 🛠️ [fix] Update type aliases to use TypeScript's type-fest library

 - 🔧 [fix] Replace `MaybePromise` with `Promisable` in `prefer-type-fest-promisable.test.ts`
 - 🔧 [fix] Replace `DeepReadonly` with `ReadonlyDeep` in `prefer-type-fest-readonly-deep.test.ts`
 - 🔧 [fix] Replace `DeepRequired` with `RequiredDeep` in `prefer-type-fest-required-deep.test.ts`
 - 🔧 [fix] Replace `RecordDeep` with `Schema` in `prefer-type-fest-schema.test.ts`
 - 🔧 [fix] Replace `NonNullableBy` with `SetNonNullable` in `prefer-type-fest-set-non-nullable.test.ts`
 - 🔧 [fix] Replace `PartialBy` with `SetOptional` in `prefer-type-fest-set-optional.test.ts`
 - 🔧 [fix] Replace `ReadonlyBy` with `SetReadonly` in `prefer-type-fest-set-readonly.test.ts`
 - 🔧 [fix] Replace `RequiredBy` with `SetRequired` in `prefer-type-fest-set-required.test.ts`
 - 🔧 [fix] Replace `Expand` with `Simplify` in `prefer-type-fest-simplify.test.ts`
 - 🔧 [fix] Replace `Opaque` with `Tagged` in `prefer-type-fest-tagged-brands.test.ts`
 - 🔧 [fix] Replace `ReadonlyTuple` with `Readonly<TupleOf<Length, Element>>` in `prefer-type-fest-tuple-of.test.ts`
 - 🔧 [fix] Replace `readonly unknown[]` with `unknown[]` in `prefer-type-fest-unknown-array.test.ts`
 - 🔧 [fix] Replace `ReadonlyMap<unknown, unknown>` with `Map<unknown, unknown>` in `prefer-type-fest-unknown-map.test.ts`
 - 🔧 [fix] Replace `ReadonlySet<unknown>` with `Set<unknown>` in `prefer-type-fest-unknown-set.test.ts`
 - 🔧 [fix] Replace `UnwrapOpaque` with `UnwrapTagged` in `prefer-type-fest-unwrap-tagged.test.ts`
 - 🔧 [fix] Replace `Mutable` with `Writable` in `prefer-type-fest-writable.test.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(895cb41)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/895cb413648d9421fcfd6c557cb66025ebc1cb8d)



### 📦 Dependencies

- *(deps)* [dependency] Update the github-actions group across 1 directory with 7 updates [`(7b08932)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7b089328816b87606e9b80a03a22495aecfd7de0)


- *(deps)* [dependency] Update the github-actions group across 1 directory with 8 updates [`(acd2932)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/acd29320fdc5e4e99afe81e099e3f6beb622f455)



### 🛡️ Security

- [StepSecurity] Apply security best practices

Signed-off-by: StepSecurity Bot <bot@stepsecurity.io> [`(de875de)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/de875ded17a8f5ee5851d27586215eeb2bf1d419)



### 🛠️ Other Changes

- 🗑️ [chore] Remove ESLint Config Inspector build and verification scripts
 - Deleted `build-eslint-inspector.mjs` and `verify-eslint-inspector.mjs` scripts
 - These scripts were responsible for building and verifying the ESLint Config Inspector integration
 - Their removal simplifies the project structure and eliminates unused code

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79dd244)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/79dd2444ee0729ab547a608945aca8f9097070fc)


- 📝 [test] Enhance type-fest rule tests with additional cases

 - ✨ [test] Add valid cases for Awaited with Promise and qualified ReturnType
 - ✨ [test] Introduce inline fixable cases for ConditionalPick and update error messages
 - ✨ [test] Add tests for constructor signature validation
 - ✨ [test] Expand Except tests with inline fixable cases and valid namespace aliases
 - ✨ [test] Introduce inline fixable cases for IfAny and IsAny
 - ✨ [test] Add tests for IterableElement and SetElement with inline fixable cases
 - ✨ [test] Enhance JsonArray tests with various valid and invalid cases
 - ✨ [test] Add tests for JsonObject with inline invalid cases
 - ✨ [test] Expand JsonValue tests with inline invalid cases and valid types
 - ✨ [test] Introduce KeysOfUnion tests with inline fixable cases
 - ✨ [test] Add tests for NonEmptyTuple with various valid cases
 - ✨ [test] Enhance OmitIndexSignature tests with inline fixable cases
 - ✨ [test] Introduce RequireAllOrNone tests with inline fixable cases
 - ✨ [test] Add RequireAtLeastOne tests with inline fixable cases
 - ✨ [test] Introduce RequireExactlyOne tests with inline fixable cases
 - ✨ [test] Add RequireOneOrNone tests with inline fixable cases
 - ✨ [test] Enhance TaggedBrands tests with inline invalid cases
 - ✨ [test] Add UnknownArray tests with various valid and invalid cases
 - ✨ [test] Introduce UnknownMap tests with additional valid cases
 - ✨ [test] Add UnknownRecord tests with inline invalid cases
 - ✨ [test] Enhance UnknownSet tests with additional valid cases
 - ✨ [test] Expand Writable tests with various valid cases and namespace aliases

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ec44a53)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ec44a53779b9a5e7d5ea0f2e0f08c7c318a92366)


- Add tests and TypeScript configuration for uptime-watcher plugin

- Implement tests for various rules in the uptime-watcher plugin, including:
  - prefer-ts-extras-is-present-filter
  - prefer-ts-extras-object-has-own
  - prefer-type-fest-json-value
  - prefer-type-fest-promisable
  - prefer-type-fest-tagged-brands
  - prefer-type-fest-unknown-record
  - prefer-type-fest-value-of
  - preload-no-local-is-plain-object
  - renderer-no-browser-dialogs
  - renderer-no-direct-bridge-readiness
  - renderer-no-direct-electron-log
  - renderer-no-direct-networking
  - renderer-no-direct-preload-bridge
  - renderer-no-electron-import
  - renderer-no-import-internal-service-utils
  - renderer-no-ipc-renderer-usage
  - renderer-no-preload-bridge-writes
  - renderer-no-process-env
  - renderer-no-window-open
  - require-ensure-error-in-catch
  - require-error-cause-in-catch
  - shared-no-outside-imports
  - shared-types-no-local-is-plain-object
  - store-actions-require-finally-reset
  - test-no-mock-return-value-constructors
  - tsdoc-no-console-example
  - typed-eventbus-payload-assignable

- Add TypeScript configuration files for linting and building the uptime-watcher plugin.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d233b9c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d233b9c2b49f5f87e10e2c2ee04deed9765f54a3)



### 🚜 Refactor

- 🚜 [refactor] switch rule docs to Docusaurus routes & add footer links

📝 [docs] add ADR 0006/0007 entries and pages, update sidebar/index with new decisions
🚜 [refactor] change docs‑URL base constants and rule‑creator logic to use live site routes (`…/rules/<id>`) instead of GitHub blob markdown links
🚜 [refactor] update all rule metadata defaults and inline urls accordingly
🧪 [test] adjust smoke, integration and individual rule tests to expect `/rules/<id>` URLs and remove `.md` suffix checks
📝 [docs] append a consistent “Adoption resources” footer to every rule page linking shared guides
📝 [docs] create ADRs explaining canonical URL strategy and footer link rationale

Enhances user experience by pointing editors and links at rendered documentation, stabilizes the public docs surface independent of repo layout, and keeps shared guidance discoverable without duplicating boilerplate. Tests and sources no longer assume `.md` filenames; route stability is now a compatibility concern.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(91a136d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/91a136dbd7dd14660f9a4b9a6aeffc0e4a6b7657)


- 🚜 [refactor] Improve code readability and formatting in inspect_pr_checks.py
 - 🛠️ Adjust function signatures for better clarity
 - 🎨 Reformat argument lists and string literals for consistency
 - 🔧 Enhance error handling messages for better debugging
 - 🎨 Improve indentation and line breaks for better readability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a62ba9e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a62ba9eb919101eabe2fde50818be1b64866cdd4)


- 🚜 [refactor] Treats tests like other files

🚜 [refactor] Aligns plugin/test heuristics
 - 🧪 Removes test-path skips and the heuristic so rules always lint tests while relying on config scoping, and cleans up fixtures that only exercised the skip path.
 - ⚙️ Updates benchmark scripts/config to build before running stats/timing suites and adds explicit namespace metadata to the plugin entry for clearer identification.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(72c85a8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72c85a8e2335f64003b42f78dc8104a105169f03)


- 🚜 [refactor] Remove redundant defaultOptions stubs

🚜 [refactor] - Drops the explicit defaultOptions arrays from typed rule definitions so configuration relies on implicit defaults and keeps source definitions concise.
🎨 [style] - Refreshes doc/test helpers with tighter formatting for import/type utilities and assertion checks to match the cleaned-up style.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(60e7e00)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/60e7e0073c1a54ac8b6611e269bc74a53537aa3c)


- 🚜 [refactor] Enforce readonly parameter typing

🚜 [refactor] Expands readonly annotations across core typed utilities and rule logic so function inputs stay immutable by default.
 - Improves type-safety consistency and reduces accidental mutation paths without changing runtime behavior.

🔧 [build] Tunes readonly-parameter linting to stay strict on explicit APIs while avoiding noisy inferred-parameter churn.
 - Adds practical allowlists for common external types and method handling so enforcement remains useful and sustainable.

🧪 [test] Aligns test helpers and listener harness typings with the stricter immutability model.
 - Applies safer optional access and targeted writable casts only where test scaffolding must mutate nodes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0422fd8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0422fd8f088a1e8f6231815f795e57e4a01a916c)


- Migrate plugin to TypeScript and restructure codebase [`(2101a3e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2101a3ec1f446f93c0351941344f34603bfb3f13)



### 📝 Documentation

- 📝 [docs] Update TypeFest rule documentation for clarity and consistency
 - 📝 [docs] Revise `prefer-type-fest-tuple-of` to emphasize deprecated alias usage
 - 📝 [docs] Clarify behavior and migration notes in `prefer-type-fest-unknown-array`
 - 📝 [docs] Enhance `prefer-type-fest-unknown-map` documentation with intent and usage
 - 📝 [docs] Improve `prefer-type-fest-unknown-record` to focus on boundary contracts
 - 📝 [docs] Refine `prefer-type-fest-unknown-set` to highlight shared alias benefits
 - 📝 [docs] Update `prefer-type-fest-unwrap-tagged` to target deprecated alias usage
 - 📝 [docs] Clarify `prefer-type-fest-value-of` to emphasize clarity in value extraction
 - 📝 [docs] Revise `prefer-type-fest-writable-deep` to standardize deep mutability usage
 - 📝 [docs] Update `prefer-type-fest-writable` to clarify targeted patterns and behavior
 - 📝 [docs] Add alternative configuration example for applying recommended rules selectively
🛠️ [fix] Normalize line endings in typed rule tester fixtures
 - 🛠️ [fix] Implement line ending normalization to ensure consistent fixture reading

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9acb9a8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9acb9a8bb27cf23d4503b52c095c48120bf5f568)


- 📝 [docs] Adds ADR hub and updates docs build flow

📝 [docs] Adds an ADR section with an index and three accepted decisions to capture architectural intent and reduce repeated dependency-adoption discussions.
 - Defines why current internal rule/runtime patterns remain in place and when those decisions should be revisited.

🎨 [style] Updates sidebar badges and accent styling so architecture decisions are easier to find and remain visually consistent with existing documentation sections.

🔧 [build] Updates documentation build orchestration to rely on workspace-level inspector build commands and introduces a faster docs build path for quicker iteration.
 - Improves local build ergonomics and keeps generated docs steps aligned across environments.

🧹 [chore] Refreshes selected lint and style tooling versions and expands script-level documentation comments to improve maintenance clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(51d6a5d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/51d6a5d7ca6f3c5e14f32794f20f4c6ddb91f5cd)


- 📝 [docs] Update Code of Conduct to reflect no formal guidelines
🔧 [build] Change logo file types in manifest.json from SVG to PNG
🎨 [style] Enhance case name formatting in ruleTester.ts for better visibility
🔧 [build] Simplify project name label in vite.config.ts from "Frontend" to "Test"
🔧 [build] Update vitest configuration in vitest.stryker.config.ts for improved test handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7d246f8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7d246f84d4928bbae4ddfb3d51bb092a56864ef0)


- 📝 [docs] Update documentation scripts in package.json

 - 🔧 Reordered the `docs:toc` and `docs:validate-links` scripts for better clarity and consistency.
 - 🛠️ Removed the old `docs:validate-links` script and added it back after `docs:toc` to maintain logical flow.
 - 🔧 Updated the `remark` dependencies to ensure the latest features and fixes are utilized.
 - 🧹 Removed unused `mdast` dependency to clean up package.json and reduce bloat.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f099e8d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f099e8d191c3e432d3f50535834e08cef9ce09cb)


- 📝 [docs] Update strict and type-fest-types presets documentation

 - 📜 Refactor the rules table in `strict.md` for better readability
   - Added new rules: `prefer-type-fest-abstract-constructor`, `prefer-type-fest-constructor`, `prefer-type-fest-literal-union`, `prefer-type-fest-merge-exclusive`, `prefer-type-fest-required-deep`, `prefer-type-fest-readonly-deep`, and `prefer-type-fest-writable-deep`
   - Removed outdated rules: `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, `prefer-type-fest-value-of`, and `prefer-type-fest-writable`

 - 📜 Refactor the rules table in `type-fest-types.md` for better readability
   - Added new rules: `prefer-type-fest-abstract-constructor`, `prefer-type-fest-constructor`, `prefer-type-fest-literal-union`, `prefer-type-fest-merge-exclusive`, `prefer-type-fest-required-deep`, `prefer-type-fest-readonly-deep`, and `prefer-type-fest-writable-deep`
   - Removed outdated rules: `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, `prefer-type-fest-value-of`, and `prefer-type-fest-writable`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(92500d2)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/92500d25d901851046813ee34b0d0ba1bc29663f)


- 📝 [docs] Update presets documentation with rule matrices and details

 - 📜 Added a comprehensive rule matrix to `index.md` for better visibility of rules, fixes, and preset keys.
 - 📜 Included specific rules in the `minimal.md` preset documentation to clarify which rules are included.
 - 📜 Expanded the `recommended.md` preset documentation to list all applicable rules, enhancing user guidance.
 - 📜 Updated `strict.md` preset documentation with a detailed list of rules to inform users of strict configurations.
 - 📜 Enhanced `ts-extras-type-guards.md` with a complete list of rules to provide clarity on type guard functionalities.
 - 📜 Updated `type-fest-types.md` to include a detailed list of rules, ensuring users understand the available type fest functionalities.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b8b30d5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b8b30d533d1ccda5f5d9450da6013c9eb6997a57)


- 📝 [docs] Enhance documentation across multiple rules and tests

 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-ts-extras-is-empty.ts`
 - 📝 [docs] Document utility functions in `prefer-ts-extras-is-infinite.ts`
 - 📝 [docs] Improve documentation for helper functions in `prefer-ts-extras-is-present-filter.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-ts-extras-is-present.ts`
 - 📝 [docs] Document utility functions in `prefer-ts-extras-not.ts`
 - 📝 [docs] Enhance documentation for helper functions in `prefer-ts-extras-object-has-in.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-ts-extras-safe-cast-to.ts`
 - 📝 [docs] Document utility functions in `prefer-type-fest-arrayable.ts`
 - 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-async-return-type.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-except.ts`
 - 📝 [docs] Document utility functions in `prefer-type-fest-json-array.ts`
 - 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-json-object.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-json-primitive.ts`
 - 📝 [docs] Document utility functions in `prefer-type-fest-json-value.ts`
 - 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-non-empty-tuple.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-primitive.ts`
 - 📝 [docs] Document utility functions in `prefer-type-fest-promisable.ts`
 - 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-tagged-brands.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-unknown-array.ts`
 - 📝 [docs] Document utility functions in `prefer-type-fest-unknown-map.ts`
 - 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-unknown-record.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-unknown-set.ts`
 - 📝 [docs] Document utility functions in `prefer-type-fest-value-of.ts`
 - 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-writable.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `imported-type-aliases.test.ts`
 - 📝 [docs] Document utility functions in `ruleTester.ts`
 - 📝 [docs] Enhance documentation for utility functions in `configs.test.ts`
 - 📝 [docs] Add JSDoc comments for utility functions in `docs-integrity.test.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(562ff90)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/562ff901516df7171c834f22ed0b83b92cdcc693)


- 📝 [docs] Enhance ESLint rule documentation across multiple files

 - ✨ [feat] Add detailed ESLint rule definitions and metadata for `prefer-ts-extras-object-keys`, `prefer-ts-extras-object-values`, `prefer-ts-extras-safe-cast-to`, `prefer-ts-extras-set-has`, `prefer-ts-extras-string-split`, `prefer-type-fest-arrayable`, `prefer-type-fest-async-return-type`, `prefer-type-fest-conditional-pick`, `prefer-type-fest-except`, `prefer-type-fest-if`, `prefer-type-fest-iterable-element`, `prefer-type-fest-json-array`, `prefer-type-fest-json-object`, `prefer-type-fest-json-primitive`, `prefer-type-fest-json-value`, `prefer-type-fest-keys-of-union`, `prefer-type-fest-non-empty-tuple`, `prefer-type-fest-omit-index-signature`, `prefer-type-fest-primitive`, `prefer-type-fest-promisable`, `prefer-type-fest-require-all-or-none`, `prefer-type-fest-require-at-least-one`, `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, and `prefer-type-fest-value-of`.
 - 📝 [docs] Add JSDoc comments to clarify the purpose and usage of each rule, enhancing maintainability and developer understanding.
 - 🧹 [chore] Update `ruleTester` utility functions with additional documentation to improve clarity on their usage and functionality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ef195de)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ef195de3aaabb27a1e3542df4c1a025a2d28c701)


- 📝 [docs] Update CSS documentation and global styles for Docusaurus
 - Added global CSS overrides for Docusaurus documentation site.
 - Enhanced comments to clarify the purpose and scope of the CSS file.
 - Updated hover background color for sidebar menu links for better accessibility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6863895)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/68638954b10b776b033cd5a207f83531347f28ab)


- 📝 [docs] Adds package-level module docs

📝 [docs] Improves maintainability and generated docs clarity by adding consistent package-level headers across core modules, plugin wiring, and rule implementations.
 - 📝 [docs] Clarifies module intent so contributors and tooling can understand responsibilities faster.

📝 [docs] Updates the rules reference table layout to improve readability and quick scanning.
 - 🎨 [style] Normalizes column alignment while preserving existing rule metadata.

🧪 [test] Applies the same package-level documentation pattern to test utilities and suites for repository-wide consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(84bc8a1)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/84bc8a1d500497e1ce3bd9302f1aefd69b698c79)


- 📝 [docs] Update documentation for type-fest utility rules

 - 🔧 Refactor rule documentation to replace "Legacy" terminology with "Non-canonical" for clarity.
 - 📝 Enhance examples in `prefer-type-fest-require-one-or-none.md`, `prefer-type-fest-schema.md`, and other related files to reflect updated import aliases.
 - 📝 Modify adoption tips across multiple rule documents to emphasize direct canonical imports and discourage compatibility aliases.
 - 📚 Update rollout strategies in various rule documents to clarify migration processes and reduce review noise.
 - 🔍 Ensure consistency in references to `typefest.configs["type-fest/types"]` across all relevant documentation files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(07214d3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/07214d3546cf52dafafc26936403cf090ddffb3c)


- 📝 [docs] Update documentation for type-fest utility types

 - 📝 Improve clarity in examples for `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, and `prefer-type-fest-value-of` rules.
 - 🔄 Replace non-canonical patterns with comments indicating legacy patterns repeated inline across modules.
 - 📚 Enhance the "Why this helps in real projects" section to emphasize shared type vocabulary, safer API evolution, and no runtime overhead.
 - 🛠️ Update `eslint.config.mjs` to fix plugin imports and improve configuration.
 - 🔄 Update `package-lock.json` and `package.json` to reflect version upgrades for various ESLint plugins, ensuring compatibility and access to new features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9a45e98)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9a45e98c3c63a49374ed2dbfe37e1a45b518a564)


- 📝 [docs] Add comprehensive guidelines for various file types in the repository

 - ✨ [feat] Introduce JSON guidelines to ensure clarity and consistency in JSON files
   - Emphasize strictness and intentionality in JSON structure
   - Provide style recommendations, structural best practices, and security considerations

 - ✨ [feat] Add MJS guidelines for modern JavaScript modules
   - Focus on ESM usage, syntax preferences, and async patterns
   - Encourage documentation and type annotations for better maintainability

 - ✨ [feat] Establish Markdown guidelines for documentation and content creation
   - Outline content rules, formatting standards, and front matter usage
   - Include tooling alignment instructions for maintaining Markdown quality

 - ✨ [feat] Create detailed instructions for testing ESLint rules
   - Define goals for ESLint rule testing, setup requirements, and coding standards
   - Highlight best practices for writing tests, including valid and invalid cases

 - ✨ [feat] Provide TypeScript 5.9+ development guidelines
   - Focus on modern TypeScript features, strict typing, and utility types
   - Emphasize error handling, async patterns, and coding style best practices

 - ✨ [feat] Introduce YAML guidelines for robust YAML authoring
   - Stress predictability and readability in YAML files
   - Offer style, structure, and tooling recommendations for YAML usage

 - ✨ [feat] Add Copilot instructions for ESLint plugin development
   - Define the role, architecture, and constraints for ESLint rule creation
   - Emphasize code quality, testing standards, and tool usage for effective development

 - 🧹 [chore] Remove instructions folder from .gitignore to allow tracking of new guidelines

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(976452b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/976452b5c39227330fa42d56f08eab88968d53a6)


- 📝 [docs] Add configuration files for various tools
 - Created `.taplo.toml` for TOML formatting rules, aligning with Prettier's style.
 - Introduced `.yamllint` for YAML linting configuration, specifying rules and ignored paths.
 - Added `cliff.toml` for git-cliff configuration to generate changelogs based on conventional commits.
 - Implemented `commitlint.config.mjs` to enforce commit message standards, including emoji and scope validation.
 - Established `jscpd.json` for configuring the jscpd tool to detect code duplication.
 - Created `kics.yaml` for KICS configuration, focusing on Infrastructure as Code security scanning.
 - Added `lychee.toml` for configuring the lychee link checker, including caching and request settings.
 - Introduced `markdownlint.json` for markdown linting rules, ensuring consistent formatting across markdown files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(20a6723)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/20a672338e3a0d93f3a85dca1dd1df52e48b18eb)



### 🎨 Styling

- 🎨 [style] Clean up trailing whitespace in TypeScript rule files
 - Removed trailing whitespace from multiple TypeScript rule files to maintain code consistency and cleanliness.
 - Affected files include:
   - `prefer-ts-extras-is-finite.ts`
   - `prefer-ts-extras-is-infinite.ts`
   - `prefer-ts-extras-is-integer.ts`
   - `prefer-ts-extras-is-present-filter.ts`
   - `prefer-ts-extras-is-present.ts`
   - `prefer-ts-extras-is-safe-integer.ts`
   - `prefer-ts-extras-key-in.ts`
   - `prefer-ts-extras-not.ts`
   - `prefer-ts-extras-object-entries.ts`
   - `prefer-ts-extras-object-from-entries.ts`
   - `prefer-ts-extras-object-has-in.ts`
   - `prefer-ts-extras-object-has-own.ts`
   - `prefer-ts-extras-object-keys.ts`
   - `prefer-ts-extras-object-values.ts`
   - `prefer-ts-extras-safe-cast-to.ts`
   - `prefer-ts-extras-set-has.ts`
   - `prefer-ts-extras-string-split.ts`
   - `prefer-type-fest-arrayable.ts`
   - `prefer-type-fest-async-return-type.ts`
   - `prefer-type-fest-conditional-pick.ts`
   - `prefer-type-fest-constructor.ts`
   - `prefer-type-fest-except.ts`
   - `prefer-type-fest-if.ts`
   - `prefer-type-fest-iterable-element.ts`
   - `prefer-type-fest-json-array.ts`
   - `prefer-type-fest-json-object.ts`
   - `prefer-type-fest-json-primitive.ts`
   - `prefer-type-fest-json-value.ts`
   - `prefer-type-fest-keys-of-union.ts`
   - `prefer-type-fest-literal-union.ts`
   - `prefer-type-fest-merge-exclusive.ts`
   - `prefer-type-fest-non-empty-tuple.ts`
   - `prefer-type-fest-omit-index-signature.ts`
   - `prefer-type-fest-partial-deep.ts`
   - `prefer-type-fest-primitive.ts`
   - `prefer-type-fest-promisable.ts`
   - `prefer-type-fest-readonly-deep.ts`
   - `prefer-type-fest-require-all-or-none.ts`
   - `prefer-type-fest-require-at-least-one.ts`
   - `prefer-type-fest-require-exactly-one.ts`
   - `prefer-type-fest-require-one-or-none.ts`
   - `prefer-type-fest-required-deep.ts`
   - `prefer-type-fest-schema.ts`
   - `prefer-type-fest-set-non-nullable.ts`
   - `prefer-type-fest-set-optional.ts`
   - `prefer-type-fest-set-readonly.ts`
   - `prefer-type-fest-set-required.ts`
   - `prefer-type-fest-simplify.ts`
   - `prefer-type-fest-tagged-brands.ts`
   - `prefer-type-fest-tuple-of.ts`
   - `prefer-type-fest-unknown-array.ts`
   - `prefer-type-fest-unknown-map.ts`
   - `prefer-type-fest-unknown-record.ts`
   - `prefer-type-fest-unknown-set.ts`
   - `prefer-type-fest-unwrap-tagged.ts`
   - `prefer-type-fest-value-of.ts`
   - `prefer-type-fest-writable-deep.ts`
   - `prefer-type-fest-writable.ts`
🧪 [test] Update test files for consistency
 - Adjusted test files to remove trailing whitespace and ensure consistent formatting.
 - Affected test files include:
   - `imported-type-aliases.test.ts`
   - `prefer-type-fest-arrayable.test.ts`
   - `prefer-type-fest-async-return-type.test.ts`
   - `prefer-type-fest-json-array.test.ts`
   - `prefer-type-fest-json-object.test.ts`
   - `prefer-type-fest-partial-deep.test.ts`
   - `prefer-type-fest-require-all-or-none.test.ts`
   - `prefer-type-fest-require-exactly-one.test.ts`
   - `prefer-type-fest-required-deep.test.ts`
   - `prefer-type-fest-set-non-nullable.test.ts`
   - `prefer-type-fest-set-optional.test.ts`
   - `prefer-type-fest-set-required.test.ts`
   - `prefer-type-fest-simplify.test.ts`
   - `prefer-type-fest-tagged-brands.test.ts`
   - `prefer-type-fest-unknown-array.test.ts`
   - `prefer-type-fest-unwrap-tagged.test.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e6eeff5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e6eeff586d1d69f4c812df893a00f836dde93222)


- 🎨 [style] Refine stylelint disable comments in custom.css
 - Updated stylelint disable comments to remove unnecessary rules
 - Maintained essential rules for Docusaurus CSS compatibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6eb9b0f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6eb9b0ff35cb5769ce2142ae048c29e8e05ec5f9)


- 🎨 [style] Refine stylelint disable comments in CSS module
 - Removed unnecessary stylelint rules for improved clarity
 - Maintained essential rules to ensure Docusaurus CSS compatibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1d8c4af)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1d8c4af3441e33c1a4db469903c731a91ea80470)


- 🎨 [style] Improve code formatting and consistency in scripts
 - Adjust spacing in parameter definitions in `.github/CleanReleases.ps1` and `.github/RepoSize.ps1`
 - Standardize spacing in output formatting for better readability
 - Enhance clarity by ensuring consistent spacing in condition checks
✨ [feat] Add bootstrap script for GitHub labels
 - Introduce `scripts/bootstrap-labels.ps1` to manage GitHub issue/PR labels
 - Implement features for creating/updating labels using GitHub CLI
 - Include options for reading label names from `.github/labeler.yml`
 - Provide audit and export functionalities for label management

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7f84870)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7f84870ac38c2d089a0bfb6fe85025cce034c2ce)


- 🎨 [style] Clean up code formatting and improve readability
 - Removed unnecessary trailing whitespace in multiple files to maintain consistent formatting.
 - Adjusted comment formatting for better clarity in several rule files, ensuring that return descriptions are properly wrapped for readability.

🛠️ [fix] Enhance type checks and improve rule implementations
 - Added checks for undefined elements in tuple types within `prefer-type-fest-non-empty-tuple.ts` to prevent runtime errors.
 - Improved type handling in `prefer-type-fest-promisable.ts` to ensure proper identification of identifier type references.
 - Updated logic in `prefer-type-fest-tuple-of.ts` to handle shadowed type parameters correctly, ensuring accurate suggestions for replacements.

🧪 [test] Update and expand test cases for rule validation
 - Added new test cases for `prefer-type-fest-value-of` to ensure correct handling of shadowed identifiers.
 - Enhanced tests for `prefer-type-fest-tuple-of` to cover scenarios with shadowed type parameters and ensure proper output.
 - Refactored existing tests for clarity and consistency, ensuring they align with the latest rule implementations.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b4b1929)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b4b1929c19e9e23e7e2c88229979a2c23473a4b3)


- 🎨 [style] Improve code formatting and consistency across multiple files
 - ✨ Adjust spacing around object destructuring in `prefer-ts-extras-array-first.ts`
 - 🎨 Standardize spacing in `prefer-type-fest-json-primitive.ts` for better readability
 - 🎨 Refactor spacing in `prefer-type-fest-primitive.ts` to enhance clarity
 - 🎨 Clean up spacing in `prefer-type-fest-tagged-brands.ts` for uniformity
 - 🎨 Normalize spacing in `prefer-type-fest-writable.ts` to maintain style consistency
 - 🎨 Update spacing in `imported-type-aliases.test.ts` for improved code aesthetics
 - 🎨 Modify spacing in `docs-integrity.test.ts` to align with style guidelines

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(22c06f3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/22c06f32690751743723df370ee9f648bb27b943)


- 🎨 [style] Refactor code formatting for consistency and readability
 - Cleaned up import statements across multiple test files by consolidating imports from "vitest"
 - Adjusted line breaks and indentation in various test fixtures for improved clarity
 - Reformatted conditional statements in test fixtures to enhance readability

🧪 [test] Enhance test coverage for typed rules
 - Added tests for `getTypedRuleServices` to ensure correct parser services and type checker retrieval
 - Implemented tests for `getSignatureParameterTypeAt` to validate behavior with parameter indices
 - Created new test files for `prefer-ts-extras-not` rule to validate its functionality

🛠️ [fix] Corrected issues in test fixtures
 - Fixed invalid TypeScript syntax in several test fixtures by ensuring proper function declarations
 - Adjusted conditional checks in test fixtures to prevent unexpected behavior during tests

✨ [feat] Introduce new rule: prefer-ts-extras-not
 - Developed a new rule to encourage the use of `not` for filtering non-nullable values
 - Created corresponding valid and invalid test fixtures to validate the rule's functionality

⚡ [perf] Optimize Vite configuration for better performance
 - Updated Vite configuration to improve test execution speed and resource management
 - Adjusted coverage settings to ensure accurate reporting and exclude unnecessary files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4ab154d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ab154d52bb4581406410e848c69daebc6d0e847)



### 🧪 Testing

- 🧪 [test] Refactor test cases to use 'test' instead of 'it' for consistency
 - Updated all test files to replace 'it' with 'test' for better readability and consistency across the test suite.
 - Ensured that all relevant test cases maintain their functionality after the change.

🛠️ [fix] Change boolean checks to use 'toBeTruthy()' for clarity
 - Modified assertions in multiple test files to use 'toBeTruthy()' instead of 'toBe(true)' for improved clarity in boolean checks.

🎨 [style] Clean up import statements and formatting
 - Removed duplicate import statements and ensured consistent formatting across test files.
 - Added spacing and line breaks for better readability in several test files.

📝 [docs] Update documentation comments for clarity
 - Enhanced documentation comments in various test files to provide clearer context and explanations for the tests being conducted.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(10c699a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/10c699af540ea73a73ab0e69acb9d2c217b3d9ff)


- 🧪 [test] Expands type-utility rule coverage

🧪 [test] Strengthens rule reliability by adding edge-case assertions for detection and autofix behavior across multiple type-utility preference rules.
 - Adds reversed-union, whitespace-normalized, extra/missing generic argument, and nested-type scenarios to reduce false positives and false negatives.
 - Verifies non-fix behavior when required imports are missing, so diagnostics stay accurate without unsafe edits.
🧪 [test] Broadens valid-case coverage for multi-member unions and duplicate-member combinations to ensure rules trigger only on exact intended patterns.
🎨 [style] Normalizes import ordering and modernizes matcher assertions and regex flags in metadata checks to keep tests consistent and less brittle.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(145743a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/145743a270bfa524527bdcfd1ff264a7fce87aa1)



### 🧹 Chores

- 🧹 [chore] migrate documentation URLs to GitHub Pages and bump dev dependencies

- update base docs URL from custom domain to GitHub Pages in internal helpers and rule metadata
  ensures generated rule links point at `nick2bad4u.github.io/...`
- adjust tests and URL construction to reflect new base and remove `.md` suffix
- bump various ESLint‑related dependencies (html‑eslint plugins, compat, jsonc, stylelint, etc.)
  to keep linting tooling up‑to‑date

The changes simplify hosting strategy for docs and keep development dependencies current.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aeb72ee)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/aeb72eeeb9be48054bf96209b07ff62e9f777d33)



### 🔧 Build System

- 🔧 [build] Add defaultOptions to multiple TypeScript rules

 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-ts-extras-not.ts`, ensuring consistent default behavior across rules.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-ts-extras-object-entries.ts`, enhancing rule configurability.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-ts-extras-object-from-entries.ts`, standardizing rule options.
 - ✨ [feat] Included `defaultOptions: []` in `prefer-ts-extras-object-has-in.ts`, improving rule consistency.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-ts-extras-object-has-own.ts`, aligning with other rules.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-ts-extras-object-keys.ts`, ensuring uniformity in rule definitions.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-ts-extras-object-values.ts`, enhancing rule behavior.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-ts-extras-safe-cast-to.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-ts-extras-set-has.ts`, improving rule configurability.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-ts-extras-string-split.ts`, ensuring consistent default behavior.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-arrayable.ts`, enhancing rule configurability.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-async-return-type.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-conditional-pick.ts`, aligning with other rules.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-constructor.ts`, ensuring uniformity in rule definitions.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-except.ts`, improving rule consistency.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-if.ts`, enhancing rule behavior.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-iterable-element.ts`, standardizing rule options.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-json-array.ts`, ensuring consistent default behavior.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-json-object.ts`, enhancing rule configurability.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-json-primitive.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-json-value.ts`, improving rule consistency.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-keys-of-union.ts`, ensuring uniformity in rule definitions.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-literal-union.ts`, enhancing rule behavior.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-merge-exclusive.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-non-empty-tuple.ts`, improving rule configurability.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-omit-index-signature.ts`, ensuring consistent default behavior.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-partial-deep.ts`, enhancing rule behavior.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-primitive.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-promisable.ts`, improving rule consistency.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-readonly-deep.ts`, ensuring uniformity in rule definitions.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-require-all-or-none.ts`, enhancing rule configurability.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-require-at-least-one.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-require-exactly-one.ts`, improving rule consistency.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-require-one-or-none.ts`, ensuring consistent default behavior.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-required-deep.ts`, enhancing rule behavior.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-schema.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-set-non-nullable.ts`, improving rule configurability.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-set-optional.ts`, ensuring uniformity in rule definitions.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-set-readonly.ts`, enhancing rule behavior.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-set-required.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-simplify.ts`, improving rule consistency.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-tagged-brands.ts`, ensuring consistent default behavior.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-tuple-of.ts`, enhancing rule configurability.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-unknown-array.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-unknown-map.ts`, improving rule consistency.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-unknown-record.ts`, ensuring uniformity in rule definitions.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-unknown-set.ts`, enhancing rule behavior.
 - ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-unwrap-tagged.ts`, standardizing rule options.
 - ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-value-of.ts`, improving rule configurability.
 - ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-writable-deep.ts`, ensuring consistent default behavior.
 - ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-writable.ts`, enhancing rule behavior.

🧪 [test] Update tests to reflect changes in rule configurations

 - 🧪 [test] Modified `configs.test.ts` to utilize `UnknownRecord` from `type-fest`, improving type safety.
 - 🧪 [test] Updated `prefer-type-fest-writable-deep.test.ts` to reflect changes in return types, ensuring consistency.
 - 🧪 [test] Adjusted `typed-rule-internal.test.ts` to improve clarity in test descriptions and ensure accurate path recognition.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9082660)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/90826605cb10f2a9ca47e47f8aafaa621e972e9b)


- 🔧 [build] Refactor benchmark and test configurations
 - 🛠️ Update benchmark directory path to use `import.meta.dirname`
 - 🛠️ Replace `null` checks with `!= null` for candidate variables in stress tests
 - 🛠️ Modify ESLint stats calculation to use `Math.sumPrecise`
 - 🛠️ Remove deprecated `no-constructor-bind` plugin from configurations
 - 🛠️ Add benchmarks to ESLint and TypeScript configurations
 - 🛠️ Update type definitions to use `Readonly<UnknownArray>` in tests
 - 🛠️ Adjust Vite configuration to include benchmark files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(528c601)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/528c601c385c557e677649bbaa06af894e6e9f82)


- 🔧 [build] Update dependencies in package.json and package-lock.json
 - 🛠️ Update `eslint-plugin-jsdoc` from `^62.7.0` to `^62.7.1` to incorporate the latest improvements and fixes.
 - 🧹 Remove unused dependencies:
   - `eslint-plugin-mdx` version `^3.6.2`
   - `eslint-plugin-storybook` version `^10.2.11`
   - `storybook` version `^10.2.11`
 - 🔧 Clean up `package-lock.json` by removing entries for the removed dependencies and updating the lock file accordingly.

🧪 [test] Add unit tests for typed-rule internal helpers
 - ✨ Introduce a new test file `typed-rule-internal.test.ts` to validate the behavior of the `isTestFilePath` function.
 - 📝 Implement tests to ensure that various file paths do not get incorrectly identified as test files, covering a range of common file naming conventions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(db80fb0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db80fb0425ed6198b5e3c426c2632208081053ad)


- 🔧 [build] Update aliasReplacementFix checks for consistency across rules
 - 🛠️ [fix] Change condition from `!replacementFix` to `replacementFix === null` in multiple rules to ensure clarity in reporting
 - 🛠️ [fix] Adjust handling of `aliasReplacementFix` to check for `null` instead of using a truthy check in various rules

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ba3b799)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ba3b799b909cd67fe3c334cfb9aec7da650e57a5)


- 🔧 [build] Mark rules as non-deprecated

 - 📝 Update metadata for multiple rules in the TypeScript extras library to indicate they are not deprecated.
 - 🔧 Set `deprecated: false` for the following rules:
   - prefer-ts-extras-array-find-last-index
   - prefer-ts-extras-array-find-last
   - prefer-ts-extras-array-find
   - prefer-ts-extras-array-first
   - prefer-ts-extras-array-includes
   - prefer-ts-extras-array-join
   - prefer-ts-extras-array-last
   - prefer-ts-extras-as-writable
   - prefer-ts-extras-assert-defined
   - prefer-ts-extras-assert-error
   - prefer-ts-extras-assert-present
   - prefer-ts-extras-is-defined-filter
   - prefer-ts-extras-is-defined
   - prefer-ts-extras-is-empty
   - prefer-ts-extras-is-equal-type
   - prefer-ts-extras-is-finite
   - prefer-ts-extras-is-infinite
   - prefer-ts-extras-is-integer
   - prefer-ts-extras-is-present-filter
   - prefer-ts-extras-is-present
   - prefer-ts-extras-is-safe-integer
   - prefer-ts-extras-key-in
   - prefer-ts-extras-not
   - prefer-ts-extras-object-entries
   - prefer-ts-extras-object-from-entries
   - prefer-ts-extras-object-has-in
   - prefer-ts-extras-object-has-own
   - prefer-ts-extras-object-keys
   - prefer-ts-extras-object-values
   - prefer-ts-extras-safe-cast-to
   - prefer-ts-extras-set-has
   - prefer-ts-extras-string-split
   - prefer-type-fest-arrayable
   - prefer-type-fest-async-return-type
   - prefer-type-fest-conditional-pick
   - prefer-type-fest-constructor
   - prefer-type-fest-except
   - prefer-type-fest-if
   - prefer-type-fest-iterable-element
   - prefer-type-fest-json-array
   - prefer-type-fest-json-object
   - prefer-type-fest-json-primitive
   - prefer-type-fest-json-value
   - prefer-type-fest-keys-of-union
   - prefer-type-fest-literal-union
   - prefer-type-fest-merge-exclusive
   - prefer-type-fest-non-empty-tuple
   - prefer-type-fest-omit-index-signature
   - prefer-type-fest-partial-deep
   - prefer-type-fest-primitive
   - prefer-type-fest-promisable
   - prefer-type-fest-readonly-deep
   - prefer-type-fest-require-all-or-none
   - prefer-type-fest-require-at-least-one
   - prefer-type-fest-require-exactly-one
   - prefer-type-fest-require-one-or-none
   - prefer-type-fest-required-deep
   - prefer-type-fest-schema
   - prefer-type-fest-set-non-nullable
   - prefer-type-fest-set-optional
   - prefer-type-fest-set-readonly
   - prefer-type-fest-set-required
   - prefer-type-fest-simplify
   - prefer-type-fest-tagged-brands
   - prefer-type-fest-tuple-of
   - prefer-type-fest-unknown-array
   - prefer-type-fest-unknown-map
   - prefer-type-fest-unknown-record
   - prefer-type-fest-unknown-set
   - prefer-type-fest-unwrap-tagged
   - prefer-type-fest-value-of
   - prefer-type-fest-writable-deep
   - prefer-type-fest-writable

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(46e0d73)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/46e0d732d26617586d5b1533da10fd9d729bec56)


- 🔧 [build] Raises lint baseline and hardens rules

🔧 [build] Converts multiple previously disabled lint checks to warnings and adds extra markup/config warnings to catch quality issues earlier without blocking development.
 - Improves incremental enforcement by surfacing problems sooner while avoiding abrupt error-level breakage.

🚜 [refactor] Reworks primitive-union detection to use parser-provided node-type constants and a set-backed type guard instead of string-switch matching.
 - Improves type safety, reduces branching complexity, and keeps matching logic easier to maintain.

🎨 [style] Normalizes internal listener and helper formatting across authored rule implementations for consistency with stricter lint/style expectations.

🧪 [test] Refactors suites to a consistent structure, strengthens AST-node assertions with shared constants, and hardens metadata/import/assertion checks.
 - Aligns edge-case expectations for suggestion behavior and escaped template placeholders to reduce brittle test outcomes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ad591e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3ad591e4f8be1ffade32bc896ec0af34673ef703)


- 🔧 [build] Update dependencies in package.json

 - 📦 Upgrade @typescript-eslint/parser and @typescript-eslint/utils to version 8.56.1 for improved TypeScript support.
 - 📦 Upgrade @typescript-eslint/eslint-plugin and @typescript-eslint/rule-tester to version 8.56.1 for better linting capabilities.
 - 📦 Upgrade eslint to version 10.0.2 for bug fixes and performance improvements.
 - 📦 Upgrade eslint-plugin-storybook to version 10.2.11 for enhanced Storybook integration.
 - 📦 Upgrade storybook to version 10.2.11 for the latest features and fixes.
 - 📦 Upgrade typescript-eslint to version 8.56.1 for consistency with other TypeScript ESLint packages.
 - 📦 Update peerDependencies to require eslint version 10.0.2 for compatibility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4f1aede)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4f1aede544912eba9af43a5078b774ede5845435)


- 🔧 [build] Update Stryker configuration for improved testing
 - Adjust `test:stryker` scripts to use `--ignoreStatic` flag for better performance
 - Change `ignoreStatic` option in Stryker config to `false` for comprehensive mutant testing

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(28104ce)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/28104ce26257b19d12fb03c117832bb62fab0a26)


- 🔧 [build] Update Stryker configuration and package.json scripts
 - 🛠️ Remove outdated mutation testing scripts from package.json
 - ✨ Add new Stryker testing scripts for improved mutation testing
 - ⚡ Enhance Stryker configuration with ignoreStatic and disableTypeChecks options

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5f83e37)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5f83e378a295fcba40c50841f08b8e13223fba6a)


- 🔧 [build] Update package.json and package-lock.json
 - ✨ Add overrides for jsonc-eslint-parser to use version ^3.1.0
 - 🔧 Remove unused dependencies from package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b934c2e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b934c2e401cac9ef0889f3d606107b6ee6e0716e)


- 🔧 [build] Update dependencies in package.json
 - 🛠️ Update `eslint-plugin-jsonc` from `^3.0.0` to `^2.21.1`
 - 🛠️ Update `jsonc-eslint-parser` from `^3.1.0` to `^3.0.0`

🚜 [refactor] Improve type definitions and utility functions in imported-value-symbols.ts
 - 🎨 Refactor type definitions for `MemberToFunctionCallFixParams` and `MethodToFunctionCallFixParams`
 - 🛠️ Consolidate and rename parameters for clarity in function signatures
 - 🎨 Improve documentation comments for better understanding
 - 🛠️ Optimize logic in `collectDirectNamedValueImportsFromSource` for clarity

✨ [feat] Enhance ESLint rules for TypeScript extras
 - 🎨 Refactor imports in multiple rule files to use consistent import statements
 - ✨ Implement autofix capabilities for `isDefined`, `isEmpty`, `isPresent` in respective rules
 - 📝 Add inline fixable test cases for `isDefined`, `isEmpty`, and `isPresent` rules

🧪 [test] Add tests for new autofix functionality
 - 🧪 Add test cases for autofixing `isDefined` and `isEmpty` checks
 - 🧪 Add test cases for autofixing `isPresent` checks
 - 🧪 Ensure all tests cover both defined and negated scenarios for comprehensive coverage

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(63355ae)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/63355ae568aabe9d928faa0d575643f48768d5fa)


- 🔧 [build] Update dependencies in package.json

 - 🔄 Upgrade "@html-eslint/eslint-plugin" and "@html-eslint/parser" to version 0.56.0 for improved HTML linting capabilities.
 - 🔄 Update "eslint" to version 10.0.1 to incorporate the latest fixes and features.
 - 🔄 Upgrade "eslint-plugin-jsdoc" to version 62.7.0 for enhanced JSDoc support.
 - 🔄 Update "eslint-plugin-jsonc" to version 3.0.0 for better JSONC linting.
 - 🔄 Upgrade "jsonc-eslint-parser" to version 3.1.0 for improved JSONC parsing.
 - 🔄 Update peer dependency "eslint" to version 10.0.1 to ensure compatibility with the latest changes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e06b605)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e06b605ec157e48bdef1667bd9b7d29c594ee17a)


- 🔧 [build] Update Stryker dependencies and package manager version
 - Upgrade Stryker packages to version 9.5.1 for improved functionality
 - Update package manager version to 11.10.1 for better compatibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1dde506)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1dde506c1d63afe0a9d0ffc1ea7fb8d4722e1844)


- 🔧 [build] Update Knip configuration to remove unnecessary dependencies
 - Removed several unused dependencies from the Knip configuration to streamline the analysis process
 - This change helps in reducing false positives and improving the accuracy of dependency tracking

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5d2f382)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5d2f382a0e7cdbc2463d18c6f322c29f0d697ace)


- 🔧 [build] Update TypeScript configuration for ESLint

 - ✨ [feat] Include `knip.config.ts` in the TypeScript ESLint configuration
 - 📂 This addition allows ESLint to recognize and lint the `knip.config.ts` file, ensuring consistent code quality and adherence to coding standards across the project.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a4ac857)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a4ac8576e18b4a30ef54662a3857951dca1ac277)


- 🔧 [build] Force install dependencies in Docusaurus deployment workflow
 - Updated npm install command to use --force for consistent dependency installation

📝 [docs] Clarify documentation for modern enhancements
 - Revised package documentation to reflect subtle client-side interaction enhancements

🧹 [chore] Update lint-actionlint script configuration path
 - Changed path for ActionLintConfig.yaml to use the repository root for better accessibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b1b30c3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b1b30c3c1fb58329c11e49acbe4e84acae2d46c4)


- 🔧 [build] Update npm-check-updates to version 19.4.0
 - Upgraded the "npm-check-updates" package in both package.json and package-lock.json to ensure compatibility with the latest features and fixes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0d1b867)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0d1b867c174310b07659a43fbd41694ab4579337)


- 🔧 [build] Update Docusaurus configuration and add manifest file
 - 🛠️ [fix] Implement ignoreKnownWebpackWarningsPlugin to suppress known webpack warnings
 - 📝 [docs] Add manifest.json for PWA support with background color and icons
 - 🔧 [build] Modify build:local script to include NODE_OPTIONS for deprecation warnings
 - 🔧 [build] Update TypeDoc output path in typedoc.local.config.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9327651)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/93276515f3fef321f4fea54d762fdf9d63ac07b5)


- 🔧 [build] Refactor TypeFest plugin types and configurations
 - 🆕 Export `TypefestConfigName` and `TypefestPresetConfig` types for better clarity
 - 🔄 Update `TypefestPlugin` and `TypefestConfigs` types to enhance type safety
 - 🔧 Modify function signatures to use new types for improved consistency
 - 📦 Adjust `typefestPlugin` structure to align with updated type definitions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a0fdbab)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a0fdbabd4429095440c4efd43d07829ace5b2afc)


- 🔧 [build] Update eslint-plugin-testing-library to version 7.16.0
 - [dependency] Update version 7.16.0 in package.json and package-lock.json
 - Update dependencies for compatibility with the latest ESLint versions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(25224f5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25224f59273e80a3b6231b8eaf954f164f3565f2)


- 🔧 [build] Refactor TypeFest ESLint rules for consistency and clarity
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-all-or-none`
   - Moved `name`, `meta`, and `defaultOptions` to the end of the rule definition for consistency.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-at-least-one`
   - Adjusted the structure to match the new format.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-exactly-one`
   - Ensured consistent ordering of properties.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-one-or-none`
   - Updated to follow the new structure.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-schema`
   - Aligned with the new metadata format.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-non-nullable`
   - Adjusted to maintain consistency across rules.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-optional`
   - Updated to follow the new structure.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-readonly`
   - Ensured consistent ordering of properties.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-required`
   - Aligned with the new metadata format.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-simplify`
   - Updated to follow the new structure.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-tagged-brands`
   - Adjusted to maintain consistency across rules.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-tuple-of`
   - Ensured consistent ordering of properties.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-array`
   - Aligned with the new metadata format.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-map`
   - Updated to follow the new structure.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-record`
   - Ensured consistent ordering of properties.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-set`
   - Aligned with the new metadata format.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unwrap-tagged`
   - Updated to follow the new structure.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-value-of`
   - Ensured consistent ordering of properties.
 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-writable`
   - Aligned with the new metadata format.
 - 🧪 [test] Update docs integrity test to use expectTypeOf for description validation
   - Changed `expect(typeof description).toBe("string")` to `expectTypeOf(description).toBeString()`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ce485eb)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ce485eb271acb65d12753e772cdcd320572bdeab)


- 🔧 [build] Refactor TypeFest ESLint rules for consistency and clarity

 - 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-all-or-none`:
   - Moved `name`, `meta`, and `defaultOptions` to the correct positions.
   - Ensured the `create` function remains intact while maintaining functionality.

 - 🛠️ [fix] Update `prefer-type-fest-require-at-least-one` rule structure:
   - Adjusted metadata organization for clarity.
   - Preserved the core logic within the `create` function.

 - 🛠️ [fix] Refactor `prefer-type-fest-require-exactly-one` rule:
   - Streamlined metadata for better readability.
   - Kept the reporting logic unchanged.

 - 🛠️ [fix] Revise `prefer-type-fest-require-one-or-none` rule:
   - Enhanced metadata structure for consistency.
   - Maintained existing functionality in the `create` method.

 - 🛠️ [fix] Modify `prefer-type-fest-schema` rule:
   - Reorganized metadata for improved clarity.
   - Ensured the reporting logic remains functional.

 - 🛠️ [fix] Adjust `prefer-type-fest-set-non-nullable` rule:
   - Updated metadata layout for consistency.
   - Preserved the core logic in the `create` function.

 - 🛠️ [fix] Refactor `prefer-type-fest-set-optional` rule:
   - Improved metadata organization for clarity.
   - Maintained existing functionality.

 - 🛠️ [fix] Revise `prefer-type-fest-set-readonly` rule:
   - Streamlined metadata for better readability.
   - Ensured the reporting logic remains intact.

 - 🛠️ [fix] Update `prefer-type-fest-set-required` rule:
   - Enhanced metadata structure for consistency.
   - Preserved the core logic within the `create` function.

 - 🛠️ [fix] Refactor `prefer-type-fest-simplify` rule:
   - Reorganized metadata for improved clarity.
   - Kept the reporting logic unchanged.

 - 🛠️ [fix] Modify `prefer-type-fest-tagged-brands` rule:
   - Adjusted metadata organization for clarity.
   - Maintained existing functionality in the `create` method.

 - 🛠️ [fix] Revise `prefer-type-fest-tuple-of` rule:
   - Improved metadata layout for consistency.
   - Preserved the core logic in the `create` function.

 - 🛠️ [fix] Adjust `prefer-type-fest-unknown-array` rule:
   - Updated metadata structure for clarity.
   - Ensured the reporting logic remains functional.

 - 🛠️ [fix] Refactor `prefer-type-fest-unknown-map` rule:
   - Streamlined metadata for better readability.
   - Maintained existing functionality.

 - 🛠️ [fix] Modify `prefer-type-fest-unknown-record` rule:
   - Enhanced metadata organization for consistency.
   - Preserved the core logic within the `create` function.

 - 🛠️ [fix] Revise `prefer-type-fest-unknown-set` rule:
   - Reorganized metadata for improved clarity.
   - Kept the reporting logic unchanged.

 - 🛠️ [fix] Update `prefer-type-fest-unwrap-tagged` rule:
   - Adjusted metadata layout for consistency.
   - Maintained existing functionality in the `create` method.

 - 🛠️ [fix] Refactor `prefer-type-fest-value-of` rule:
   - Improved metadata structure for clarity.
   - Preserved the core logic in the `create` function.

 - 🛠️ [fix] Modify `prefer-type-fest-writable` rule:
   - Streamlined metadata for better readability.
   - Ensured the reporting logic remains intact.

📝 [docs] Update documentation integrity tests
 - 🛠️ [fix] Adjusted tests to ensure documentation URLs and descriptions are validated correctly.
 - 🛠️ [fix] Enhanced type checks for rule descriptions to ensure they are strings.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df2ae2f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/df2ae2f38b3f8c5d03b1737f5bf328a8132adc77)


- 🔧 [build] Update dependencies for improved compatibility and features

 - 📦 Upgrade "@typescript-eslint/utils" from "^8.55.0" to "^8.56.0" for enhanced TypeScript support.
 - 📦 Upgrade "@eslint/js" from "^9.39.2" to "^10.0.1" to leverage the latest ESLint features and fixes.
 - 📦 Upgrade "@typescript-eslint/eslint-plugin", "@typescript-eslint/parser", and "@typescript-eslint/rule-tester" from "^8.55.0" to "^8.56.0" for better linting capabilities.
 - 📦 Upgrade "typescript-eslint" from "^8.55.0" to "^8.56.0" to ensure compatibility with the latest TypeScript features.
 - 📦 Update peer dependency "eslint" from "^9.0.0" to "^10.0.0" to align with the latest ESLint version requirements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ff78dc7)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ff78dc7d23858611fe280055f82504009732e61c)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/eslint-plugin-typefest/graphs/contributors) for their hard work!
## License
This project is licensed under the [UnLicense](https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/LICENSE)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
