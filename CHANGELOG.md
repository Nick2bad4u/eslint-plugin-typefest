## [1.2.8] - 2026-05-16


- <b>Commit Range: ➡️</b> [`37c0624...7d4fde2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/37c0624024268f864d87865f90c8471bae448107...7d4fde2265a6058680124d3be75474af6e27f29f "View full commit range on GitHub")



### ✨ Features

- [`646b362`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/646b3623d888dd324144a6c60b9475affb1cd379 "📝 Diff: 65 files, ++6851 | --111") — ✨ [feat] Adds safe TypeFest gap-coverage rules

✨ [feat] Adds a new set of high-confidence autofix rules for common manual type patterns

- Covers boolean pair helpers, unknown and tuple guards, nullable checks, rest-element extraction, and key presence and key extraction helpers

- Favors dedicated utilities so type intent reads more clearly and repeated low-level helper compositions disappear from user code

- Limits reporting to exact import-aware shapes so fixes stay low-noise and avoid semantic drift

🚜 [refactor] Extracts shared pattern matchers and rule factories for the new rule family

- Reuses conditional-type, tuple, and key-analysis logic to keep behavior consistent across related rules

- Improves maintainability for future rule additions without widening match scope

📝 [docs] Updates rule coverage guidance and preset documentation

- Marks the gap-analysis pass as effectively closed after landing the safe default candidates

- Documents the narrow supported patterns and non-goals so future additions require stronger proof before joining default presets

🧪 [test] Expands contract, parse-safety, autofix, and snapshot coverage

- Verifies import handling, shadowing, namespace usage, fixer output, preset membership, and exported rule counts for the new rule set


- [`1c90fb9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1c90fb90b60c28bf78edf43b3022570a3441db06 "📝 Diff: 36 files, ++2258 | --188") — ✨ [feat] (rules) Introduce new TypeFest rules for array and entry types

- Add `prefer-type-fest-array-element` rule to enforce usage of `ArrayElement<T>` over `T[number]` for array and tuple element extraction.

- Add `prefer-type-fest-array-values` rule to enforce usage of `ArrayValues<T>` over `typeof values[number]` for constant array value extraction.

- Add `prefer-type-fest-entries` rule to enforce usage of `Entries<T>` over manual arrays of `[keyof T, T[keyof T]]` for object entry tuples.

- Add `prefer-type-fest-entry` rule to enforce usage of `Entry<T>` over manual `[keyof T, T[keyof T]]` object entry tuple types.

- Update rule metadata snapshots to include new rules with appropriate documentation links and configurations.

- Add tests for new rules to ensure correct behavior and parse safety.

- Update existing tests to defer to new rules where applicable.


- [`3cdbfd3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3cdbfd3ecbcdd3537fdb503b0feff5d45d475f9d "📝 Diff: 29 files, ++2004 | --7") — ✨ [feat] Add new TypeFest rules for TypeScript type checks

- Introduced `prefer-type-fest-is-any`, `prefer-type-fest-is-never`, `prefer-type-fest-is-null`, and `prefer-type-fest-is-undefined` rules to enforce best practices in TypeScript type checks.

- Updated snapshots and metadata for the new rules to ensure proper documentation and functionality.
🧪 [test] Add comprehensive tests for new TypeFest rules

- Created tests for `prefer-type-fest-is-any`, `prefer-type-fest-is-never`, `prefer-type-fest-is-null`, and `prefer-type-fest-is-undefined` to validate their behavior and ensure they catch incorrect type checks.

- Included parse-safety guards in tests to ensure generated code remains valid TypeScript.
📝 [docs] Update documentation for new TypeFest rules

- Added documentation entries for the new rules in the README and snapshots to provide users with guidance on usage and configuration.


- [`f77a049`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f77a0498462cb8511cb9b39f10376d7f8e01c524 "📝 Diff: 3 files, ++184 | --556") — ✨ [feat] Add Codex instructions for ESLint plugin source structure

- Introduce guidelines for authoring rules and source modules in the ESLint plugin template.

- Define source layout and canonical rule template expectations.

- Specify required rule metadata and implementation expectations.

- Outline new rule workflow and common pitfalls to avoid in the `src/` directory.
🧹 [chore] Remove unused bootstrap-labels script

- Delete the obsolete PowerShell script for managing GitHub labels.

- Clean up the repository by removing unnecessary files. [ci skip]


- [`37c0624`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/37c0624024268f864d87865f90c8471bae448107 "📝 Diff: 5 files, ++228 | --1") — ✨ [feat] Add benchmark and script guidelines documentation


- 📝 Create AGENTS.md for benchmark folder guidelines

- 📝 Create AGENTS.md for scripts folder guidelines

- 🔧 Update .remarkignore to include AGENTS.md files

- 🚜 Refactor vitest configuration to improve exclusion patterns



### 🧹 Chores

- [`7d4fde2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7d4fde2265a6058680124d3be75474af6e27f29f "📝 Diff: 2 files, ++3 | --3") — Release v1.2.8






## [1.2.7] - 2026-05-13


- <b>Commit Range: ➡️</b> [`6c7173e...8aebec2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/6c7173e7d2d0e21f1beacd9e893ada1f33394052...8aebec26e3c912e89e5525b6e1a049934aa7cc0e "View full commit range on GitHub")



### 🚜 Refactor

- [`6c7173e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6c7173e7d2d0e21f1beacd9e893ada1f33394052 "📝 Diff: 146 files, ++6841 | --5152") — 🚜 [refactor] (lint) Prepare plugin internals for release

🚜 [refactor] Normalize plugin internals around stricter lint-safe patterns

- Replace ad hoc AST node string checks with explicit `AST_NODE_TYPES` guards across shared helpers and rule implementations.

- Split complex nullish-comparison, member-call, filter-callback, autofix-safety, and TypeChecker compatibility paths into narrower typed helpers.

- Remove unsafe casts where possible and isolate unavoidable ESLint public-type casts with documented lint suppressions.

🚜 [refactor] Tighten plugin config and rule metadata assembly

- Build preset rule maps and exported config definitions from explicit typed records.

- Keep local ESLint self-linting wired to the built plugin config without relying on unchecked experimental config access.

- Refresh rule metadata snapshots after rule numbering and config metadata normalization.

🧪 [test] Strengthen release-facing test coverage

- Consolidate preset config assertions around shared expected rule maps.

- Keep rule metadata, docs integrity, autofix fixture, selector convention, and import-symbol tests aligned with the stricter lint rules.

👷 [build] Refresh release tooling and dependency metadata

- Update TypeScript ESLint, Vitest, Fast-Check, config-inspector, lint, docs, and related package versions in package manifests and lockfile.

- Replace rimraf clean scripts with `del-cli` and route dependency checks through Knip.

- Make the circular dependency lint output JSON so clean runs do not emit skipped external module warnings.

- Allow the Codecov bundle analysis upload step to fail without failing CI.

📝 [docs] Add scoped agent instructions and docs lint exclusions

- Add repository, workflow, docs, Docusaurus, and test AGENTS guidance files.

- Exclude AGENTS instruction files from remark linting.

- Update Docusaurus TypeDoc link plugin code for the current lint rules.

🔥 [chore] Remove obsolete repository bootstrap scripts

- Delete the old ESLint repo bootstrap and project creation scripts now that the repo uses the current release and validation workflow.



### ⚡ Performance

- [`d229711`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d2297110389560c355da6f1a5f417960f6ff109d "📝 Diff: 3 files, ++45 | --2") — ⚡️ [perf] Optimize fast-check run configuration for CI environments


- Introduced dynamic run count resolution based on CI environment

- Set default run count to 70, with a fallback of 25 for CI

- Updated Vitest setup to utilize the resolved run count



### 🧹 Chores

- [`8aebec2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8aebec26e3c912e89e5525b6e1a049934aa7cc0e "📝 Diff: 2 files, ++3 | --3") — Release v1.2.7


- [`2b38c50`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2b38c50ba7481cf712dfa4a2407fad1faef27b1b "📝 Diff: 2 files, ++158 | --4") — 🔧 [chore] Update dependencies to include @rspack/binding-linux-x64-gnu






## [1.2.6] - 2026-05-08


- <b>Commit Range: ➡️</b> [`2dc6dc0...c8048e2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/2dc6dc07f96ebddbcfdb02fb057dfd2f5e447c39...c8048e24d2c88bab79b6965c81406e6b7e7da28a "View full commit range on GitHub")



### 🛡️ Security

- [`e1b5e8a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e1b5e8afb1d03a7c42a4f0ab75cd100fc7943d2b "📝 Diff: 8 files, ++2613 | --1405") — 🧹 [chore] Update dependencies and migration documentation

- 🔧 Upgrade `@typescript-eslint` packages to version 8.59.2 for improved TypeScript support.
- 🔧 Upgrade `prettier-config-nick2bad4u` to version 1.0.9 for better formatting options.
- 🔧 Upgrade `secretlint` to version 13.0.0 and `secretlint-config-nick2bad4u` to version 1.0.4 for enhanced security checks.
- 🔧 Upgrade `stylelint` to version 17.10.0 and `stylelint-config-nick2bad4u` to version 1.0.5 for updated linting rules.
- 🔧 Upgrade `typescript-eslint` to version 8.59.2 for better linting capabilities.
- 📝 [docs] Add a comprehensive migration guide for shared tooling configs, detailing steps for Prettier, Remark, Stylelint, Secretlint, and ESLint migrations.
- 🔧 Update `sonar-project.properties` to include additional test inclusions for better coverage.
- 🔧 Modify `tsconfig.eslint.json` to include new paths for documentation API files.



### 🧹 Chores

- [`c8048e2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c8048e24d2c88bab79b6965c81406e6b7e7da28a "📝 Diff: 2 files, ++3 | --3") — Release v1.2.6


- [`72ec901`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72ec901877f19dd5d848f662843485968663b8de "📝 Diff: 1 file, ++1 | --1") — 🔧 [chore] Update sonar.cpd.exclusions for improved test coverage analysis [skip-ci]


- [`4a3b3ab`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4a3b3ab1df7cc6c07dce06af7dbcb6c00d17d7d1 "📝 Diff: 13 files, ++1217 | --1440") — 🔧 [chore] Update dependencies and improve scripts

- 🔄 Update `@eslint/config-inspector` from `^2.0.0` to `^2.0.1` for better linting support.
- 🔄 Update `@types/node` from `^25.6.0` to `^25.6.2` for improved type definitions.
- 🔄 Update `commitlint` from `^20.5.3` to `^21.0.0` for enhanced commit message validation.
- 🔄 Update `knip` from `^6.11.0` to `^6.12.1` for better code analysis.
- 🔄 Update `npm-check-updates` from `^22.1.0` to `^22.1.1` for improved dependency management.
- 🔄 Update `prettier-config-nick2bad4u` from `^1.0.9` to `^1.0.10` for better formatting rules.
- 🔄 Update `publint` from `^0.3.18` to `^0.3.20` for improved package linting.
- 🔄 Update `stylelint` from `^17.10.0` to `^17.11.0` for better CSS linting.
- 🔄 Update `vite` from `^8.0.10` to `^8.0.11` for improved build performance.
- 🔄 Update `npm` from `11.13.0` to `11.14.1` for better package management.

- 🧹 Refactor `bootstrap-labels.ps1` script for improved readability and maintainability.
 
- Simplified parameter definitions and improved comments for clarity.
 
- Enhanced label processing logic for better performance and error handling.

- 🧪 [test] Remove outdated tests related to prism customization in `docusaurus-client-regressions.test.ts`.
 
- Cleaned up test cases that are no longer relevant to the current implementation.

- 📝 [docs] Update type definitions in `prefer-type-fest-array-length` fixtures for better clarity.
 
- Improved formatting of type definitions for better readability.


- [`2dc6dc0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2dc6dc07f96ebddbcfdb02fb057dfd2f5e447c39 "📝 Diff: 3 files, ++525 | --4") — 🔧 [chore] Upgrade eslint-config-nick2bad4u to version 1.0.11 and stylelint-config-nick2bad4u to version 1.0.3






## [1.2.5] - 2026-05-02


- <b>Commit Range: ➡️</b> [`2b895d9...72acef8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/2b895d969d99f19582121d4bfe40ced725757096...72acef88213ddb7bcd3fb8aca5806bcef210b40c "View full commit range on GitHub")



### ✨ Features

- [`ab62565`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ab62565352be99b90f79e2c676cecbe5930b3aca "📝 Diff: 2 files, ++9 | --12") — ✨ [feat] (browserslist) Add browserslist configuration for development and production


- [`d10f510`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d10f510263ec3a594869d4b5dc8c3999bf0ae670 "📝 Diff: 7 files, ++408 | --499") — ✨ [feat] Update linting scripts and dependencies

- Added type checking to linting commands for improved code quality assurance.

- Updated dependencies:
  
- Upgraded `@eslint-react/eslint-plugin` from `^4.2.3` to `^5.6.0` for enhanced linting capabilities.
  
- Upgraded `@html-eslint/eslint-plugin` and `@html-eslint/parser` from `^0.59.0` to `^0.60.0` for better HTML linting support.
  
- Upgraded `eslint-plugin-no-only-tests` from `^3.3.0` to `^3.4.0` for improved test linting.
  
- Upgraded `eslint-plugin-package-json` from `^0.91.1` to `^0.91.2` for better package.json linting.
  
- Upgraded `knip` from `^6.7.0` to `^6.9.0` for enhanced code analysis.


- [`04b792e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/04b792e57ec7751d0786b84ad0bd48a6f6d4ab28 "📝 Diff: 6 files, ++212 | --161") — ✨ [feat] (config) Add eslint-plugin-repo and update changelog configuration

- Introduced `eslint-plugin-repo` as a new dependency in `package.json` and `package-lock.json`.

- Updated `cliff.toml` for improved changelog generation with new templates and formatting.

- Added `repoPlugin` configurations to `eslint.config.mjs` for enhanced linting capabilities.

- Created `CODEOWNERS` file to define repository ownership.

- Added `.github/secret_scanning.yml` to specify paths to ignore during secret scanning.


- [`f29dd98`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f29dd98db7680d650490b84762b8da382c7e2740 "📝 Diff: 6 files, ++41 | --142") — ✨ [feat] Update CI workflows and documentation links


- Update Codecov upload commands to use dynamic repository name.

- Remove deprecated codecov.yml workflow file.

- Refactor sidebar and GitHub stats components to use dynamic package name.

- Enhance homepage metadata with dynamic links and descriptions.

- Adjust ESLint configuration to use experimental rules for Docusaurus.



### 🛡️ Security

- [`8942d24`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8942d246f789221858e3b97d580a8d62bfdb6a2f "📝 Diff: 2 files, ++202 | --202") — 🔧 [chore] Update dependencies in package.json


- Upgraded @secretlint/secretlint-rule-* packages from ^12.3.0 to ^12.3.1 for improved security and functionality.

- Updated eslint-plugin-github-actions-2 from ^1.1.0 to ^1.1.1 for bug fixes and enhancements.

- Upgraded git-cliff from ^2.12.0 to ^2.13.1 for better release notes generation.

- Updated postcss from ^8.5.10 to ^8.5.12 for performance improvements.

- Upgraded secretlint from ^12.3.0 to ^12.3.1 for better secret detection capabilities.

- Updated stylelint-define-config from ^17.8.0 to ^17.9.0 for improved linting rules.


- [`9794227`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/97942271a11d57d6c9fb698a3456262fca0b1706 "📝 Diff: 3 files, ++271 | --674") — 🔧 [chore] Update dependencies in package.json


- Upgraded @secretlint/secretlint-rule-* packages from ^12.2.0 to ^12.3.0 for improved security and functionality.

- Updated commitlint from ^20.5.0 to ^20.5.2 to incorporate recent fixes and enhancements.

- Upgraded knip from ^6.6.2 to ^6.7.0 for better code analysis.

- Updated npm-check-updates from ^21.0.3 to ^22.0.1 for improved dependency management.

- Upgraded npm-package-json-lint from ^10.2.1 to ^10.3.0 for better linting capabilities.

- Updated secretlint from ^12.2.0 to ^12.3.0 for enhanced secret detection.

- Upgraded stylelint-no-browser-hacks from ^2.0.0 to ^2.0.2 for better linting of CSS.


- [`03ff52d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/03ff52d60adf7f8cf336cfd6a49290fe6a686f24 "📝 Diff: 2 files, ++253 | --272") — 🔧 [chore] Update dependencies in package.json


- ⬆️ Upgrade @secretlint packages from ^12.1.0 to ^12.2.0 for improved security and functionality.

- ⬆️ Upgrade @vitest packages from ^4.1.4 to ^4.1.5 for bug fixes and enhancements.

- ⬆️ Upgrade eslint-plugin-etc-misc from ^1.0.7 to ^1.0.8 for better linting capabilities.

- ⬆️ Upgrade eslint-plugin-typefest from ^1.2.3 to ^1.2.4 for updated type definitions.

- ⬆️ Upgrade knip from ^6.5.0 to ^6.6.0 for improved code analysis.

- ⬆️ Upgrade npm-check-updates from ^21.0.2 to ^21.0.3 for better dependency management.

- ⬆️ Upgrade prettier-plugin-multiline-arrays from ^4.1.5 to ^4.1.6 for enhanced formatting options.

- ⬆️ Upgrade secretlint from ^12.1.0 to ^12.2.0 for updated secret detection rules.

- ⬆️ Upgrade stylelint-define-config from ^17.5.0 to ^17.8.0 for improved configuration options.

- ⬆️ Upgrade stylelint-plugin-docusaurus from ^1.0.2 to ^1.0.3 for better Docusaurus support.


- [`5013a6d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5013a6d116d038d9d7c16c61e2307180099c3f0d "📝 Diff: 1 file, ++364 | --438") — ✨ [feat] Implement user authentication flow

- Introduced login and registration endpoints for user management

- Added JWT token generation for secure session handling

- Integrated password hashing for enhanced security

- Updated user model to include role-based access control

- Enhanced error handling for authentication processes



### 🚜 Refactor

- [`e83ecba`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e83ecbaa981a41b697ce0bc34c2caad7c53228aa "📝 Diff: 2 files, ++24 | --22") — 🚜 [refactor] Update Docusaurus config to enable trailing slash in URLs



### 📝 Documentation

- [`6e1fa03`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6e1fa039d1d7c846166942c1457602dbe5070f41 "📝 Diff: 1 file, ++3 | --0") — 📝 [docs] Update comments in Secretlint configuration file


- [`bc52330`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bc5233007e26c3af6cbd9f53257c7a9dc968ed87 "📝 Diff: 3 files, ++161 | --3386") — 📝 [docs] Update homepage URL in package.json


- [`645745a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/645745a8457fd0cb7116cd2104f4d45a7dea628a "📝 Diff: 1 file, ++3 | --0") — 📝 [docs] Update npm trusted publishing instructions in copilot documentation



### 🧹 Chores

- [`72acef8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72acef88213ddb7bcd3fb8aca5806bcef210b40c "📝 Diff: 2 files, ++3 | --3") — Release v1.2.5


- [`4cec646`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4cec6469ab992013b84c5f1800e9b1f7a41a1e69 "📝 Diff: 2 files, ++25 | --25") — 🔧 [chore] Update dependencies in package.json and package-lock.json

- Upgrade eslint-config-nick2bad4u to version 1.0.10

- Upgrade prettier-config-nick2bad4u to version 1.0.8

- Upgrade remark-config-nick2bad4u to version 1.0.1

- Upgrade secretlint-config-nick2bad4u to version 1.0.3

- Upgrade stylelint-config-nick2bad4u to version 1.0.3


- [`27a5f7d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/27a5f7dfd647627c58d871eb5afb26356365caf3 "📝 Diff: 3 files, ++96 | --9") — 🧹 [chore] Update TypeScript configuration files to exclude additional directories

- Added coverage and various build-related directories to exclusion lists in tsconfig.build.json and tsconfig.eslint.json

- Improved clarity and maintainability of TypeScript project structure


- [`44d8d49`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/44d8d49a449636132cf476becdd267491a25d20a "📝 Diff: 2 files, ++270 | --270") — 🔧 [chore] Upgrade knip dependency to version 6.11.0


- Updated the "knip" package from version 6.10.0 to 6.11.0 in package.json.

- This upgrade may include bug fixes, performance improvements, and new features as per the release notes of knip.


- [`ae75313`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ae7531382e20d346e901c6f7ae3ac97c9aea9f53 "📝 Diff: 11 files, ++2224 | --4289") — 🧹 [chore] Update tsconfig.eslint.json to simplify include patterns


- Removed specific file patterns from the "include" section to allow for broader inclusion of files.

- Added a new pattern to include TypeScript declaration files in the "docs/docusaurus/typedoc-plugins" directory.

- This change aims to streamline the configuration and ensure all relevant files are considered during linting.


- [`a313bb1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a313bb137530d41bf193bb907618565a24874b30 "📝 Diff: 2 files, ++8 | --8") — 🔧 [chore] Update eslint-plugin-repo to version 1.0.3 in package.json and package-lock.json


- [`5fcfc7c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5fcfc7c4de72084bbf90dda961f38afd55ca12f8 "📝 Diff: 2 files, ++228 | --228") — 🔧 [chore] Update dependencies and scripts in package.json


- Updated @typescript-eslint packages to version 8.59.1 for improved type-checking and linting capabilities.

- Updated eslint-plugin-no-use-extend-native to version 0.7.3 for better compatibility.

- Updated eslint-plugin-promise to version 7.3.0 to leverage the latest features and fixes.

- Updated stylelint to version 17.9.1 for enhanced styling rules.

- Updated typescript-eslint to version 8.59.1 for better TypeScript support.

- Modified update-deps script to include sync:rules:write for better rule synchronization.

- Adjusted verify:readme-rules-table script to utilize sync:rules:write for consistency in README updates.


- [`8302d47`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8302d47ceafc7349ebee2aa40994978f7ff0e1c9 "📝 Diff: 2 files, ++24 | --5") — 🧹 [chore] Update CODEOWNERS and package.json precommit scripts


- Update CODEOWNERS to specify ownership for various directories.

- Modify precommit script to streamline rule synchronization.

- Enhance linting commands to include rule checks and updates.


- [`9e89128`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9e8912860718c696160ce365e3c3b15848bcc378 "📝 Diff: 2 files, ++17 | --17") — 🔧 [chore] Update dependencies in package.json and package-lock.json

- [dependency] Update version of @iconify/utils to 3.1.1

- [dependency] Update version of mlly to 1.8.2

- [dependency] Update version of baseline-browser-mapping to 2.10.23

- [dependency] Update version of caniuse-lite to 1.0.30001791

- [dependency] Update version of filing-cabinet to 5.4.0

- [dependency] Update version of hookified to 2.2.0

- Modify update-deps script to include npm update for workspaces


- [`8c01d08`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8c01d08b111eb8231faadbca908e16b5c1cc3039 "📝 Diff: 7 files, ++159 | --642") — 🔧 [chore] Update ESLint plugins and remove run-typedoc-docs script


- 🔧 Updated "eslint-plugin-file-progress-2" from "^5.0.1" to "^5.1.0"

- 🔧 Updated "eslint-plugin-immutable-2" from "^1.0.10" to "^1.1.0"

- 🔧 Updated "eslint-plugin-stylelint-2" from "^1.1.0" to "^1.1.1"

- 🔧 Updated "eslint-plugin-write-good-comments-2" from "^1.0.6" to "^1.1.0"

- 🔥 Removed the "run-typedoc-docs.mjs" script due to redundancy


- [`05d2955`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/05d29556dcff85e93bbbe3daffd207dffaed5e3a "📝 Diff: 1 file, ++1 | --1") — 🔧 [chore] Update SonarLint project key in settings.json


- [`866bcb1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/866bcb1f6a9a37f71ab005c1c3592b983b52c7c7 "📝 Diff: 3 files, ++465 | --451") — 🔧 [chore] Update dependencies in package.json


- Upgraded "@typpi/eslint-plugin-vite" from "^1.0.12" to "^1.0.13"

- Updated "eslint-plugin-comment-length" from "^2.3.0" to "^2.3.1"

- Upgraded "eslint-plugin-copilot" from "^1.0.8" to "^1.1.0"

- Updated "eslint-plugin-docusaurus-2" from "^0.1.4" to "^0.2.0"

- Upgraded "eslint-plugin-github-actions-2" from "^1.0.6" to "^1.1.0"

- Updated "eslint-plugin-sdl-2" from "^1.0.7" to "^1.1.0"

- Upgraded "eslint-plugin-stylelint-2" from "^1.0.14" to "^1.1.0"

- Updated "eslint-plugin-tsdoc-require-2" from "^1.0.9" to "^1.1.0"

- Upgraded "eslint-plugin-typedoc" from "^1.1.4" to "^1.2.0"

- Updated "knip" from "^6.6.0" to "^6.6.2"

- Upgraded "prettier-plugin-multiline-arrays" from "^4.1.6" to "^4.1.7"

- Updated "stylelint" from "^17.8.0" to "^17.9.0"

- Upgraded "vite" from "^8.0.9" to "^8.0.10"

- Updated package manager from "npm@11.12.1" to "npm@11.13.0"


- [`53bfb31`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/53bfb31732b44832aa5f90072048aa0f043fe06f "📝 Diff: 21 files, ++25 | --5549") — 🧹 [chore] Removes site-contract tooling

- 🧹 Drops the repository-local Docusaurus site-contract package, wrappers, guide page, and related sidebar/CSS references.
- 📝 Centralizes branding and SEO metadata in shared config values, and updates the docs title, blog labels, and internal links.
- 🧹 Cleans up lint exclusions and other leftovers tied to the removed contract files.






## [1.2.4] - 2026-04-21


- <b>Commit Range: ➡️</b> [`1d62dee...5cc365a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/1d62dee363f07258e17f2a87c560196a42fee7de...5cc365abfccf2b906685577a69839781739dbd1f "View full commit range on GitHub")



### 🚜 Refactor

- [`fd21ffb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fd21ffbb8ffddd90901cb71e9dbf721f5b72c6c6 "📝 Diff: 1 file, ++1 | --1") — 🚜 [refactor] Update jsonSchemaValidator initialization to use null instead of undefined


- [`1d62dee`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1d62dee363f07258e17f2a87c560196a42fee7de "📝 Diff: 31 files, ++998 | --730") — 🚜 [refactor] Removes redundant type assertions

- 🚜 [refactor] Simplifies rules, test helpers, and fixtures by relying on inferred types instead of repeated casts.
- 🧹 [chore] Updates formatting and tooling versions to keep the workspace current.



### 🧹 Chores

- [`5cc365a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5cc365abfccf2b906685577a69839781739dbd1f "📝 Diff: 2 files, ++3 | --3") — Release v1.2.4


- [`daee4c3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/daee4c34b7a6d9c248c4948c147da36500f4158e "📝 Diff: 2 files, ++594 | --592") — 🧹 [chore] Update knip command and add esbuild dependency


- Removed the `--include-libs` option from the knip command to streamline the analysis process.

- Added `esbuild` as a new dependency to enhance build performance and support for modern JavaScript features.






## [1.2.3] - 2026-04-20


- <b>Commit Range: ➡️</b> [`9c99c8c...f51e139`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/9c99c8c05db306a996a7f4a35d1f6a510982a90d...f51e1391984fa6b51d4dc5ec61efbe1b6a5003ae "View full commit range on GitHub")



### 🧹 Chores

- [`f51e139`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f51e1391984fa6b51d4dc5ec61efbe1b6a5003ae "📝 Diff: 2 files, ++3 | --3") — Release v1.2.3


- [`9c99c8c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9c99c8c05db306a996a7f4a35d1f6a510982a90d "📝 Diff: 1 file, ++0 | --2") — 🔧 [chore] Remove NODE_AUTH_TOKEN from npm publish step in release workflow






## [1.2.2] - 2026-04-18


- <b>Commit Range: ➡️</b> [`598adda...c99ef2a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/598adda2d1fa856ccbd64721f640f5900b3f2f47...c99ef2a169b2f95b0816d9db939c0e1dbf793103 "View full commit range on GitHub")



### ✨ Features

- [`b9c3d9a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b9c3d9a84bb0e89ce583efa87251ff6c0ced14f0 "📝 Diff: 48 files, ++3323 | --19") — ✨ feat(rules): add 6 new rules for type-fest v5.6 and ts-extras v1.0 (R097–R102)

New rules:
- ✨ prefer-type-fest-absolute (R097): replace Abs<N>/AbsoluteValue<N> with Absolute<N>
- ✨ prefer-type-fest-non-nullable-deep (R098): replace DeepNonNullable<T> with NonNullableDeep<T>
- ✨ prefer-type-fest-union-length (R099): replace UnionToTuple<T>['length'] with UnionLength<T>
- ✨ prefer-ts-extras-assert-never (R100): replace manual never checks with assertNever()
- ✨ prefer-ts-extras-is-property-defined (R101): replace filter !== undefined callbacks with isPropertyDefined()
- ✨ prefer-ts-extras-is-property-present (R102): replace filter != null callbacks with isPropertyPresent()

Each rule ships with:
- 📝 Rule source with autofix or hasSuggestions support
- 🧪 RuleTester test coverage including fixer output and fast-check parse-safety guards
- 📁 Valid/invalid typed fixture files
- 📖 Docs page with correct catalog ID placement and required heading structure
- 🗂️ Registration in rules-registry and rule-catalog (R097–R102)
- 🔧 Preset membership (recommended, strict, all, type-fest/types, ts-extras/type-guards as appropriate)

Also:
- 🔄 Sync README rules table and presets matrix with new rules
- 📸 Update Vitest snapshots (docs-heading, plugin-contract, rule-metadata, readme-rules-section)
- 🔐 Switch Codecov uploads in ci.yml and codecov.yml from CODECOV_TOKEN to OIDC (use_oidc: true + id-token: write)



### 📦 Dependencies

- [`d10b1da`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d10b1dae9131aca96f6837b379ccf335e678d077 "📝 Diff: 2 files, ++125 | --101") — ⬆️ [chore] Upgrade eslint and stylelint-config-inspector dependencies

- [dependency] Update eslint ^10.2.1

- Update stylelint-config-inspector from ^2.1.0 to ^2.1.1

- Adjust peer dependency for eslint to ^9.0.0 || ^10.2.1

- Remove size-limit configuration from package.json


- [`993cb97`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/993cb978132076ed76b8f517b5d833618c8024fa "📝 Diff: 3 files, ++161 | --33") — ⬆️ [chore] Upgrade dependencies for TypeScript and related packages

- [dependency] Update TypeScript version 6.0.3

- Update ts-extras to version 1.0.0

- Upgrade type-fest to version 5.6.0

- Update fast-check to version 4.7.0

- Upgrade stylelint-config-inspector to version 2.1.0

- Update stylelint-plugin-docusaurus to version 1.0.2


- [`8c06554`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8c065549b814af2af00f1b6dd220fc07dabc4df3 "📝 Diff: 3 files, ++24 | --0") — ⬆️ [chore] [dependency] Update dev deps and configure new stylelint rules

⬆️ [chore] Upgrade dev dependencies to latest versions

- @vitest/eslint-plugin: ^1.6.15 → ^1.6.16

- eslint-plugin-case-police: ^2.2.0 → ^2.2.1

- eslint-plugin-stylelint-2: ^1.0.11 → ^1.0.13

- eslint-plugin-typefest: ^1.2.0 → ^1.2.1

- postcss: ^8.5.9 → ^8.5.10

- prettier: ^3.8.2 → ^3.8.3

- stylelint: ^17.7.0 → ^17.8.0

🔧 [chore] (stylelint) Disable new rules from stylelint/plugin upgrades

- @stylistic/no-multiple-whitespaces: null (handled by Prettier)

- defensive-css/no-unsafe-clamp-font-size: null

- defensive-css/no-unsafe-will-change: null

- defensive-css/no-user-select-none: null

- defensive-css/require-at-layer: null

- defensive-css/require-forced-colors-focus: null

- defensive-css/require-pure-selectors: null

- defensive-css/require-system-font-fallback: null

- order/custom-properties-alphabetical-order: null (handled by Prettier)

✨ [chore] (stylelint) Enable new rules from stylelint/plugin upgrades

- property-layout-mappings: "flow-relative"

- relative-selector-nesting-notation: "explicit"

- selector-no-deprecated: true


- [`598adda`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/598adda2d1fa856ccbd64721f640f5900b3f2f47 "📝 Diff: 3 files, ++209 | --175") — ⬆️ [chore] [dependency] Update dev deps and configure new stylelint rules

⬆️ [chore] Upgrade dev dependencies to latest versions

- @vitest/eslint-plugin: ^1.6.15 → ^1.6.16

- eslint-plugin-case-police: ^2.2.0 → ^2.2.1

- eslint-plugin-stylelint-2: ^1.0.11 → ^1.0.13

- eslint-plugin-typefest: ^1.2.0 → ^1.2.1

- postcss: ^8.5.9 → ^8.5.10

- prettier: ^3.8.2 → ^3.8.3

- stylelint: ^17.7.0 → ^17.8.0

🔧 [chore] (stylelint) Disable new rules from stylelint/plugin upgrades

- @stylistic/no-multiple-whitespaces: null (handled by Prettier)

- defensive-css/no-unsafe-clamp-font-size: null

- defensive-css/no-unsafe-will-change: null

- defensive-css/no-user-select-none: null

- defensive-css/require-at-layer: null

- defensive-css/require-forced-colors-focus: null

- defensive-css/require-pure-selectors: null

- defensive-css/require-system-font-fallback: null

- order/custom-properties-alphabetical-order: null (handled by Prettier)

✨ [chore] (stylelint) Enable new rules from stylelint/plugin upgrades

- property-layout-mappings: "flow-relative"

- relative-selector-nesting-notation: "explicit"

- selector-no-deprecated: true



### 🧹 Chores

- [`c99ef2a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c99ef2a169b2f95b0816d9db939c0e1dbf793103 "📝 Diff: 2 files, ++3 | --3") — Release v1.2.2


- [`36f103b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/36f103beb2a93965bac9d9d54dd159b59f464461 "📝 Diff: 5 files, ++600 | --169") — 🧹 [chore] Updates lint tooling and styles

- 🎨 Extracts reusable CSS custom properties for homepage sections, cards, and stats blocks to improve consistency and theme flexibility.
- 🔧 Upgrades lint-related dependencies and switches to the newer Docusaurus stylelint ruleset for better compatibility with current tooling.



### 👷 CI/CD

- [`7a5f9d4`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7a5f9d4dcaed439ecb76914c00d66b6dcd1251fc "📝 Diff: 3 files, ++77 | --0") — 👷 [ci] Add Codecov integration and update CI configuration


- Introduced CODECOV_TOKEN environment variable for Codecov uploads.

- Added step to upload bundle analysis to Codecov for improved coverage tracking.

- Updated CI steps to include conditional upload based on environment variables.

🧹 [chore] Update package.json and package-lock.json for size-limit


- Added size-limit as a dependency and configured size limits for ESM and CJS bundles.

- Updated package-lock.json to reflect new dependencies and their versions.






## [1.2.1] - 2026-04-15


- <b>Commit Range: ➡️</b> [`5d609ae...abba1ce`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/5d609ae94b219ae9a1cb1ca2cab575dee688dafa...abba1ce6145bbb2865e3a27f317cc8f2b42977de "View full commit range on GitHub")



### 🛠️ Bug Fixes

- [`30f7c1a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/30f7c1adbf204bfb6bcb5b3e8a9510e6039a8bab "📝 Diff: 2 files, ++5 | --5") — 🔥 [fix] Test ESLint Hang


- [`2aa2d7e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2aa2d7e2ea573449f57900081c826f24bdcf137d "📝 Diff: 1 file, ++1 | --1") — 🔥 [fix] Test ESLint Hang


- [`96e8737`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/96e87375cacc757aba790e941469d5b7fd570059 "📝 Diff: 1 file, ++2 | --1") — 🔥 [fix] Test ESLint Hang


- [`5d609ae`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5d609ae94b219ae9a1cb1ca2cab575dee688dafa "📝 Diff: 2 files, ++17 | --18") — 🔥 [fix] Test ESLint Hang



### 🧹 Chores

- [`abba1ce`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/abba1ce6145bbb2865e3a27f317cc8f2b42977de "📝 Diff: 2 files, ++3 | --3") — Release v1.2.1






## [1.2.0] - 2026-04-14


- <b>Commit Range: ➡️</b> [`4b4d501...6166e67`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/4b4d501b5fc65dcfc4f47fae449016ffb3f007ee...6166e67dc896fa8e04567bb941a5a00eaf7e77ad "View full commit range on GitHub")



### ✨ Features

- [`76f2cda`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/76f2cda0c2301bfdf92cf90dc5e6ab13242f4126 "📝 Diff: 1 file, ++2 | --2") — ✨ [feat] Add site contract configuration files to ESLint ignore and project service

- Include `docs/docusaurus/site-contract.config.d.mts` and `docs/docusaurus/site-contract.config.mjs` in the ESLint ignore list

- Remove these files from the default project service allow list


- [`a6b2ae7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a6b2ae706c1a326f6d346722e4b417becb2cd71a "📝 Diff: 16 files, ++143 | --93") — ✨ [feat] Update CI and Codecov configurations for improved reporting

- Refactor Codecov flags to remove redundant 'unit,' prefix

- Enhance coverage reporting for multiple OS environments in codecov.yml

- Add new CSS module for GitHub stats component

- Update GitHubStats component to use new CSS module

- Remove deprecated styles from index.module.css

- Add ESLint plugin for Docusaurus 2 support

- Update dependencies in package.json and package-lock.json


- [`5408f71`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5408f71e8fa3ea851102dc8ce015c63f3e8e5f00 "📝 Diff: 1 file, ++68 | --6") — ✨ [feat] Enhance RuleTester with timed Vitest case execution


- Introduce shared timeout for RuleTester-generated Vitest cases.

- Implement runTimedRuleTesterCase to manage timeout injection for Vitest hooks.

- Update RuleTester.it and RuleTester.itOnly to utilize the new timed execution logic.


- [`e5f4c24`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e5f4c24a0decbf40112f404d2e65cc8932ff9058 "📝 Diff: 10 files, ++1205 | --10474") — ✨ [feat] (docusaurus-site-contract) Enhance site contract validation and documentation

- Introduced new types for structured validation failures and expectations in the Docusaurus site contract.

- Added detailed JSDoc comments for better understanding of the contract types and their usage.

- Updated the manifest template to ensure correct ordering of properties.

- Refactored the contract validation functions to improve clarity and maintainability.
🧪 [test] (docusaurus-site-contract) Improve test assertions for site contract validation

- Updated test cases to use more descriptive assertions for undefined script checks.

- Ensured consistency in test output and improved readability of test results.


- [`5f4cf5a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5f4cf5a0de556fd5c2fd94d93e91340293cccc86 "📝 Diff: 14 files, ++10114 | --8433") — ✨ [feat] (docusaurus-site-contract) Introduce repository-local script wrappers and manifest template

- Implement repository-local script wrappers for the Docusaurus site contract, allowing manual execution without package.json wiring.

- Create `init-docusaurus-site-contract.mjs` and `validate-docusaurus-site-contract.mjs` for initialization and validation tasks.

- Update `docusaurus-site-contract.mjs` to re-export the vendored implementation.

- Add a new `manifest.template.json` for package metadata, including dependencies and scripts.

- Refactor the init command to utilize the new script wrappers, enhancing usability in template-derived repositories.

- Update tests to validate the new structure and ensure proper functionality of the wrappers and scripts.


- [`e329ce5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e329ce5508a843f67f0c32154ec982c2d7896cbf "📝 Diff: 8 files, ++138 | --37") — ✨ [feat] (workflow) Enhance dependency review and release workflows

- Add permissions for dependency review action

- Introduce rebuild step for manual version bump in release workflow

- Create release archives and include them in GitHub release
📝 [docs] (manifest) Update documentation manifest with improved descriptions and categories

- Revise app description and add relevant categories

- Enhance icon references for better clarity


- [`4b4d501`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4b4d501b5fc65dcfc4f47fae449016ffb3f007ee "📝 Diff: 1 file, ++1 | --0") — ✨ [feat] Add 'prefer-no-bin' rule to npm package JSON linting configuration



### 🛠️ Bug Fixes

- [`70e207e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/70e207e5cef8e2e4b20ed0aeca6860dd6eec46ee "📝 Diff: 1 file, ++1 | --1") — 🔥 [fix] eslint hang


- [`08f0148`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/08f0148e5d4e5785ccaa34b07af0e35354052906 "📝 Diff: 4 files, ++188 | --176") — 🔥 [fix] eslint hang


- [`01671b6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/01671b6ab2f37a6ecb82867244c68aafd2b56182 "📝 Diff: 2 files, ++53 | --3") — 🔥 [fix] eslint hang


- [`05238f1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/05238f10a4a1919cb919ca405458e49a8d73e58c "📝 Diff: 1 file, ++0 | --1") — 🔥 [fix] Change Runner


- [`7af13ea`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7af13eab364c24fcde49f35932e52ecb142375c9 "📝 Diff: 1 file, ++0 | --49") — 🔥 [fix] Change Runner


- [`b0f53ea`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b0f53ea9a2441a514847e207a3c2a59e928f3ce7 "📝 Diff: 2 files, ++2 | --2") — 🔥 [fix] Change Runner


- [`1b253fd`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1b253fd15ca088862753af4507ee0906cd9c3152 "📝 Diff: 1 file, ++1 | --1") — 🔥 [fix] Add debug logging to verify script to find out where hang is coming from


- [`8f045d1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8f045d1342e712147d7df9a5ca2dc44fa09b6514 "📝 Diff: 2 files, ++5 | --5") — 🔥 [fix] Change Runner to Windows


- [`a16b5fd`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a16b5fd5aefb15b63072856a6128a57476c658c8 "📝 Diff: 3 files, ++4 | --4") — 🔥 [fix] Add Stylelint disables to each css file manually


- [`ecfd4ea`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ecfd4eaaa3dc6f240b4487cf3c6fa543666aa437 "📝 Diff: 38 files, ++513 | --3321") — 🔥 [fix] Remove deprecated array find functions and tests

- Deleted the `arrayFind` and `arrayFindLast` functions from the codebase as they are no longer needed.

- Removed associated valid and invalid test fixtures for both functions to clean up the test suite.

- Updated the plugin source configurations to reflect the removal of these rules.

- Ensured that all references to the removed functions in tests were cleaned up, maintaining the integrity of the test suite.



### 📦 Dependencies

- [`c4ff9f8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c4ff9f86d21a8cb3af5ae3feaf65e36df6e7608d "📝 Diff: 1 file, ++3 | --3") — [dependency] Update follow-redirects in the npm_and_yarn group across 1 directory

[dependency] Updates the npm_and_yarn group with 1 update in the / directory: [follow-redirects](https://github.com/follow-redirects/follow-redirects).


Updates `follow-redirects` from 1.15.11 to 1.16.0
- [Release notes](https://github.com/follow-redirects/follow-redirects/releases)
- [Commits](https://github.com/follow-redirects/follow-redirects/compare/v1.15.11...v1.16.0)

---
updated-dependencies:
- dependency-name: follow-redirects
  dependency-version: 1.16.0
  dependency-type: indirect
  dependency-group: npm_and_yarn
...


- [`66ed290`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/66ed290b7dd36c520b1ff26a4134face89cf9e38 "📝 Diff: 1 file, ++3 | --3") — [dependency] Update basic-ftp in the npm_and_yarn group across 1 directory

[dependency] Updates the npm_and_yarn group with 1 update in the / directory: [basic-ftp](https://github.com/patrickjuchli/basic-ftp).


Updates `basic-ftp` from 5.2.0 to 5.2.2
- [Release notes](https://github.com/patrickjuchli/basic-ftp/releases)
- [Changelog](https://github.com/patrickjuchli/basic-ftp/blob/master/CHANGELOG.md)
- [Commits](https://github.com/patrickjuchli/basic-ftp/compare/v5.2.0...v5.2.2)

---
updated-dependencies:
- dependency-name: basic-ftp
  dependency-version: 5.2.2
  dependency-type: indirect
  dependency-group: npm_and_yarn
...


- [`25e5dfb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25e5dfbaf0d246e0196fbd09d35f9f1b95762d3c "📝 Diff: 4 files, ++44 | --42") — ⬆️ [build] Upgrade dependencies for improved stability and performance

- [dependency] Update react and react-dom to version 19.2.5

- Update @eslint/config-helpers to version 0.5.5

- Upgrade eslint-plugin-typedoc to version 1.1.4

- Update knip to version 6.3.1

- Upgrade postcss-sort-media-queries to version 6.4.4

- Update @typescript-eslint packages to version 8.58.1


- [`82b4345`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/82b4345789dbfdb2ff31f5fbd78cca4ffb7c9d4d "📝 Diff: 2 files, ++7895 | --237") — ⬆️ [build] Upgrade TypeScript ESLint packages to version 8.58.1


- Updated dependencies for TypeScript ESLint packages:
  
- "@typescript-eslint/parser" from "^8.58.0" to "^8.58.1"
  
- "@typescript-eslint/type-utils" from "^8.58.0" to "^8.58.1"
  
- "@typescript-eslint/utils" from "^8.58.0" to "^8.58.1"
  
- "@typescript-eslint/eslint-plugin" from "^8.58.0" to "^8.58.1"
  
- "@typescript-eslint/rule-tester" from "^8.58.0" to "^8.58.1"
  
- "typescript-eslint" from "^8.58.0" to "^8.58.1"

- These updates may include bug fixes and improvements that enhance linting capabilities and TypeScript support.



### 📝 Documentation

- [`8b9654c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8b9654cdf7c1cdcc5870723437b2d0ecaab62bc9 "📝 Diff: 1 file, ++181 | --176") — 📝 [docs] Update README with installation instructions and usage examples

- Added detailed installation steps for new users

- Included usage examples for key features

- Clarified contribution guidelines for better onboarding



### 🎨 Styling

- [`ef0fe2d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ef0fe2dc63ab1eeb1fc6e59dfca480a2b50db09d "📝 Diff: 1 file, ++1 | --1") — 🎨 [style] Update favicon path in site contract configuration


- [`db0d786`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db0d786e9d381b18b3a2c7f20d4e7e45a121888b "📝 Diff: 1 file, ++1 | --1") — 🎨 [style] Simplify warning type assertion in Webpack suppressor


- [`fa2f10a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fa2f10a21376cd2b120d0e3fcaffa157c69b1270 "📝 Diff: 1 file, ++2 | --1") — 🎨 [style] Update sonar.exclusions for consistency in path formatting


- [`f64122b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f64122bbe7eee65a77c334d1978b56ea00b398b0 "📝 Diff: 1 file, ++35 | --17") — 🎨 [style] Enhance webpack configuration to suppress critical dependency warnings

- Improve handling of known webpack warnings emitted by the UMD build of vscode-languageserver-types

- Refactor alias resolution for vscode-css-languageservice and vscode-languageserver-types


- [`6f126c6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6f126c6f0283e76df6faff6c05673e7ec76f2409 "📝 Diff: 1 file, ++1 | --1") — 🎨 [style] Update sonar.cpd.exclusions to include .github directory


- [`fa3180c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fa3180c88033144f805243bf29d063ca20b7c40d "📝 Diff: 1 file, ++0 | --1") — 🎨 [style] Remove unused '*.d.mts' file extension from TypeScript configuration



### 🧹 Chores

- [`6166e67`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6166e67dc896fa8e04567bb941a5a00eaf7e77ad "📝 Diff: 2 files, ++3 | --3") — Release v1.2.0


- [`0af0141`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0af01412c72c1cb67d3bbf196ba77fb97aa24383 "📝 Diff: 2 files, ++3 | --3") — Release v1.1.0


- [`d0780ee`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d0780eea88bcda888fa326127b1a9585612f0d83 "📝 Diff: 2 files, ++30 | --5") — 🔧 [chore] Update eslint-plugin-file-progress-2 to version 5.0.0 in package.json and package-lock.json


- [`c41eca9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c41eca93acab339366e51b9135a8b067343b85cb "📝 Diff: 3 files, ++19 | --14") — 🧹 [chore] Clean up empty code change sections in commit history


- [`f3083ec`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f3083eccfa8920a60bec8398060e2c5f2056a8bd "📝 Diff: 3 files, ++505 | --500") — 🔧 [chore] Update dependencies in package.json


- Upgrade @stryker-mutator/core, @stryker-mutator/typescript-checker, and @stryker-mutator/vitest-runner to version 9.6.1 for improved stability and features.

- Update @types/node to version 25.6.0 for better type definitions.

- Upgrade @vitest/coverage-v8, @vitest/eslint-plugin, and @vitest/ui to version 4.1.4 for enhanced functionality.

- Update jscpd to version 4.0.9 for better code duplication detection.

- Upgrade knip to version 6.4.0 for improved dependency analysis.

- Update npm-check-updates to version 20.0.1 for better package management.

- Upgrade prettier to version 3.8.2 for improved formatting capabilities.

- Update stylelint-plugin-defensive-css to version 2.9.0 for better CSS linting.

- Upgrade vite to version 8.0.8 for enhanced build performance.

- Update vitest to version 4.1.4 for improved testing capabilities.


- [`f4e1f62`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f4e1f62f402ee551acf1fb523fba31bd72dcb115 "📝 Diff: 9 files, ++2 | --435") — 🔥 [chore] Remove deprecated GitHub hooks and scripts

- Deleted obsolete hook configuration in `.github/hooks/hooks.json`
- Removed PowerShell script for logging prompts in `.github/hooks/scripts/log-prompt.ps1`
- Removed Bash script for logging prompts in `.github/hooks/scripts/log-prompt.sh`
- Deleted PowerShell script for removing temporary files in `.github/hooks/scripts/remove-temp.ps1`
- Removed Bash script for removing temporary files in `.github/hooks/scripts/remove-temp.sh`
📝 [docs] Update `.secretlintignore` to exclude logs directory
- Excluded `.github/hooks/logs/` from secret linting checks

✨ [feat] Update TypeScript configuration to support new file types
- Added support for `*.d.mts` files in `tsconfig.eslint.json`
- Added support for `*.d.mts` files in `tsconfig.js.json`






## [1.0.10] - 2026-04-04


- <b>Commit Range: ➡️</b> [`e067c1c...e281889`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/e067c1cd9986a36472b91f1f65fb7304bdf7753d...e28188941fe5e9bd9785270f7ccc46751633dc82 "View full commit range on GitHub")



### ✨ Features

- [`b5b702b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b5b702b2d090f492bed1767a9ed4afe21bf77082 "📝 Diff: 4 files, ++29 | --15") — ✨ [feat] Enhance rule metadata injection and default options handling

- Update `createTypedRule` to centrally inject `ruleId` and `ruleNumber` for cataloged rules

- Refactor default options validation in smoke tests for improved clarity and reliability

- Document changes in `typed-paths.md` to reflect new metadata handling practices



### 🧪 Testing

- [`4325ae5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4325ae5de8b36861b4146ebb0f92f9a4e110e79b "📝 Diff: 9 files, ++1159 | --1117") — 🧪 [test] Refactor rule-tester cases for prefer-ts-extras rules


- 🎨 Update test descriptions for clarity and consistency across multiple test files.

- ⚡️ Increase timeout for rule-tester cases to 120 seconds to accommodate longer-running tests.

- 🧹 Refactor invalid and valid test cases for `prefer-ts-extras-key-in`, `prefer-ts-extras-safe-cast-to`, `prefer-ts-extras-set-has`, and `prefer-ts-extras-string-split` to improve readability and maintainability.

- ✨ Ensure all invalid cases include appropriate output expectations for autofixes where applicable.

- 📝 Maintain existing functionality while enhancing the structure of test cases for better organization.


- [`6598595`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6598595573b69be256740c649031f3d4a7cc30ca "📝 Diff: 1 file, ++85 | --72") — 🧪 [test] Enhance timeout handling and documentation for prefer-type-fest-iterable-element tests

- Increase timeout to 120s for tests involving fast-check properties to ensure CI stability

- Add detailed comments explaining timeout implications and optimization suggestions



### 🧹 Chores

- [`e281889`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e28188941fe5e9bd9785270f7ccc46751633dc82 "📝 Diff: 2 files, ++3 | --3") — Release v1.0.10






## [1.0.9] - 2026-04-03


- <b>Commit Range: ➡️</b> [`2282a49...56a7902`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/2282a49660a5f0c6604f2184ef06f19f3d651021...56a79025fc4b04d9d483f87e34206a93b52b272a "View full commit range on GitHub")



### ✨ Features

- [`4c49ace`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4c49aced5668726b759ac9c25bdd17636607bb85 "📝 Diff: 7 files, ++9 | --56") — ✨ [feat] Update rule metadata structure and identifiers

- Enhance rule metadata to include stable catalog identifiers on public rule docs payloads

- Remove deprecated ruleCatalogId references from internal logic and tests

- Adjust tests to reflect changes in rule metadata structure


- [`d637f86`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d637f868e1b8f243afadf39d717f920069d247ce "📝 Diff: 15 files, ++1935 | --1865") — ✨ [feat] Update rule catalog and metadata for TypeFest enhancements

- Added new TypeFest rules to the rule catalog, including:
  
- `prefer-ts-extras-object-map-values`
  
- `prefer-type-fest-and-all`
  
- `prefer-type-fest-array-length`
  
- `prefer-type-fest-asyncify`
  
- `prefer-type-fest-conditional-except`
  
- `prefer-type-fest-conditional-keys`
  
- `prefer-type-fest-conditional-pick-deep`
  
- `prefer-type-fest-distributed-omit`
  
- `prefer-type-fest-distributed-pick`
  
- `prefer-type-fest-merge`
  
- `prefer-type-fest-optional`
  
- `prefer-type-fest-or-all`
  
- `prefer-type-fest-pick-index-signature`
  
- `prefer-type-fest-set-return-type`
  
- `prefer-type-fest-stringified`
  
- `prefer-type-fest-union-member`
  
- `prefer-type-fest-union-to-intersection`
  
- `prefer-type-fest-union-to-tuple`

- Updated rule metadata snapshots to reflect new rule IDs and numbers, ensuring consistency across tests.

- Removed deprecated or unused rule IDs from the metadata.

- Cleaned up runtime harness tests by removing unnecessary eslint-disable comments for better code clarity.

- Streamlined untyped third-party module declarations by removing unused modules.

- Enhanced documentation integrity tests by reordering canonical headings for better readability.


- [`11f516e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/11f516ec25ae4dbfc9054fc76a1c1832313276f6 "📝 Diff: 1 file, ++4 | --1") — ✨ [feat] Update TypeDoc configuration to include all TypeScript files

- Adjusted "include" to match all TypeScript files in the src directory

- Ensured declaration options are set for better type documentation


- [`6c4f2a5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6c4f2a55daf78041ad48b5dcb49447e0722986b4 "📝 Diff: 4 files, ++1070 | --614") — ✨ [feat] Enhance validation for Docusaurus site contracts


- Introduced new validation functions for package scripts, manifest fields, and source snippets to ensure compliance with specified contracts.

- Added checks for required package scripts, including existence, inclusion of specific strings, and pattern matching.

- Implemented validation for manifest fields to ensure required fields match expected values and that the correct number of icons are declared.

- Created functions to validate source snippets and patterns, ensuring required snippets are present, forbidden snippets are absent, and that snippets appear in the correct order.

- Refactored existing validation logic to utilize the new functions, improving code readability and maintainability.

- Enhanced repository metadata extraction to support URL-like strings from package.json.


- [`8baf4c8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8baf4c8fa2fc698b89d2c57df53af07769e2f40e "📝 Diff: 2 files, ++536 | --0") — ✨ [feat] Add Docusaurus site contract documentation and validation script

- Introduce a new markdown file for Docusaurus site contract

- Implement validation checks for Docusaurus configuration and source files

- Enhance developer experience by providing CLI usage instructions
🧹 [chore] Add precommit script for README synchronization

- Ensure README rules table and presets rules matrix are updated before commits


- [`86310c1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/86310c14f5d9e350b4fbe88bc29f380959f06e35 "📝 Diff: 4 files, ++537 | --537") — ✨ [feat] Update workspace configuration to include all packages

- Changed workspace path in package.json to include all packages under "packages/*"

- This allows for easier management and inclusion of new packages in the workspace


- [`ad64365`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ad643659e8660621b41bbe0ebf853a5430b5d48b "📝 Diff: 24 files, ++5561 | --129") — ✨ [feat] (docusaurus-site-contract) Introduce Docusaurus site contract validation package

- Add package.json and tsconfig.json for the new docusaurus-site-contract package

- Implement core types and functions for validating Docusaurus site contracts in scripts/docusaurus-site-contract.d.mts

- Create compatibility wrapper in scripts/docusaurus-site-contract.mjs to expose validation functions

- Add CLI entry point in scripts/validate-docusaurus-site-contract.mjs for running validations from the command line
🧪 [test] (docusaurus-site-contract) Add comprehensive tests for Docusaurus site contract validation

- Implement tests in test/docusaurus-site-contract.test.ts to validate contract functionality and error reporting

- Include tests for various scenarios including missing assets, configuration structure, and regex pattern checks

- Ensure tests cover both valid and invalid contract cases, providing detailed output for violations



### 🛡️ Security

- [`fcd4301`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fcd4301a40e0a8d43a8f3995e187b4c5ebf59593 "📝 Diff: 5 files, ++1808 | --1201") — ⬆️ [build] Upgrade dependencies in package.json


- Upgraded @typescript-eslint packages to version 8.58.0 for improved TypeScript support.

- Updated @eslint/css to version 1.1.0 for enhanced CSS linting capabilities.

- [dependency] Updateed @eslint/markdown to version 8.0.1 for better markdown support.

- Upgraded all @secretlint rules to version 11.4.1 for the latest security checks.

- Updated @stylistic/stylelint-plugin to version 5.1.0 for improved style linting.

- [dependency] Updateed @typescript-eslint/eslint-plugin and @typescript-eslint/rule-tester to version 8.58.0 for consistency.

- Upgraded eslint-plugin-copilot to version 1.0.6 for better integration.

- Updated various eslint plugins and tools to their latest versions for improved functionality and performance.



### 📝 Documentation

- [`2282a49`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2282a49660a5f0c6604f2184ef06f19f3d651021 "📝 Diff: 3 files, ++53 | --4") — 📝 [docs] Update migration policies in bootstrapper prompts to enforce non-destructive practices

- Add critical migration constraints to preserve existing files and infrastructure

- Emphasize surgical edits over blanket deletions in both new plugin and repo bootstrapper prompts

- Clarify requirements for adapting mature files and maintaining quality controls



### 🎨 Styling

- [`3e0cf04`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3e0cf04b7a45736accef04497c48d5df6dc2a9ed "📝 Diff: 2 files, ++10 | --22") — 🎨 [style] Rearrange canonical heading order in docs-integrity test

- Adjusted the order of headings for better logical grouping

- Maintained eslint-disable comments for clarity
🔧 [chore] Remove unused eslint-plugin-html dependency from package-lock

- Cleaned up package-lock.json to streamline dependencies



### 🧪 Testing

- [`b5730b3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b5730b3a53a9fb61147a485d091e275cf4076f6f "📝 Diff: 144 files, ++1905 | --837") — 🧪 [test] Enforce Vitest strict assertion and lint rules

- Updates testing baseline to satisfy stricter Vitest policy by adding `expect.hasAssertions()` in all test cases.
- Switches numerous legacy `toHaveBeenCalledTimes(1)` to `toHaveBeenCalledOnce()` and strict deep checks to `toStrictEqual`.
- Adds typed `vi.fn<...>` factory signatures and precondition guard patterns to keep test coverage robust and reduce false positives.
- Aligns ESLint config with rules for Vitest assertion usage (`no-conditional-expect`, `no-standalone-expect`, `prefer-called-*`, etc.) to maintain consistent test hygiene.
- Improves fixture and parser safety assertions through defensive branch handling (e.g., precondition throws) and stable import guard checks.

The result:
- fewer lint warnings, more deterministic test contracts,
- easier maintenance of complex autofix/typed-rule test suite behavior.



### 🧹 Chores

- [`56a7902`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/56a79025fc4b04d9d483f87e34206a93b52b272a "📝 Diff: 3 files, ++3 | --3") — Release v1.0.9


- [`394dd4b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/394dd4bc4502c5a45ab65dd77f680fbcf2cf2af6 "📝 Diff: 97 files, ++47 | --109") — 🧹 [chore] Remove defaultOptions from TypeFest rule definitions

- Eliminated the defaultOptions property from multiple TypeFest rule files to streamline configuration.

- Updated related tests to check for undefined defaultOptions instead of empty arrays.

- Adjusted metadata integrity tests to accommodate the removal of defaultOptions.


- [`d904d24`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d904d243eb8cb2acb36afcc6edc58a7fda114dfc "📝 Diff: 4 files, ++58 | --44") — 🔧 [chore] Update dependencies in package.json and package-lock.json


- Upgrade "@eslint/config-helpers" to version 0.5.4

- Upgrade "@types/node" to version 25.5.2

- Upgrade "eslint" to version 10.2.0

- Upgrade "knip" to version 6.3.0

- Upgrade "typedoc-plugin-missing-exports" to version 4.1.3






## [1.0.8] - 2026-03-27


- <b>Commit Range: ➡️</b> [`4ab0cdb...5fa1baf`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/4ab0cdbcc7a84bd20db5fd4597128021953a13b2...5fa1baf5e597ab239066dc89a244dadb034ff378 "View full commit range on GitHub")



### ✨ Features

- [`1f184bf`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1f184bf59e424610d8fe35b1e28a16b571256540 "📝 Diff: 3 files, ++264 | --63") — ✨ [feat] Enhance IndexNow submission workflow with improved ref handling and add tests for sitemap loc element validation

- Add environment variables for base and head refs in the IndexNow submission workflow

- Refactor loc element parsing in the indexnow script to improve error handling

- Introduce a new test case to validate handling of malformed sitemap loc elements


- [`f843a65`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f843a6541d65408106feba619d323adf8f30281d "📝 Diff: 4 files, ++202 | --130") — ✨ [feat] Introduce manual IndexNow submission workflow and update deployment documentation


- Add `Run Index Now Submission` workflow for manual IndexNow notifications

- Implement inputs for submission mode, base ref, head ref, and content paths

- Update `deploy-docusaurus.yml` to remove automatic IndexNow submission

- Modify `deploy-pages-seo-and-indexnow.md` to reflect changes in IndexNow handling

- Refactor `indexnow.mjs` to support site directory configuration for URL submissions


- [`e938ef9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e938ef9fac069da57ffc02bc2f1bfb9b8f538c22 "📝 Diff: 6 files, ++992 | --58") — ✨ [feat] Enhance IndexNow integration and route manifest handling

- Introduced a route manifest generation step during deployment to improve URL submission to IndexNow.

- Updated workflow to submit only changed public URLs instead of the entire sitemap, reducing noise and improving efficiency.

- Added support for inferring public site URL from package metadata and narrowing git-diff scanning through `INDEXNOW_CONTENT_PATHS_JSON`.

- Implemented retry logic for Bing's verification pending responses to handle temporary failures gracefully.

- Enhanced the `indexnow` script with new functions for collecting route manifest entries and resolving changed URLs from the manifest.

- Updated tests to cover new functionalities, including route manifest collection and URL resolution from changed paths.

- Adjusted documentation to reflect changes in deployment and IndexNow submission processes.


- [`0e2f7a5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0e2f7a57a9a7522c251fa6a430352bdf5f50cc08 "📝 Diff: 4 files, ++99 | --0") — ✨ [feat] (docs) Add GitHub Pages SEO and IndexNow deployment documentation

- Introduce a new documentation file detailing the deployment process for GitHub Pages, including SEO considerations and IndexNow notifications.
- Update the main developer documentation index to link to the new SEO and IndexNow deployment guide.
- Enhance the Docusaurus workflow to allow manual toggling of IndexNow submissions during deployments.


- [`74f7550`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/74f755049286763358745c12ea439a39b8ce1e7d "📝 Diff: 9 files, ++1008 | --12") — ✨ [feat] Integrate IndexNow support for sitemap submission

- Added workflow to detect IndexNow configuration and write key file during deployment

- Implemented IndexNow notification job to submit sitemap URLs after deployment

- Enhanced Docusaurus configuration with SEO improvements including canonical URLs and social media metadata

- Introduced helper functions for IndexNow payload creation and sitemap parsing

- Added tests for IndexNow script helpers to ensure functionality and validation


- [`0ae6a0f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0ae6a0f234f8967c94b29d59bf5fba67c32eb7f1 "📝 Diff: 1 file, ++3 | --0") — ✨ [feat] Add Google Analytics tracking ID to Docusaurus config


- [`4ab0cdb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ab0cdbcc7a84bd20db5fd4597128021953a13b2 "📝 Diff: 9 files, ++442 | --197") — ✨ [feat] (analytics) Integrate Google Tag Manager for enhanced tracking

- Added Google Tag Manager configuration to docusaurus.config.ts

✨ [feat] (badges) Update GitHub stats badge to Codecove

- Replaced mutation testing badge with Codecove badge in GitHubStats.tsx

🧹 [chore] (eslint) Add Vite ESLint plugin and update dependencies

- Included @typpi/eslint-plugin-vite in eslint.config.mjs and package.json

- Updated eslint-plugin-github-actions-2 to version 1.0.1

- Updated eslint-plugin-typefest to version 1.0.7

- Updated knip to version 6.0.5

- Updated stylelint-config-inspector to version 2.0.3

⚡️ [perf] (coverage) Adjust Vitest configuration for performance

- Set skipFull to true in vitest configuration

- Disabled globals and set hookTimeout to 10 seconds

- Enabled restoreMocks and set teardownTimeout to 10 seconds



### 🎨 Styling

- [`0a3ca16`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0a3ca16e628130a3b7094d3f42f820592a4648de "📝 Diff: 1 file, ++1 | --1") — 🎨 [style] Update import statement to include 'vi' for mocking in tests



### 🧹 Chores

- [`5fa1baf`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5fa1baf5e597ab239066dc89a244dadb034ff378 "📝 Diff: 2 files, ++3 | --3") — Release v1.0.8


- [`ad7a9e5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ad7a9e5fea0113218bfdc09c69bf485b9f8cf608 "📝 Diff: 6 files, ++794 | --854") — 🔧 [chore] Update dependencies and configuration


- ⬆️ Upgrade "@double-great/stylelint-a11y" from "^3.4.7" to "^3.4.8"

- ⬆️ Upgrade "@eslint/markdown" from "^7.5.1" to "^8.0.0"

- ⬆️ Upgrade "@vitest/coverage-v8" from "^4.1.1" to "^4.1.2"

- ⬆️ Upgrade "@vitest/ui" from "^4.1.1" to "^4.1.2"

- ⬆️ Upgrade "eslint-plugin-jsdoc" from "^62.8.0" to "^62.8.1"

- ⬆️ Upgrade "knip" from "^6.0.5" to "^6.0.6"

- ⬆️ Upgrade "npm-check-updates" from "^19.6.5" to "^19.6.6"

- ⬆️ Upgrade "prettier-plugin-merge" from "^0.10.0" to "^0.10.1"

- ⬆️ Upgrade "stylelint" from "^17.5.0" to "^17.6.0"

- ⬆️ Upgrade "vite" from "^8.0.2" to "^8.0.3"

- ⬆️ Upgrade "vitest" from "^4.1.1" to "^4.1.2"

- ⬆️ Upgrade "npm" from "11.12.0" to "11.12.1"

- 🧹 Remove unused plugins "prettier-plugin-sort-json" and "prettier-plugin-merge" from prettier configuration


- [`62ef2d4`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/62ef2d4e6098391fae7e99525fa6fd6db2086230 "📝 Diff: 2 files, ++5 | --5") — 🔧 [chore] Update @typpi/eslint-plugin-vite to version 1.0.10 in package.json and package-lock.json






## [1.0.7] - 2026-03-24


- <b>Commit Range: ➡️</b> [`b6bc6a5...5c8f0f6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/b6bc6a5315be5a3c945d220389f9a1e888c2a694...5c8f0f65495917ea88e17558f567bc5570621215 "View full commit range on GitHub")



### ✨ Features

- [`d5e0ea7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d5e0ea72e239f312595fdfa2e2f6f387bb4d3766 "📝 Diff: 1 file, ++22 | --5") — ✨ [feat] Add fixture validity tests for prefer-type-fest-set-readonly rule

- Introduce fixtureSafePatternsValidCase to validate fixture-safe patterns

- Implement new test suite for fixture validity with timeout settings

- Remove redundant valid case from existing tests


- [`1503a4d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1503a4d4f81d712531e3b262900e51e00bc392e2 "📝 Diff: 1 file, ++23 | --7") — ✨ [feat] Add fixture validity tests for prefer-type-fest-required-deep rule

- Introduce new test case for fixture-safe patterns

- Implement RuleTester for validating fixture behavior


- [`e8a0fee`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e8a0feee6af763c91e665410f0c8bc76e256977f "📝 Diff: 32 files, ++2686 | --2") — ✨ [feat] (rules) Add new TypeFest rules and corresponding tests

- Introduced rules: prefer-type-fest-asyncify, prefer-type-fest-conditional-keys, prefer-type-fest-distributed-omit, prefer-type-fest-distributed-pick, prefer-type-fest-pick-index-signature, prefer-type-fest-set-return-type, prefer-type-fest-union-to-intersection

- Updated rule metadata snapshots to include new rules

- Enhanced plugin source configs to wire new rules correctly

- Added comprehensive tests for each new rule to ensure functionality and adherence to expected behavior


- [`de24d4e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/de24d4e568a2919b4cdecd288183b2b17e73671a "📝 Diff: 21 files, ++1639 | --268") — ✨ [feat] Add ESLint rule `prefer-type-fest-stringified`

- Introduced a new rule to report manual mapped types of the form `{ [K in keyof T]: string }` that can likely use TypeFest's `Stringified<T>`.

- Implemented logic to detect the specific shape of mapped types and report them with a suggestion to use `Stringified<T>` instead.

- Added comprehensive tests to validate the rule's behavior, including both valid and invalid cases.

✨ [feat] Add ESLint rule `prefer-type-fest-conditional-except`

- Implemented a new rule to report usages of `Except<T, ConditionalKeys<T, Condition>>` that can be replaced with TypeFest's `ConditionalExcept<Base, Condition>`.

- Created tests to ensure the rule correctly identifies and reports the intended patterns.

✨ [feat] Add ESLint rule `prefer-type-fest-merge`

- Developed a rule to suggest using TypeFest's `Merge<Destination, Source>` over `Except<Destination, keyof Source> & Source` when the latter is used for object merging.

- Included tests to cover various scenarios where the rule should trigger.

📝 [docs] Update documentation for new rules

- Added documentation entries for `prefer-type-fest-stringified`, `prefer-type-fest-conditional-except`, and `prefer-type-fest-merge` in the rule metadata and README.

- Updated snapshots to reflect the new rules and their configurations.

🧪 [test] Enhance test coverage for new rules

- Created dedicated test files for `prefer-type-fest-stringified`, `prefer-type-fest-conditional-except`, and `prefer-type-fest-merge` to ensure robust validation of rule behavior.

- Updated existing tests to include references to the new rules in various configurations.


- [`861e069`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/861e06974cc9053543be4d07749d74f06a13db2e "📝 Diff: 24 files, ++1365 | --192") — ✨ [feat] (rule) Introduce `prefer-ts-extras-object-map-values` rule

- Implement a new ESLint rule to suggest using `objectMapValues` from `ts-extras` instead of `objectFromEntries(objectEntries(...).map(...))` when the mapping callback preserves keys and only remaps values.

- Add comprehensive logic to handle various callback patterns and ensure correct identification of key-preserving mappings.

- Include metadata for the new rule, detailing its purpose and usage.

🧪 [test] (rule) Add tests for `prefer-ts-extras-object-map-values`

- Create valid and invalid test fixtures to validate the behavior of the new rule.

- Ensure that the rule correctly identifies and reports on improper usage of `objectFromEntries` with key-preserving mappings.

- Validate that the rule ignores acceptable patterns that do not preserve keys.

📝 [docs] (readme) Update documentation for new rule

- Add the `prefer-ts-extras-object-map-values` rule to the README and documentation snapshots.

- Ensure that the rule is included in the experimental preset section of the documentation.


- [`94bd765`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/94bd7651528a146045f97e7d1b307e6f6ec39dc4 "📝 Diff: 9 files, ++2004 | --1495") — ✨ [feat] (sonar) Introduce new scripts for managing Sonar issues and projects

- 🆕 Add sonar_manage_issues.py for issue management functionalities including fetching, commenting, assigning, and transitioning issues.

- 🆕 Add sonar_manage_project.py for project management functionalities including fetching project info, quality gates, and settings.

- 🆕 Add sonar_manage_render.py for rendering output in a user-friendly format.

- 🔧 Update sonar-project.properties to restrict TypeScript program discovery to relevant configs.


- [`78a7450`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/78a74500a65922ce0db3762aba0667bc92a1ea85 "📝 Diff: 4 files, ++33 | --18") — ✨ [feat] (ci) Enhance release workflow with environment variable for branch resolution
🧹 [chore] Clean up lint-actionlint script by removing unnecessary line
🔧 [fix] (docs) Update sonar-project.properties to refine test and exclusion configurations


- [`d31a74d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d31a74d3a35606632fbf8f3c9fb59b89a6cdb91e "📝 Diff: 19 files, ++198 | --149") — ✨ [feat] (ci) Enhance CI workflows with improved naming, concurrency, and permissions

- Updated CI workflow names for clarity and consistency

- Added run-name for better visibility in GitHub Actions

- Implemented concurrency settings to manage workflow runs

- Adjusted permissions for various jobs to ensure proper access

- Refined job names and added defaults for shell execution

- Improved overall structure and readability of workflow files



### 📦 Dependencies

- [`2dd5ece`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2dd5ece69fa27b1b95a44a99c497fa6fde0f4711 "📝 Diff: 1 file, ++3 | --3") — [dependency] Update h3 in the npm_and_yarn group across 1 directory

[dependency] Updates the npm_and_yarn group with 1 update in the / directory: [h3](https://github.com/h3js/h3).


Updates `h3` from 1.15.8 to 1.15.9
- [Release notes](https://github.com/h3js/h3/releases)
- [Changelog](https://github.com/h3js/h3/blob/v1.15.9/CHANGELOG.md)
- [Commits](https://github.com/h3js/h3/compare/v1.15.8...v1.15.9)

---
updated-dependencies:
- dependency-name: h3
  dependency-version: 1.15.9
  dependency-type: indirect
  dependency-group: npm_and_yarn
...



### 🛡️ Security

- [`9bdfad6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9bdfad66051bd7db1a5c0a6b3f7a5b10dc030831 "📝 Diff: 1 file, ++11 | --2") — 🚜 [refactor] Update ESLint configuration for improved plugin integration

- Replace immutable functional-lite config with all configs

- Switch typefest rules from experimental to all

- Add new SDL security rules for enhanced code safety


- [`8ff3c96`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8ff3c963267e6b307a28ffa52434d6bdee7ef135 "📝 Diff: 7 files, ++3078 | --0") — ✨ [feat] (security) Add GitHub security alerts management script

- Introduced `manage_github_security_alerts.py` for inspecting and managing GitHub repository security alerts.

- Implemented command-line interface (CLI) for user interaction and error handling.

- Integrated JSON output for error reporting and command results.

✨ [feat] (render) Add rendering functionality for security alerts

- Created `github_security_render.py` to format various security alert outputs into human-readable text.

- Implemented functions for rendering summaries, alert lists, and detailed views for code scanning, dependabot, malware, and secret scanning alerts.

- Enhanced output with structured JSON formatting for better readability and usability.



### 📝 Documentation

- [`26a7ea6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/26a7ea60104718e4290a453b7f41315c80f3c75e "📝 Diff: 27 files, ++231 | --128") — 📝 [docs] Update documentation for ESLint rules to clarify requirements

- Updated descriptions for multiple ESLint rules to emphasize the requirement of using TypeFest utilities over manual implementations.

- Changes include rules: prefer-ts-extras-object-map-values, prefer-type-fest-asyncify, prefer-type-fest-conditional-except, prefer-type-fest-conditional-keys, prefer-type-fest-distributed-omit, prefer-type-fest-distributed-pick, prefer-type-fest-merge, prefer-type-fest-pick-index-signature, prefer-type-fest-set-return-type, prefer-type-fest-stringified, and prefer-type-fest-union-to-intersection.

- Adjusted test files to reflect updated documentation for corresponding rules.


- [`40acbdb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/40acbdb2905d94192cf6cb6eb46a1ba2feb69fae "📝 Diff: 2 files, ++4 | --0") — 📝 [docs] (instructions) Update guidelines for handling temporary and debug files

- Clarify that temporary command outputs and debug logs must be stored in `temp/` only

- Emphasize not to create transient log/debug artifacts in the repository root



### 🎨 Styling

- [`841e69c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/841e69cd3abc95e2eb7692dad2259148310e4d27 "📝 Diff: 3 files, ++14 | --14") — 🎨 [style] Improve formatting and readability in scripts

- Adjust spacing in log-prompt.sh for consistency

- Update environment variable access syntax in run-typedoc-docs.mjs
🧹 [chore] Update .secretlintignore to ignore logs directory

- Change specific log file ignore to broader logs directory



### 🧹 Chores

- [`5c8f0f6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5c8f0f65495917ea88e17558f567bc5570621215 "📝 Diff: 2 files, ++3 | --3") — Release v1.0.7


- [`dd3bdc0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/dd3bdc0f6a2adf42d8dc538e4c3ac21b93dbf455 "📝 Diff: 3 files, ++31 | --10") — 🔧 [chore] Update eslint-plugin-testing-library to version 7.16.2 in package.json and package-lock.json
🧪 [test] Add fixture validity tests for prefer-ts-extras-assert-defined rule


- [`07c0350`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/07c0350030fc8d1e48c2c12d2c356a317c1ab03e "📝 Diff: 4 files, ++24 | --12") — 🔧 [chore] Update eslint-config-flat-gitignore to version 2.3.0 and remove cacheFile from .ncurc.json
🧪 [test] Add fixture validity tests for prefer-ts-extras-is-integer rule


- [`2c2ecf9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2c2ecf94c3535192ed6999e44e8bcd8973f28a3c "📝 Diff: 2 files, ++2 | --2") — 🔧 [chore] Update TypeScript peer dependency to support version 6.0.0


- [`2a996a1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2a996a16b2945570fd05eafe1db95702c112aefb "📝 Diff: 15 files, ++801 | --328") — 🔧 [chore] Upgrade dependencies and refactor type casting

- 🔄 Upgrade `@typescript-eslint/parser`, `@typescript-eslint/type-utils`, `@typescript-eslint/utils`, and `typescript-eslint` to version `8.57.2`.
- 🔄 Upgrade `ts-extras` to version `0.19.0` and `knip` to version `6.0.4`.
- 🔄 Upgrade `typescript` to version `6.0.2`.
- 🔄 Refactor type casting in various files to simplify the code:
 
- In `constrained-type-at-location.ts`, removed unnecessary type parameters in `safeCastTo`.
 
- In `set-membership.ts`, simplified the call to `setHas`.
 
- In `type-checker-compat.ts`, streamlined multiple type checker functions by removing redundant type parameters in `safeCastTo`.
 
- In `typescript-eslint-node-autofix.ts`, simplified the initialization of `pendingTypes`.
- 🧪 [test] Update type assertions in `plugin-public-types.test-d.ts` to remove unnecessary type parameters.


- [`98234c0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/98234c0610967222c0ff566dcb1b9b6f0006c72c "📝 Diff: 17 files, ++0 | --7167") — 🔥 [remove] (scripts) Remove sonar_manage_issues, sonar_manage_project, and sonar_manage_render scripts

- Deleted sonar_manage_issues.py, which handled issue management functionalities including fetching issues, adding comments, and transitioning issues.

- Removed sonar_manage_project.py, which managed project-related functionalities such as quality gates, quality profiles, and project settings.

- Eliminated sonar_manage_render.py, responsible for rendering output from the management scripts.


- [`e1da3fc`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e1da3fc896785af5216e357844bd981588b860c5 "📝 Diff: 3 files, ++163 | --186") — 🔧 [chore] Update dependencies in package.json


- Upgraded "@vitest/coverage-v8" from "^4.1.0" to "^4.1.1" for improved coverage reporting.

- Upgraded "@vitest/ui" from "^4.1.0" to "^4.1.1" to ensure compatibility with the latest features.

- Upgraded "knip" from "^6.0.2" to "^6.0.3" for better code analysis.

- Upgraded "typedoc" from "^0.28.17" to "^0.28.18" to benefit from the latest documentation improvements.

- Upgraded "vite" from "^8.0.1" to "^8.0.2" for performance enhancements and bug fixes.

- Upgraded "vitest" from "^4.1.0" to "^4.1.1" to leverage the latest testing capabilities.


- [`dff3ea7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/dff3ea7d76255e76f991613ef47e770c1702e8ff "📝 Diff: 3 files, ++136 | --52") — 🔧 [chore] Update dependencies in package.json and package-lock.json


- Upgrade ts-extras to version 0.18.0

- Upgrade @double-great/stylelint-a11y to version 3.4.7

- Upgrade @vitest/eslint-plugin to version 1.6.13

- Upgrade eslint-plugin-immutable-2 to version 1.0.6

- Upgrade knip to version 6.0.2

- Upgrade postcss-sort-media-queries to version 6.3.3

- Upgrade stylelint-plugin-use-baseline to version 1.4.1

- Upgrade typedoc-plugin-dt-links to version 2.0.47


- [`7eed046`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7eed0467b50bb6e585c177c0f056797f51271226 "📝 Diff: 1 file, ++0 | --28") — 🔥 [chore] Remove npm-badges.json file



### 👷 CI/CD

- [`52c6772`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/52c67720cd7197a0b7d862815f071915ebf89ab6 "📝 Diff: 3 files, ++2665 | --1") — 👷 [ci] Update CI timeout to 60 minutes for improved build stability

- Increased the timeout for CI jobs from 25 to 60 minutes to accommodate longer build processes and prevent premature job termination.






## [1.0.6] - 2026-03-21


- <b>Commit Range: ➡️</b> [`aa783ba...807b137`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/aa783bae3f7f3aea1cc8bb5541cacbac8e4b9a10...807b137b655ca47583161050b34999e0b0a493f6 "View full commit range on GitHub")



### ✨ Features

- [`cd7f013`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/cd7f013bc7d2aecc54af72140c35108258c20922 "📝 Diff: 3 files, ++41 | --28") — ✨ [feat] (dependencies) Add eslint-plugin-github-actions-2 for enhanced GitHub Actions support


- [`625b185`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/625b1859b5d9833196f6c856ec286bc8be186cfd "📝 Diff: 2 files, ++32 | --20") — ✨ [feat] (config) Update Knip rules and enhance TypeDoc CLI output parsing

- Change classMembers rule to catalog with error severity

- Add namespaceMembers rule with warning severity

- Refactor getSubstMappings function for improved readability and performance

- Simplify line parsing and error handling in TypeDoc CLI output


- [`a48dd4e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a48dd4e582a7f9017578fa156e038df9acd3164e "📝 Diff: 2 files, ++24 | --5") — ✨ [feat] (test) Add fixture validity tests for prefer-type-fest-except rule

- Introduced fixtureSafePatternsValidCase to validate fixture-safe patterns

- Implemented warmTypedParserServices for enhanced parsing

- Added new test suite for fixture validity with timeout configuration


- [`5e9fad8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5e9fad8dd8cd5ac40f33d3c5ee0f8f192dd95cbd "📝 Diff: 4 files, ++756 | --205") — ✨ [feat] (docs) Enhance TypeDoc script with Windows path normalization and subst mapping management

- Introduced `normalizeWindowsPath` function for case-insensitive path comparisons.

- Added `getSubstMappings` to list active subst mappings.

- Implemented `removeSubstDrive` to delete existing subst mappings.

- Created `removeStaleRepositorySubstMappings` to clean up old mappings.

- Registered cleanup handlers for temporary subst drives on process termination.

🧹 [chore] (dependencies) Update package dependencies

- Upgraded `@eslint/json` to version 1.2.0.

- Updated multiple `@secretlint` rules to version 11.4.0.

- [dependency] Updateed `eslint` to version 10.1.0.

- Increased `eslint-plugin-typefest` to version 1.0.5.

- Updated `knip` to version 6.0.1.

- Upgraded `secretlint` to version 11.4.0.

- Updated `stylelint-config-inspector` to version 2.0.2.

- [dependency] Updateed `stylelint-define-config` to version 17.5.0.

- Updated `stylelint-plugin-use-baseline` to version 1.4.0.

📝 [docs] (sonar) Exclude non-production code from SonarQube analysis

- Added exclusions for duplication analysis in `sonar-project.properties`.

- Updated test inclusions to include `tests` directory.


- [`c12aa13`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c12aa1314aa6389cf1f1206e8aaa8351be32b039 "📝 Diff: 1 file, ++39 | --0") — ✨ [feat] Add increase-test-coverage prompt for systematic test coverage improvement


- [`0302315`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/030231573bd86fd06f1be90c3936a3c71c71b0d7 "📝 Diff: 12 files, ++1152 | --322") — ✨ [feat] Update ESLint plugins and improve bootstrap script

- Added new ESLint plugins: `eslint-plugin-copilot`, `eslint-plugin-immutable-2`, and `eslint-plugin-sdl-2`.

- Updated versions of existing plugins: `eslint-plugin-etc-misc` (1.0.4), `eslint-plugin-tsdoc-require-2` (1.0.6), and `eslint-plugin-write-good-comments-2` (1.0.4).

- Refactored `bootstrap-eslint-repo.mjs` to use `spawnSync` for command execution, improving error handling and output logging.

- Enhanced command execution with better argument handling and structured output.

- Updated dependency installation commands to use the new command structure.

🧪 [test] Refactor runtime execution tests for better async handling

- Refactored `executeRuntimeIsDefinedSourceText` and `executeRuntimeLooseNullSourceText` to use dynamic module imports for execution.

- Updated tests in `prefer-ts-extras-is-defined.test.ts` and `prefer-ts-extras-is-present.test.ts` to support async assertions with `fast-check`.

- Ensured that runtime behavior is preserved across autofix operations in tests, maintaining second-pass stability.

🧹 [chore] Clean up unused imports and improve test structure

- Removed unused `vm` import from runtime harness tests.

- Improved type safety in test functions by using `Readonly` for options.

- Enhanced readability and maintainability of test cases by restructuring assertions and error handling.


- [`aa783ba`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/aa783bae3f7f3aea1cc8bb5541cacbac8e4b9a10 "📝 Diff: 4 files, ++118 | --18") — ✨ [feat] (rules) Add requireRuleCatalogId option and corresponding validation

- Introduce requireRuleCatalogId option to enforce rule catalog ID presence in documentation.

- Implement validation logic to check for missing or duplicate rule catalog ID lines.
🧪 [test] Add tests for requireRuleCatalogId functionality

- Create tests to verify behavior when requireRuleCatalogId is enabled or disabled.



### 🧹 Chores

- [`807b137`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/807b137b655ca47583161050b34999e0b0a493f6 "📝 Diff: 2 files, ++3 | --3") — Release v1.0.6






## [1.0.5] - 2026-03-20


- <b>Commit Range: ➡️</b> [`7f0c02f...21d83c7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/7f0c02f0c3ac437d36db9fbdbdf78c0c858ee96c...21d83c792e9130a70af03adfd4e051e02c94617d "View full commit range on GitHub")



### ✨ Features

- [`78e33af`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/78e33af196de52dbfc8f51bec10ed68b670fea25 "📝 Diff: 1 file, ++62 | --0") — ✨ [feat] Add SonarCloud configuration for project analysis

- Introduce project identification settings including organization, project key, and name

- Configure SonarCloud server URL for analysis

- Define source and test directories for code analysis

- Set exclusions for non-production files and test folders

- Specify file type suffixes for TypeScript and JavaScript

- Link to TypeScript configuration file

- Add code coverage configuration and analysis settings


- [`ebd96e9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ebd96e9594126aaaf34e54b5d6ea6d931d90f7b3 "📝 Diff: 27 files, ++2203 | --8") — ✨ [feat] (rules) Introduce new TypeFest rules and tests

- 📝 Add rule metadata for `prefer-type-fest-conditional-pick-deep`, `prefer-type-fest-less-than`, `prefer-type-fest-less-than-or-equal`, `prefer-type-fest-union-to-tuple`

- 🧪 Implement tests for `prefer-type-fest-conditional-pick-deep` to ensure correct behavior and parse safety

- 🧪 Implement tests for `prefer-type-fest-less-than` to validate its functionality and parse safety

- 🧪 Implement tests for `prefer-type-fest-less-than-or-equal` to confirm its expected behavior

- 🧪 Implement tests for `prefer-type-fest-union-to-tuple` to ensure it works as intended

- 🔧 Update `vite.config.ts` to allow optional Vitest typecheck execution based on environment variable


- [`5e8cb13`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5e8cb13c02af2e0e234a64b20c048aa365eab25b "📝 Diff: 35 files, ++2927 | --260") — ✨ [feat] Add new TypeFest rules and corresponding tests

- Introduced `prefer-type-fest-and-all`, `prefer-type-fest-array-length`, `prefer-type-fest-optional`, `prefer-type-fest-or-all`, and `prefer-type-fest-union-member` rules to enforce best practices in TypeScript type usage.

- Added detailed documentation and metadata for each rule, including recommendations and type checking requirements.

- Implemented test cases for each rule to ensure correct functionality and parse safety, utilizing Vitest and fast-check for property-based testing.

- Created valid and invalid TypeScript fixtures to validate rule behavior and ensure accurate linting feedback.


- [`977abed`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/977abed2ec366e3e849cc40383e34e03d4d323ce "📝 Diff: 3 files, ++15 | --9") — ✨ [feat] Update GitHub Actions failure fix skill description and implementation steps

- Refine description to emphasize root cause identification and direct implementation of fixes.

- Simplify workflow steps to focus on identifying issues and applying fixes directly.

- Enhance clarity on prerequisites and usage of the `gh` CLI for debugging.


- [`666f168`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/666f168994c1228b02793240786edf08d11ef952 "📝 Diff: 1 file, ++3 | --0") — ✨ [feat] Add warmTypedParserServices to enhance fixture processing


- [`3a36358`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3a36358539a97eaa0641074975d005428a7b70e3 "📝 Diff: 1 file, ++2 | --3") — ✨ [feat] Update AI inference configuration for improved performance

- Change system prompt file to use copilot instructions

- Increase max completion tokens from 2000 to 8000


- [`52ecc7d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/52ecc7d8cc8717e9c72c82eae896aa3490f93ee9 "📝 Diff: 1 file, ++93 | --61") — ✨ [feat] Enhance GitHub Actions failure inspection with improved pattern matching


- Introduced STRONG_FAILURE_LINE_PATTERNS and WEAK_FAILURE_LINE_PATTERNS for better failure detection.

- Updated NON_FAILURE_LINE_PATTERNS to refine log analysis.

- Refactored failure snippet extraction logic for clarity and efficiency.

- Improved argument parsing for better usability.

- Enhanced logging output to include check conclusions and job statuses.


- [`8b3b5da`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8b3b5dab633a9a364eccc5b9d517ebb62732902c "📝 Diff: 5 files, ++860 | --570") — ✨ [feat] Extend gh-fix-ci to inspect GitHub Actions workflow runs

✨ [feat] Add `--run` workflow run support to failure inspection, letting the tool resolve a run id/URL, fetch jobs, and surface failing job logs with run-level fallback.

🧹 [chore] Rename and refactor the inspection script to reflect broader GitHub Actions failure inspection, adding:

- run/job selection, job log fetching, and richer JSON output

- improved log pending detection and run log fallback when job logs are unavailable

📝 [docs] Update gh-fix-ci skill docs/quickstart to reference workflow run workflow and clarify inputs.

🧹 [chore] Add a shorter ESLint plugin bootstrap prompt and strengthen instructions to ensure rules/docs/tests reflect the target framework/library domain.


- [`307be1e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/307be1eb2a5ac6753e364cb57238a541603b956c "📝 Diff: 16 files, ++783 | --1032") — ✨ [feat] (devtools) Add script to generate Chrome DevTools workspace metadata

- Introduced a new script `generate-devtools-workspace-metadata.mjs` to create metadata for Chrome DevTools.

- The script reads the repository's `package.json` to extract necessary information and generates a JSON file with workspace details.

- Supports UUID regeneration via a command-line argument.

- Outputs the metadata file to `docs/docusaurus/static/.well-known/appspecific/com.chrome.devtools.json`.

- Added a new npm script `docs:start:devtools` to serve the Docusaurus site with the generated metadata.

🧹 [chore] Update package.json metadata and dependencies

- Updated author URL in `package.json` to point to the GitHub profile.

- Added new npm scripts for documentation and development tools.

- Upgraded `vite` dependency from `^8.0.0` to `^8.0.1`.

- Updated `packageManager` version from `npm@11.11.1` to `npm@11.12.0`.


- [`fc2c416`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fc2c416c2a074766443a0e46d9a0256fba6fc464 "📝 Diff: 1 file, ++39 | --0") — ✨ [feat] Add suppressKnownWebpackWarnings plugin to handle known Webpack warnings

- Introduce a plugin to ignore specific Webpack warnings related to critical dependencies.

- Add aliases for vscode-css-languageservice and vscode-languageserver-types to improve module resolution.


- [`6989054`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/698905493ddfd74666b4edf99ba0f7e383ff2e0e "📝 Diff: 6 files, ++294 | --6") — ✨ [feat] Update Docusaurus configuration and build scripts for Stylelint Inspector integration

- Add Stylelint Inspector link to Docusaurus navbar

- Update build scripts to include Stylelint Inspector build process

- Modify .gitignore to exclude Stylelint Inspector static files


- [`676208f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/676208f6b5674aa89ab564469afa92de3e1b5185 "📝 Diff: 3 files, ++281 | --98") — ✨ [feat] Add new ESLint plugin bootstrapper prompt for repository scaffolding

- Introduce a comprehensive prompt to scaffold a new ESLint plugin repository using a modern template.

- Emphasize the importance of treating the existing TypeFest repository as a structural guide, not as rule content to adapt.

- Provide detailed instructions for required inputs, project context, and migration steps to ensure a high-quality plugin setup.


- [`fc57f72`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fc57f7289c0c358f2c672a9d3995e7b93cd426b6 "📝 Diff: 8 files, ++580 | --20") — ✨ [feat] Add comprehensive guidelines for benchmarks, documentation, generated folders, scripts, source modules, and testing

- 📝 Introduce benchmarks folder guidelines for performance instrumentation and benchmarking philosophy

- 📝 Update documentation guidelines for ESLint rule documentation quality and static content expectations

- 📝 Add generated and workspace folders guidelines for cache and temporary folder management

- 📝 Establish scripts folder guidelines for repository maintenance and automation

- 📝 Introduce source folder guidelines for authoring rules and source modules in the ESLint plugin

- 📝 Update testing folder guidelines to apply consistent testing standards across test and tests directories


- [`22284e4`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/22284e471569d23834ebc3280aa4ceb79d263918 "📝 Diff: 5 files, ++8 | --1") — ✨ [feat] Update TypeScript configuration files to include additional type declaration files


- Added "*.cjs" and "*.d.cts" to tsconfig.eslint.json, tsconfig.js.json, and tsconfig.vitest-typecheck.json for improved type checking.

- Included "src/**/*.d.ts" in tsconfig.build.json and tsconfig.json to ensure all type declarations are recognized.


- [`4e3802b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4e3802b0e3aec276301bb117a3db5d4ccd1c07cd "📝 Diff: 10 files, ++610 | --410") — ✨ [feat] Add GitHub stats component and enhance documentation


- Introduced a new `GitHubStats` component to display live repository badges.

- Updated `index.tsx` to include the `GitHubStats` component in the homepage layout.

- Enhanced CSS definitions in `index.module.css.d.ts` and `custom.css.d.ts` for better styling.

- Added tests for the new component and its integration in `docusaurus-client-regressions.test.ts`.

- Updated TypeScript configuration to include documentation type definitions.



### 🚜 Refactor

- [`eaebaad`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/eaebaade8cb33a2065ada8cbdbd284d97983eb55 "📝 Diff: 1 file, ++2 | --2") — 🚜 [refactor] Update task configurations to run in the foreground

- Set 'isBackground' to false for 'Build Application' and 'Install Dependencies' tasks


- [`93055b5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/93055b52bd0bc709f360d0f6fbefa8f3b236fe7f "📝 Diff: 1 file, ++68 | --68") — 🚜 [refactor] Restructure prefer-ts-extras-array-concat tests for clarity and organization

- Move warmTypedParserServices call outside of beforeAll for immediate execution

- Update test suite structure to enhance readability and maintainability



### 📝 Documentation

- [`b888542`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b88854259081f833ca9fbce180e906fb97145ce3 "📝 Diff: 12 files, ++113 | --102") — 📝 [docs] Update documentation for Docusaurus, GitHub Actions, JSON, MJS, Markdown, Tests, TypeScript, YAML, and Copilot instructions

- Refine Docusaurus guidelines for TypeDoc integration, build setup, ESLint Config Inspector, and content management.

- Enhance GitHub Actions best practices with clearer instructions on CI/CD workflows, job definitions, and caching strategies.

- Revise JSON instructions to emphasize tooling alignment and validation scripts.

- Clarify MJS documentation regarding TypeScript compatibility and module organization.

- Improve Markdown guidelines for formatting, structure, and tooling alignment.

- Update Tests documentation to emphasize the use of repository helpers and shared test patterns.

- Adjust TypeScript guidelines to prioritize built-in utility types and clarify usage of optional utility libraries.

- Revise YAML instructions for tooling alignment and validation practices.

- Update Copilot instructions to reflect the importance of existing repository utilities and best practices in code quality.
🔧 [chore] Upgrade knip dependency to version 5.88.0


- [`0eb3dd3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0eb3dd32fac28df96d08e9b24a15693902736f4c "📝 Diff: 1 file, ++31 | --32") — 📝 [docs] Update ESLint plugin bootstrapper prompt to clarify removal of TypeFest-specific content

- Emphasize the absolute rule to remove all TypeFest or ts-extras rule code, documentation, and examples

- Clarify folder structure requirements for migrated rules, tests, and docs

- Outline migration steps to ensure only relevant content from the source plugin is retained

- Reinforce final review criteria to maintain a clean and compliant repository


- [`51e3c3c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/51e3c3c78f3fd6da1657910061809cbc8cc2b1f2 "📝 Diff: 1 file, ++32 | --0") — 📝 [docs] Update ESLint plugin bootstrapper prompt with migration rules and structure guidelines


- [`4106347`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4106347295fabafcb203a0a50cfa07e85710cfe6 "📝 Diff: 1 file, ++2 | --1") — 📝 [docs] Update ESLint plugin bootstrapper prompt for clarity and detail

- Clarified instructions on adapting configuration files, emphasizing the importance of maintaining existing setups.

- Added a final check step to ensure all migrated rules are updated for ESLint 10 and documentation is fully functional.


- [`5e6e1f4`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5e6e1f47a90b3d73accf24810e8272a1f09af357 "📝 Diff: 6 files, ++130 | --28") — 📝 [docs] Update prompts and README for clarity and accuracy

- Revise description in discover-unique-eslint-plugin-rules prompt to emphasize implementation

- Clarify instructions in eslint-plugin-repo-bootstrapper prompt to avoid misinterpretation of rule content

- Enhance README badges for better visibility and accuracy

- Update GitHubStats component to include mutation testing badge
🧪 [test] Improve typed-rule-tester with warmup function

- Add warmTypedParserServices to optimize parser service initialization

- Implement warmup in prefer-ts-extras-array-concat test suite to prevent CI timeouts


- [`a40b631`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a40b631317118b358ae1b04f76de54d4aa9cc809 "📝 Diff: 1 file, ++1 | --1") — 📝 [docs] Update prompt for discovering unique ESLint rules to correct typo and enhance clarity

- Fixed typo in "canidates" to "candidates"

- Clarified implementation instructions for new rules



### 🧹 Chores

- [`21d83c7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/21d83c792e9130a70af03adfd4e051e02c94617d "📝 Diff: 2 files, ++3 | --3") — Release v1.0.5



### 👷 CI/CD

- [`cc46de3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/cc46de3ddcfe141af567fe52554ef8dafb29152f "📝 Diff: 2 files, ++217 | --213") — 👷 [ci] Update CI and Codecov workflows for improved structure and readability

- Refactor indentation and formatting in `.github/workflows/ci.yml` and `.github/workflows/codecov.yml`

- Ensure consistent job definitions and step formatting

- Maintain existing functionality while enhancing clarity



### 🔧 Build System

- [`4bc33b9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4bc33b90290e0d634675b3ad411a6ef9ca49af75 "📝 Diff: 2 files, ++58 | --39") — 🔧 [build] Update dependencies in package.json and package-lock.json


- Upgrade eslint-plugin-etc-misc from ^1.0.2 to ^1.0.3

- Upgrade eslint-plugin-perfectionist from ^5.6.0 to ^5.7.0

- Upgrade eslint-plugin-typefest from ^1.0.3 to ^1.0.4

- Upgrade npm-check-updates from ^19.6.3 to ^19.6.5

- Upgrade stylelint-config-recess-order from ^7.6.1 to ^7.7.0

- Upgrade stylelint-plugin-defensive-css from ^2.6.0 to ^2.7.0

- Update @typescript-eslint/utils and related dependencies to ^8.57.1






## [1.0.4] - 2026-03-17


- <b>Commit Range: ➡️</b> [`e7dc70a...f9c4ee9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/e7dc70a640f31841ebae0407df5611de302662cb...f9c4ee94d8cc3ef411cb77a6e006f0e0527cc95b "View full commit range on GitHub")



### ✨ Features

- [`3ccc79b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3ccc79ba496b680bc373cc31abdeb9dc1a6ec24f "📝 Diff: 3 files, ++226 | --211") — ✨ [feat] Enhance ESLint plugin bootstrapper and CI workflows

- Update ESLint plugin bootstrapper instructions for improved clarity and detail

- Refine CI configuration for better readability and maintainability

- Ensure consistent formatting across workflow files

- Add detailed steps for testing, documentation updates, and code quality checks


- [`b740dfb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b740dfbbe9048a625619359f1e58700f1291854c "📝 Diff: 4 files, ++61 | --28") — ✨ [feat] Enhance README rules section extraction and normalization

- Add functions to locate and extract the rules section from README markdown

- Improve normalization of markdown table spacing

- Update tests to reflect changes in rules section extraction logic


- [`2236292`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/22362925fce2c1e8991e4703f752860872a0efce "📝 Diff: 1 file, ++5 | --12") — ✨ [feat] Enhance ESLint rule discovery prompt with implementation guidance

- Update description to include implementation of top candidates

- Revise task description for clarity on rule discovery and implementation

- Add steps for implementing candidates and ensuring integration with existing codebase


- [`0b2c7d8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0b2c7d86a17933942307cabd1e7386b8ed090fc8 "📝 Diff: 4 files, ++8 | --12") — ✨ [feat] Update ruleTester initialization in test files for TypeFest rules

- Refactor to use createRuleTester instead of createTypedRuleTester in multiple test files

- Ensures consistency and leverages updated rule testing capabilities


- [`a343cae`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a343caec7c811e222be83ea8014612daf483cf1e "📝 Diff: 7 files, ++523 | --96") — ✨ [feat] Enhance temp directory cleanup scripts and add ESLint repo bootstrapper prompt

- 🧹 Update PowerShell script to skip placeholder files during cleanup

- 🧹 Improve Bash script to filter out placeholder files and enhance verbose output

- 📝 Add new prompt for bootstrapping ESLint plugin repositories with detailed instructions

- 🧹 Clean up .remarkignore by removing unused documentation files

- 📝 Update .remarkrc.mjs to include new heading validation settings

- 📝 Expand remark-lint-rule-doc-headings with customizable options for heading validation



### 🛡️ Security

- [`a332763`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a332763a40b027911a2679d7faa316e053980ef6 "📝 Diff: 7 files, ++455 | --313") — 🔧 [chore] Update dependencies and package configurations


- ⬆️ Upgrade @double-great/stylelint-a11y from ^3.4.5 to ^3.4.6 for improved accessibility linting.

- ⬆️ Upgrade @eslint-react/eslint-plugin from ^2.13.0 to ^3.0.0 for better React linting support.

- ➕ Add eslint-plugin-etc-misc version ^1.0.2 to enhance linting capabilities.

- ⬆️ Upgrade eslint-plugin-tsdoc-require-2 from ^1.0.4 to ^1.0.5 for better TSDoc support.

- ➕ Add eslint-plugin-typefest version ^1.0.3 for TypeScript utility types linting.

- ⬆️ Update Node.js engine requirement from >=20.19.0 to >=22.0.0 for compatibility with newer features.

- 🔄 Update various dependencies to their latest versions to ensure compatibility and security.



### 📝 Documentation

- [`992b30b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/992b30b7414817ac33f519dc07dd8d07f2c5975c "📝 Diff: 1 file, ++347 | --128") — 📝 [docs] Update README with installation instructions and usage examples

- Added detailed installation steps for new users

- Included usage examples for key features

- Clarified contribution guidelines for better onboarding


- [`5a177a1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5a177a1b2de4873ec7344206cddce4c7a1dd05ec "📝 Diff: 1 file, ++6 | --1") — 📝 [docs] Update discover-unique-eslint-plugin-rules prompt for clarity and completeness

- Added a note emphasizing the importance of high-quality, non-duplicative rules

- Improved wording in the research section for better readability



### 🎨 Styling

- [`18750c3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/18750c3d30506e3e751ddc848e89acc373298d49 "📝 Diff: 1 file, ++1 | --1") — 🎨 [style] Improve conditional syntax in remove-temp.sh



### 🧹 Chores

- [`f9c4ee9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f9c4ee94d8cc3ef411cb77a6e006f0e0527cc95b "📝 Diff: 2 files, ++3 | --3") — Release v1.0.4


- [`88fcdd2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/88fcdd2f712b0d21b00430fa3a698a994e31fc10 "📝 Diff: 1 file, ++46 | --46") — 🔧 [chore] Update dependencies in package-lock.json to latest versions

- [dependency] Update @babel/helper-define-polyfill-provider 0.6.8

- [dependency] Update @babel/helpers 7.29.2

- [dependency] Update @babel/parser 7.29.2

- [dependency] Update @babel/preset-env 7.29.2

- [dependency] Update babel-plugin-polyfill-corejs3 0.14.2

- [dependency] Update @babel/runtime 7.29.2

- [dependency] Update @babel/runtime-corejs3 7.29.2

- [dependency] Update babel-plugin-polyfill-corejs2 0.4.17

- [dependency] Update babel-plugin-polyfill-regenerator 0.6.8

- [dependency] Update core-js and core-js-compat to 3.49.0

- [dependency] Update pure-rand 8.2.0

- [dependency] Update enhanced-resolve 5.20.1


- [`f119b94`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f119b94b9337eedf0414def96061065d864c335e "📝 Diff: 5 files, ++32 | --20") — 🧹 [chore] Update TypeScript configuration files to include additional exclusions and license types

- Added "Apache-2.0" to valid license values in .npmpackagejsonlintrc.json

- Updated tsconfig files to exclude Docusaurus build directories and other specific files


- [`006d2e4`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/006d2e441d21a991ecd9ec5246907e86be3073e7 "📝 Diff: 2 files, ++81 | --81") — 🔧 [chore] Update TypeScript ESLint dependencies to version 8.57.1

- Upgraded @typescript-eslint/parser, @typescript-eslint/type-utils, and @typescript-eslint/utils to ensure compatibility with the latest TypeScript features.

- Updated @typescript-eslint/eslint-plugin and @typescript-eslint/rule-tester for improved linting capabilities.

- [dependency] Updateed knip to version 5.87.0 for enhanced code analysis.

- Updated typescript-eslint to version 8.57.1 for better integration with TypeScript.


- [`07cf1e0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/07cf1e0b8239e7a1855fc6e3e4c7372a6fa2a3ae "📝 Diff: 6 files, ++144 | --117") — 🧹 [chore] Clean up code formatting and improve readability across multiple files

- Standardize function definitions and parameter formatting in `create-eslint-plugin-project.mjs`

- Refactor array and object spread syntax for clarity in `remark-lint-rule-doc-headings.mjs`

- Adjust comment formatting and spacing in `eslint.config.mjs` and `.remarkrc.mjs`

- Update README rules table synchronization logic for better type annotation in `sync-readme-rules-table.mjs`



### 🔧 Build System

- [`e17d20b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e17d20b1e95afc99e2c7059f086ba770d089e17c "📝 Diff: 1 file, ++3 | --0") — 👷 [build] Update Stryker workflow to include package build step

- Added a step to build the package before running Stryker tests






## [1.0.3] - 2026-03-15


- <b>Commit Range: ➡️</b> [`3fe5727...b35f45a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/3fe5727edf254187644466b557f1b4352fdb125b...b35f45a63b512ced904de44e551666a2b61314a1 "View full commit range on GitHub")



### ✨ Features

- [`0b5e017`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0b5e0172aedd9e55e1f1dfcc7e719de9001ce8bf "📝 Diff: 3 files, ++4 | --0") — ✨ [feat] Add .gitkeep files to cache and temp directories

- Introduced .gitkeep in the .cache directory to ensure it is tracked by Git.

- Added .gitkeep in the temp directory for similar tracking purposes.

- Updated .vscodeignore to keep these directories in the workspace.


- [`812938a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/812938a270987622c8236b7e7392fee75b79a32a "📝 Diff: 9 files, ++204 | --139") — ✨ [feat] Update ESLint configuration and dependencies

- 📝 Add TypeScript type definitions for ESLint rules and configurations in `eslint.config.mjs`

- 🧹 Refactor `readConfigRules` and `readPluginConfigRules` functions for better type safety

- 📝 Enhance documentation for `readPluginNamedConfigValue` function

- 🔧 Upgrade `commitlint` and related packages to version 20.5.0 in `package.json` and `package-lock.json`

- 🎨 Improve code style in `create-eslint-plugin-project.mjs` by adding spaces after function names

- 📝 Add new TypeScript declaration file for `remark-lint-rule-doc-headings`

- 🎨 Update `remark-lint-rule-doc-headings.mjs` to include a "Deprecated" section and improve heading validation

- 🧹 Refactor `sync-peer-eslint-range.mjs` to improve error handling when reading `package.json`

- 🧹 Update TypeScript configuration files to include `.d.ts` files in `tsconfig.eslint.json` and `tsconfig.js.json`


- [`3fe5727`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3fe5727edf254187644466b557f1b4352fdb125b "📝 Diff: 4 files, ++25 | --59") — ✨ [feat] Update dependencies and refine ESLint configuration

- Upgrade `eslint-plugin-tsdoc-require-2` to version `1.0.4`

- Upgrade `stylelint-order` to version `8.1.1`

- Update Node.js engine requirement to `>=20.19.0`

- Remove unnecessary OS specifications from package files

- Refactor ESLint configuration by removing unused plugins and rules



### 🧹 Chores

- [`b35f45a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b35f45a63b512ced904de44e551666a2b61314a1 "📝 Diff: 2 files, ++3 | --3") — Release v1.0.3






## [1.0.2] - 2026-03-15


- <b>Commit Range: ➡️</b> [`2efb5b1...d186541`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/2efb5b1d5dd2e52609670b80390bfcd42a5b905c...d186541480fa12c7ff04bc263c631e508c0b182f "View full commit range on GitHub")



### ✨ Features

- [`6393a9f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6393a9f619354e597f4bdcc9bf783d738cdc8bc8 "📝 Diff: 2 files, ++50 | --21") — ✨ [feat] Validate command-line arguments in sync-node-version-files script

- Add type check for command-line arguments to ensure they are strings

- Throw a TypeError for non-string arguments to improve error handling


- [`9876413`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/98764132aa441d48fdfea62b7bd65bab872550b1 "📝 Diff: 10 files, ++402 | --34") — ✨ [feat] Synchronize Node.js version management across workflows and scripts

- Introduced `.node-version` and `.nvmrc` files to standardize Node.js versioning

- Updated GitHub Actions workflows to use `node-version-file` for Node.js setup

- Added `lint:node-version-files` script to ensure version file consistency

- Implemented `sync-node-version-files.mjs` script for automatic synchronization of version files


- [`8243967`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/824396739470d8c9747dcbba54bdc16d5ea88734 "📝 Diff: 4 files, ++100 | --93") — ✨ [feat] Update contributor information and synchronization in documentation


- 📝 Update contributors in .all-contributorsrc to include github-actions[bot]

- 📝 Refresh contributors badge in README.md and CONTRIBUTORS.md to reflect the new total

- 🧪 Refactor readme rules table synchronization test to improve clarity and functionality


- [`ab5d7be`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ab5d7be1362084ce10a44b373a3b93f649710cbd "📝 Diff: 5 files, ++199 | --24") — ✨ [feat] Add auditing prompts for ESLint plugin best practices and rule synchronization

- 📝 Create `audit-eslint-plugin-best-practices` prompt for auditing against modern ESLint practices.
- 📝 Create `audit-rule-docs-tests-preset-sync` prompt for ensuring rule surface synchronization.
- 📝 Create `discover-unique-eslint-plugin-rules` prompt for identifying new rule opportunities.
- 📝 Create `review-repo-consistency-dedupe` prompt for auditing consistency and deduplication.
- 📝 Update `review-hacky-brittle-fixes` prompt to include legacy code paths in the audit focus.


- [`869b6d5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/869b6d5155154655ee175e61673fd8d7b2308d4c "📝 Diff: 10 files, ++894 | --847") — ✨ [feat] Enhance README rules table synchronization


- Introduced new npm scripts for syncing README rules table:
  
- `sync:readme-rules-table:update`: Builds the project and updates snapshots.
  
- `sync:readme-rules-table:write`: Writes changes to the README directly.


- Updated `sync-readme-rules-table.mjs` to export `syncReadmeRulesTable` function, allowing for better modularity and testing.


- Enhanced the README synchronization logic to provide clearer instructions on how to update the rules table.


- Added a test setup in `readme-rules-table-sync.test.ts` to automatically sync the README in update mode, ensuring consistency with the canonical rules matrix.


- [`2efb5b1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2efb5b1d5dd2e52609670b80390bfcd42a5b905c "📝 Diff: 15 files, ++5608 | --1619") — ✨ [feat] Update dependencies and enhance presets documentation

- 🔧 Upgrade `@vitest/eslint-plugin` from `1.6.11` to `1.6.12` for improved linting capabilities.

- 🔧 Upgrade `eslint-plugin-package-json` from `0.90.1` to `0.91.0` for better package.json validation.

- 🔧 Upgrade `postcss-sort-media-queries` from `6.1.0` to `6.3.2` for enhanced media query sorting.

- 🔧 Upgrade `prettier-plugin-multiline-arrays` from `4.1.4` to `4.1.5` for better formatting options.

- 🔧 Upgrade `stylelint-order` from `8.0.0` to `8.1.0` for improved style linting.

- 📝 Refactor `sync-presets-rules-matrix.mjs` to improve documentation generation for presets.

- 📝 Enhance the logic for generating and replacing markdown sections in preset documentation.

- 📝 Add new headings and structure to better organize preset rules in the documentation.



### 📦 Dependencies

- [`751bf84`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/751bf84bcf687910c579b47dbbdd632148c98cc4 "📝 Diff: 1 file, ++6 | --6") — [dependency] Update the npm_and_yarn group across 1 directory with 1 update

[dependency] Updates the npm_and_yarn group with 1 update in the / directory: [undici](https://github.com/nodejs/undici).


Updates `undici` from 7.22.0 to 7.24.1
- [Release notes](https://github.com/nodejs/undici/releases)
- [Commits](https://github.com/nodejs/undici/compare/v7.22.0...v7.24.1)

Updates `undici` from 6.23.0 to 6.24.0
- [Release notes](https://github.com/nodejs/undici/releases)
- [Commits](https://github.com/nodejs/undici/compare/v7.22.0...v7.24.1)

---
updated-dependencies:
- dependency-name: undici
  dependency-version: 7.24.1
  dependency-type: indirect
  dependency-group: npm_and_yarn
- dependency-name: undici
  dependency-version: 6.24.0
  dependency-type: indirect
  dependency-group: npm_and_yarn
...



### 📝 Documentation

- [`44249c6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/44249c61234cd11743122f2ec63873d91f6752e1 "📝 Diff: 9 files, ++113 | --103") — 📝 [docs] Update documentation guidelines across multiple files


- Enhance ESLint rule documentation clarity and structure in `Docs-Folder.instructions.md`

- Refine Docusaurus and TypeDoc integration instructions in `Docusaurus-Folder.instructions.md`

- Expand GitHub Actions CI/CD best practices in `Github-Actions.instructions.md`

- Clarify JSON configuration guidelines in `JSON.instructions.md`

- Improve modern JavaScript practices in `.mjs` files in `MJS.instructions.md`

- Update Markdown content rules and tooling alignment in `Markdown.instructions.md`

- Revise TypeScript development guidelines for compatibility in `Typescript_5.instructions.md`

- Strengthen YAML authoring practices and tooling alignment in `YAML.instructions.md`

- Refine Copilot instructions for ESLint Plugin architecture in `copilot-instructions.md`



### 🎨 Styling

- [`7e063f0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7e063f0dbbfcec03ccb42199742409c84adf630c "📝 Diff: 6 files, ++103 | --99") — 🎨 [style] Update labels in Docusaurus configuration and sidebars

- Changed labels for rules in the Docusaurus config to include icons for better visual representation.

- Updated GitHub and NPM links for `ts-extras` and `type-fest` with new icons for consistency and clarity.
📝 [docs] Improve documentation comments in sync-presets-rules-matrix script

- Enhanced JSDoc comments for better readability and understanding of the PresetConfigName type.
🧹 [chore] Clean up package.json linting scripts

- Removed redundant commands in the linting scripts for improved clarity and maintainability.


- [`724f43d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/724f43dd1113add706826b0047347a482ed3a21f "📝 Diff: 3 files, ++95 | --77") — 🎨 [style] Improve table formatting and alignment in documentation
📝 [docs] Update preset configuration names for clarity



### 🧹 Chores

- [`d186541`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d186541480fa12c7ff04bc263c631e508c0b182f "📝 Diff: 2 files, ++3 | --3") — Release v1.0.2






## [1.0.1] - 2026-03-13


- <b>Commit Range: ➡️</b> [`c94f474...c94f474`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/c94f47418c00ccf8e84b8a7dd1539db18518d22a...c94f47418c00ccf8e84b8a7dd1539db18518d22a "View full commit range on GitHub")



### 🧹 Chores

- [`c94f474`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c94f47418c00ccf8e84b8a7dd1539db18518d22a "📝 Diff: 2 files, ++3 | --3") — Release v1.0.1






## [1.0.0] - 2026-03-13


- <b>Commit Range: ➡️</b> [`d233b9c...fe9afd2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/d233b9c2b49f5f87e10e2c2ee04deed9765f54a3...fe9afd26fe79835b171003e19575a90518e14be6 "View full commit range on GitHub")



### ✨ Features

- [`8219846`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/82198469abc5897572fba1dc3e17a4929daaf7e3 "📝 Diff: 5 files, ++312 | --39") — ✨ [feat] Add Prettier configuration and bootstrap instructions
📝 [docs] Update ESLint configuration with package installation guidance
🧪 [test] Enhance type safety and fix assertions in prefer-ts-extras-key-in tests
🔧 [chore] Include prettier.config.ts in TypeScript configuration


- [`3d0c909`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3d0c909e2649b1603e278ba9774d35b7fe9694c1 "📝 Diff: 19 files, ++195 | --131") — ✨ [feat] Enhance ESLint configuration and improve scope resolution utilities

- Disable `vitest/prefer-expect-type-of` rule due to typechecking issues with current typings.
- Refactor scope resolution logic by introducing `getScopeFromContextSourceCode` for modern ESLint API compatibility.
- Replace legacy scope retrieval methods in `typed-rule.ts` with the new utility.
- Add new `scope-resolution.ts` file containing scope resolution helpers.
- Update various test files to ensure proper type checks and function assertions.
- Improve type safety in tests by refining fix function checks and ensuring expected types.


- [`1d5fa24`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1d5fa24bbea2842389a350d0e5389134b16ee4c3 "📝 Diff: 7 files, ++170 | --86") — ✨ [feat] Add contributors section and update package dependencies

- 📝 Create .all-contributorsrc for managing contributors

- 📝 Add CONTRIBUTORS.md to display contributors with badges

- 📝 Update README.md to include a Contributors section

- 🔧 Update package.json and package-lock.json for dependency upgrades

- 🛠️ Modify eslint.config.mjs to enhance package.json rules

- 🧹 Remove outdated RELEASING.md file


- [`7ff063c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7ff063cd9834399920a111b9c48c3e6ef3ae624c "📝 Diff: 3 files, ++50 | --4") — ✨ [feat] Add strict profile configuration and enhance module exports

- Introduced a new `.attw.json` file with strict profile settings

- Updated `package.json` to support CommonJS and ES module exports

- Modified build scripts to generate CommonJS compatible files

- Added new linting command for strict package checks
🧪 [test] Extend tests for runtime plugin shape validation

- Implemented tests to verify the exported structure of the runtime plugin


- [`292e4a4`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/292e4a49f94c517cb317dbf77cbad13bccdfa3d0 "📝 Diff: 21 files, ++1625 | --395") — ✨ [feat] Enhance Mermaid configuration and add presets rules synchronization


- 🛠️ [fix] Update `mermaid.config.json` to include `ishikawa` settings for improved diagram layout.

- 🔧 [build] Upgrade `eslint-plugin-package-json` from version `0.90.0` to `0.90.1` for better linting support.

- 📝 [docs] Modify `package.json` to include a new script `sync:presets-rules-matrix` for synchronizing presets rules.

- 🛠️ [feat] Introduce `sync-presets-rules-matrix.mjs` script to generate and validate the presets rules matrix from plugin metadata.

- 🧪 [test] Add `presets-rules-matrix-sync.test.ts` to ensure the generated matrix matches the canonical rules.

- 🧪 [test] Update `readme-rules-table-sync.test.ts` to normalize markdown table spacing for consistency in tests.


- [`76ff1fe`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/76ff1fe85bdff07695c59e70cdd023603de59b7f "📝 Diff: 1 file, ++1 | --3") — ✨ [feat] Add blog link to navigation menu

- Introduced a new link to the blog section in the navigation menu for easier access.


- [`c1caabb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c1caabb730504b1ad1d737428b156c8675b7e0eb "📝 Diff: 87 files, ++594 | --317") — ✨ [feat] Add rule catalog ID validation and normalize markdown table spacing


- 📝 Introduced a new function `assertRuleCatalogIdLine` to validate that each rule documentation contains exactly one canonical Rule catalog ID line.
  
- 📜 This function checks for the presence of the Rule catalog ID line and ensures it is correctly positioned relative to the "Further reading" heading.
  
- ✅ Added assertions to verify the expected format and order of the Rule catalog ID line.


- 🛠️ Enhanced the `normalizeRulesSectionMarkdown` function to standardize markdown table row spacing.
  
- 🔄 This function normalizes the spacing of markdown tables to ensure consistent formatting across generated tables.
  
- 📏 It trims whitespace and adjusts column alignment for better comparison between generated and expected markdown tables.


- 🧪 Updated tests to utilize the new normalization function for comparing readme rules sections, ensuring snapshot stability.


- [`473f8d6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/473f8d6329ade1b3e203c7c1fb7a0d2961a41b05 "📝 Diff: 2 files, ++16 | --8") — ✨ [feat] Introduce default operators for nullish comparison parsing

- Added a constant for default nullish comparison operators to improve maintainability

- Updated `getNullishComparison` to use the new default operators instead of hardcoded values

- Enhanced flexibility by allowing custom operators while maintaining default behavior


- [`370a7cd`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/370a7cd7d545a20d0b9047adb75094fa5fbc7709 "📝 Diff: 11 files, ++112 | --23") — ✨ [feat] Enhance typed rule functionality and validation

- 🛠️ [fix] Add non-canonical docs.url validation in createTypedRule

- 🛠️ [fix] Simplify preset membership metadata checks in derivePresetRuleNamesByConfig

- 🛠️ [fix] Refactor typed services retrieval to getTypedRuleServicesOrUndefined

- 🧪 [test] Add tests for non-canonical docs.url handling in createTypedRule

- 🧪 [test] Ensure typed services retrieval behaves correctly in various contexts


- [`719bab6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/719bab6821895a1509e99e2c263776f94f407ae6 "📝 Diff: 25 files, ++1000 | --97") — ✨ [feat] Enhance sidebar readability and button styles

- 🆕 Introduced a new sidebar label token coloring feature to improve readability by highlighting leading tokens in sidebar links.

- 🔧 Added utility functions to check if a sidebar link belongs to the runtime API category or a numbered rules subsection.

- 🎨 Implemented a new CSS class for hero action buttons, enhancing their visual appearance with gradients, shadows, and hover effects.

- 📝 Updated the index page to utilize the new button styles for primary and secondary actions.

- 🧪 Added tests to ensure the integrity of rule metadata, enforcing required metadata invariants including the new `ruleCatalogId`.

- 🔄 Refactored the `typed-rule.ts` file to centralize the injection of `ruleCatalogId` in the rule creation process.

- 🔍 Updated ESLint configuration to disable specific rules and enforce new package.json requirements.


- [`8bb7d79`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8bb7d79ac483fd2336235c0018d072d76a78e060 "📝 Diff: 22 files, ++491 | --36") — ✨ [feat] Implement telemetry for typed rule paths

- 🛠️ [fix] Add telemetry recording for prefilter evaluations in array-like expression checks

- 🛠️ [fix] Integrate telemetry for expensive type calls and fallback invocations in constrained type resolution

- 📝 [docs] Create typed service path inventory documentation

- 🔧 [build] Update rules to include telemetry file paths for better diagnostics

- 🧪 [test] Enhance tests to mock typed rule services and validate telemetry functionality


- [`36e010b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/36e010b654605c0c0bc1f0fd570bc5e3557dd272 "📝 Diff: 13 files, ++324 | --45") — ✨ [feat] Enhance rule documentation and argument validation

- 🆕 [feat] Add `createRuleDocsUrl` function for generating canonical rule documentation URLs

- 🔧 [build] Integrate `createRuleDocsUrl` into `createTypedRule` for consistent URL handling

- 🛠️ [fix] Implement `minimumArgumentCount` validation in `reportTsExtrasGlobalMemberCall`

- 📝 [docs] Add `parseMarkdownHeadingsAtLevel` for improved Markdown heading extraction in tests

- 🧪 [test] Extend tests for observer failure reporting in `safeTypeOperation`

- 🧪 [test] Update rule docs integrity tests to utilize new URL generation logic


- [`ef3e2b0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ef3e2b0f505bd52bf9043ce4f3061c5fa9d26343 "📝 Diff: 12 files, ++312 | --263") — ✨ [feat] Enhance rule reporting and configuration management

- 🛠️ Refactor rule reporting to enforce policy-aware handling

- 🔧 Introduce `reportWithOptionalFix` to manage autofix settings

- 🎨 Update README rules table synchronization in CI workflow

- 🔧 Add `sync:readme-rules-table` script for README consistency

- 📝 Expand typefest configuration metadata for better documentation

- 🧪 Add contract tests to ensure rule modules use shared reporting helpers


- [`dae1c27`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/dae1c27f6a81ce85d86580020ac57dc5ac73e58e "📝 Diff: 91 files, ++1071 | --27") — ✨ [feat] Enhance rule metadata with ruleId and ruleNumber


- 🆕 Introduced `ruleId` and `ruleNumber` properties in the `RuleDocsMetadata` type to uniquely identify rules.

- 🔍 Updated the `getRuleDocsContract` function to validate the format of `ruleId` as 'R###' and ensure `ruleNumber` is a positive integer.

- 📜 Modified the `createTypedRule` function to include `ruleId` and `ruleNumber` from the rule catalog entry, ensuring all rules have consistent metadata.

- 🧪 Added tests to verify the integrity of `ruleId` and `ruleNumber`, ensuring they are unique and correctly formatted across all rules.

- 📸 Updated snapshot tests to reflect the new metadata structure, including `ruleId` and `ruleNumber` for each rule.

- 🔄 Refactored existing tests to check for the presence and correctness of the new properties in the rule metadata.


- [`954d614`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/954d6144b034d79a7fd4cf013b1396ac2aea67ce "📝 Diff: 4 files, ++57 | --33") — ✨ [feat] Enhance logging functionality in scripts

- 📝 Update log-prompt.ps1 to include success and failure messages for prompt logging

- 📝 Add directory creation for logs if it doesn't exist

- 📝 Improve error handling with detailed output in log-prompt.ps1

- 📝 Modify remove-temp.ps1 to provide success/failure messages for temp directory cleanup

- 📝 Update remove-temp.sh to include success/failure messages and dry run feedback


- [`021b3e9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/021b3e936183cb36f498cb5904e2e60a1467170c "📝 Diff: 18 files, ++883 | --120") — ✨ [feat] Enhance TypeScript ESLint integration with new utilities and benchmarks

- 🆕 Add `getConstrainedTypeAtLocationWithFallback` utility to resolve TypeScript types with resilient fallbacks for partially mocked parser services.

- 🔧 Update `array-like-expression.ts` to utilize the new utility for type resolution, improving type checking for array-like expressions.

- 🔧 Refactor `type-checker-compat.ts` to use `isTypeReferenceType` from `@typescript-eslint/type-utils` for better type checking.

- 🔧 Modify `typescript-eslint-node-autofix.ts` to leverage the new type resolution utility, enhancing type safety in autofix scenarios.

- 🔧 Update rules in `prefer-ts-extras-safe-cast-to.ts`, `prefer-ts-extras-set-has.ts`, and `prefer-ts-extras-string-split.ts` to incorporate the new type resolution utility, improving type checks and suggestions.

- 🧪 Add tests for new type resolution scenarios, including handling of `any`, `unknown`, and `never` types, ensuring robust linting behavior.

- 🧪 Extend existing tests to cover cases for generic types constrained to `Set` and `String`, ensuring linting rules are applied correctly in these contexts.

- 🧪 Introduce tests for ignored type aliases, ensuring that linting suggestions are appropriately filtered for `any`, `never`, and `unknown` aliases.


- [`21e0d49`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/21e0d498a8ed4c996ad2844795716c2cfdd01593 "📝 Diff: 13 files, ++269 | --99") — ✨ [feat] Add type annotations to exported constants and introduce new tsconfig for Vitest type-checking

- 🛠️ [fix] Update `isPresentStressFixture`, `recommendedZeroMessageBaseline`, `safeCastToStressFixture`, `setHasStressFixture`, and `stringSplitStressFixture` with explicit type annotations

- 🛠️ [fix] Modify `createSafeTypeOperationCounter` to use default type for `Reason`

- 📝 [docs] Add type-level contract tests for public plugin exports and runtime entrypoint declarations

- 🔧 [build] Create new `tsconfig.vitest-typecheck.json` for improved type-checking with Vitest

- 🔧 [build] Update `vite.config.ts` to use the new tsconfig and include patterns for type-test discovery

- 🔧 [build] Refactor `vitest.stryker.config.ts` to define and export the Vitest configuration


- [`92bd316`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/92bd316192d7f16ca8cbcd9d13565b1751a503af "📝 Diff: 2 files, ++6 | --3") — ✨ [feat] Add sync:readme-rules-table script to package.json and optimize rule handling

- Introduced a new script command to synchronize the README rules table.

- Refactored rule name checks to utilize Set for improved performance in sync-readme-rules-table.mjs.


- [`b496d4e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b496d4e9e7b79d90c1ca42dd8de32437f25a398d "📝 Diff: 7 files, ++34 | --27") — ✨ [feat] Enhance typefest plugin with new functionality and documentation updates

- 📝 Add JSDoc comments for `getSafeLocalNameForImportedValue` to clarify its purpose and parameters

- 📝 Update `createSafeTypeOperationCounter` to include typed reason literals for better type inference

- 📝 Refine documentation for `typefestConfigNames` to ensure clarity on preset keys

- 📝 Introduce rule module definitions for `prefer-ts-extras-array-last` and `prefer-ts-extras-is-infinite`

- 🧪 Improve test mocks for `typed-rule.js` in `prefer-ts-extras-set-has` and `prefer-ts-extras-string-split` tests


- [`00fc246`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/00fc24679cd832ceed639e19414838bcad265851 "📝 Diff: 10 files, ++529 | --210") — ✨ [feat] Enhance ESLint Plugin with various improvements and optimizations

- 🛠️ [fix] Update memoization logic in `expression-boolean-memoizer.ts` to use `isDefined` for cache checks

- 🚜 [refactor] Simplify import handling in `import-insertion.ts` by removing unused functions and optimizing imports

- 🛠️ [fix] Improve type operation counter in `safe-type-operation.ts` by removing unnecessary parameters

- ✨ [feat] Add runtime plugin shape validation in `plugin-entry.test.ts` to ensure correct exports

- 🧪 [test] Enhance test coverage for `prefer-ts-extras-set-has` and `prefer-ts-extras-string-split` rules with mock utilities

- 📝 [docs] Update comments and documentation for clarity and consistency across multiple files


- [`a1e6f4b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a1e6f4ba9c120d62306db5a2868e1495f5a3a5df "📝 Diff: 21 files, ++555 | --168") — ✨ [feat] Enhance ESLint Plugin with New Rules and Performance Improvements

- 🆕 Add `prefer-ts-extras-set-has` rule to improve set membership checks.

- 🆕 Introduce `prefer-ts-extras-string-split` rule for string manipulation.

- 🔍 Implement benchmarks for new rules to ensure performance and correctness.

- 🛠️ Refactor existing rules to utilize `safeCastTo` for better type safety.

- 🛠️ Introduce `memoizeExpressionBooleanPredicate` for efficient boolean expression evaluation.

- 📦 Add stress test fixtures for `set-has` and `string-split` to validate performance.

- 📝 Update documentation to include pre-publish checklist for package validation.

- 🧪 Add unit tests for `memoizeExpressionBooleanPredicate` to ensure caching behavior.

- 🧪 Improve existing tests for `prefer-ts-extras-set-has` and `prefer-ts-extras-string-split` rules.


- [`be1768e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/be1768ecb0caa251823fc6c1092d59ce7d103df9 "📝 Diff: 4 files, ++71 | --55") — ✨ [feat] Update dependencies and enhance parser options handling

- 🔧 Update `@eslint/compat` to version `2.0.3` and `@eslint/config-helpers` to `0.5.3` in package.json and package-lock.json

- 🔧 Upgrade `eslint` to version `10.0.3` in package.json and package-lock.json

- 🛠️ Introduce `FlatParserOptions` type for normalized parser options in plugin.ts

- 🛠️ Implement `normalizeParserOptions` function to handle default parser options

- 🧪 Refactor parser options retrieval in `withTypefestPlugin` function to use `normalizeParserOptions`

- 📝 Update test cases in plugin-source-configs.test.ts for renamed config variables


- [`3e11f34`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3e11f3414a7deda15d7ca4ce1dc9b33175f9cea5 "📝 Diff: 32 files, ++652 | --317") — ✨ [feat] Introduce 'recommended-type-checked' configuration for ESLint plugin

- 🆕 Added 'recommended-type-checked' to typefestConfigNames for enhanced type checking.

- 🆕 Updated typefestConfigReferenceToName to include 'recommended-type-checked'.

- 🔄 Modified typefestConfigsDefinition to include a new preset for 'recommended-type-checked' with type-aware rules.

- 🔄 Adjusted rule configurations to set 'recommended' to false for several rules, now included in 'recommended-type-checked'.

- 🔄 Updated rule metadata to ensure compatibility with the new configuration.

- 🔄 Refactored rule definitions to ensure they align with the new type-checked recommendations.

- 🧪 Added tests to validate the new 'recommended-type-checked' configuration and its rules.

- 🧪 Updated existing tests to reflect changes in rule recommendations and configurations.


- [`4ab8742`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ab87429abba03528830985abc2645c04f1d56b8 "📝 Diff: 4 files, ++56 | --19") — ✨ [feat] Add deMorgan ESLint plugin and update dependencies

- 🆕 Import `eslint-plugin-de-morgan` for enhanced rule checks

- 📦 Update `@vitest/ui` and `eslint-plugin-de-morgan` versions in package files

- 🗑️ Remove obsolete `rule-docs-url.ts` file


- [`3e52bb0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3e52bb09e51b587351e8927e947ee7d34ca57c7f "📝 Diff: 98 files, ++585 | --920") — ✨ [feat] auto-enable parser services and centralize preset membership

✨ Add automatic `projectService` parserOptions for any preset that needs type checking and note the behavior in README/docs

- `recommended` preset now enables type-aware parsing by default

- manual configs can override but wiring is automatic when `requiresTypeChecking` is true

🚜 Extract rule‑to‑preset membership into a new static registry

- drop dynamic metadata scanning, normalization, and `docs.url` boilerplate in each rule

- validate membership arrays and dedupe rule lists during preset derivation

- simplify plugin startup and remove legacy syncing helpers

🧹 Simplify plugin exports and package metadata

- streamlined `plugin.mjs` to spread builtPlugin

- updated `package.json` exports structure and added Typescript peer dependency

- disable `require-meta-docs-url` rule in lint config

🧪 Revise tests accordingly

- import source plugin instead of built entry

- remove extensive runtime‑branch and metadata‑decoration tests

- add coverage for parserOptions.projectService and preset membership

- adjust docs‑integrity and config tests to reflect new behavior

📝 Update documentation

- clarify parser setup notes across README and docusaurus pages

- mention that presets include `projectService` and when to extend configs

These changes aim to reduce duplication, improve reliability of presets, and make parser setup seamless for users.


- [`f06b2d9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f06b2d997d21d0567915dbabcac36bbc49f50ae5 "📝 Diff: 16 files, ++711 | --255") — ✨ [feat] Enhance import insertion functionality and add failure handling


- 🛠️ [fix] Modify `createImportInsertionFix` to accept an optional `moduleSpecifierHint` parameter, allowing for more flexible import handling when the specifier cannot be inferred from the import text.

- 🔧 [build] Update calls to `createImportInsertionFix` in `imported-type-aliases.ts` and `imported-value-symbols.ts` to include the new `moduleSpecifierHint` parameter.

- 📝 [docs] Add detailed comments to `createImportInsertionFix` explaining the new parameter and its purpose.

- ⚡ [perf] Introduce a maximum recursive depth in `areEquivalentNodeValues` to prevent stack overflow errors during deep structural comparisons.

- 🧪 [test] Add tests for `createImportInsertionFix` to verify correct behavior when using `moduleSpecifierHint`.

- 🧪 [test] Implement tests for `areEquivalentNodeValues` to ensure it fails gracefully for deeply nested structures.

- 🧪 [test] Create comprehensive tests for the new failure handling in `safe-type-operation`, including local and global observer notifications.


- [`46a0938`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/46a0938464a8b70ba3aea1023157589517fc8b17 "📝 Diff: 21 files, ++1245 | --97") — ✨ [feat] Enhance TypeFest rules with new options and improvements

- 🛠️ [fix] Update `prefer-ts-extras-set-has` rule to support `unionBranchMatchingMode` options for better union handling

- 🛠️ [fix] Modify `prefer-type-fest-except` rule to include `enforceBuiltinOmit` option for controlling Omit enforcement

- 🛠️ [fix] Add `enforceLegacyAliases` and `enforcePromiseUnions` options to `prefer-type-fest-promisable` rule for more flexible alias handling

- 🛠️ [fix] Introduce `enforcedAliasNames` option in `prefer-type-fest-require-exactly-one` rule to customize alias enforcement

- 🛠️ [fix] Enhance `prefer-type-fest-tagged-brands` rule with options for ad-hoc brand intersections and legacy alias enforcement

- 🛠️ [fix] Add `enforcedAliasNames` option to `prefer-type-fest-tuple-of` rule for better alias management

- 🧪 [test] Update tests for `prefer-ts-extras-set-has` to validate new union matching options

- 🧪 [test] Enhance tests for `prefer-type-fest-except` to check behavior with `enforceBuiltinOmit` option

- 🧪 [test] Add tests for `prefer-type-fest-promisable` to ensure correct handling of legacy aliases and promise unions

- 🧪 [test] Update tests for `prefer-type-fest-require-exactly-one` to validate alias enforcement options

- 🧪 [test] Enhance tests for `prefer-type-fest-tagged-brands` to check new enforcement options

- 🧪 [test] Add tests for `prefer-type-fest-tuple-of` to validate alias enforcement behavior


- [`6a02cd3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6a02cd3f09977c68334884e0f51efc61de550d8d "📝 Diff: 48 files, ++1431 | --362") — ✨ [feat] Enhance TypeFest ESLint rules with ts-extras utilities

- 🔧 [refactor] Update `prefer-type-fest-literal-union.ts` to use `arrayFirst` and `arrayJoin` for improved literal union text generation.

- 🔧 [refactor] Modify `prefer-type-fest-primitive.ts` to utilize `setHas` for checking primitive keyword types.

- 🔧 [refactor] Revise `prefer-type-fest-promisable.ts` to incorporate `isDefined` and `arrayFirst` for better promise inner type extraction.

- 🔧 [fix] Correct parameter order in `keyIn` function in `prefer-ts-extras-key-in` tests for consistency with utility function.

- 🔧 [fix] Adjust `prefer-ts-extras-key-in` and `prefer-ts-extras-key-in.valid.ts` tests to reflect the correct usage of `keyIn`.

- 🔧 [test] Add new test cases for `arrayFirst`, `arrayIncludes`, and `arrayLast` to ensure proper handling of optional chains and return-like patterns.

- 🔧 [test] Implement logical guard checks in `prefer-ts-extras-array-includes` and `prefer-ts-extras-object-has-in` tests to validate suggestions for `arrayIncludes` and `objectHasIn`.

- 🔧 [test] Introduce logical guard and side-effect checks in `prefer-ts-extras-set-has` to ensure correct usage of `setHas`.

- 🔧 [test] Enhance `prefer-ts-extras-object-has-own` tests with logical guard checks to validate suggestions for `objectHasOwn`.


- [`042e729`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/042e729588719f03e61fab404d0cfdd6c8bfbe7f "📝 Diff: 1 file, ++37 | --0") — ✨ [feat] Add comprehensive audit prompt for repository quality and scalability

- Introduce a new prompt for deep-scan and refactor tasks aimed at enhancing stability, performance, and maintainability.

- Outline categories of issues to address, including fragility, consistency, architectural integrity, and production readiness.

- Provide a structured execution plan for searching, analyzing, refactoring, and validating code changes.


- [`647d69f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/647d69f6f8475e274d3e02e4e806df224f46da47 "📝 Diff: 32 files, ++949 | --104") — ✨ [feat] Introduce isDefined utility from ts-extras for nullish checks

- 🔧 Update nullish-comparison.ts to use isDefined for better readability and consistency in null checks.

- 🔧 Modify report-adapter.ts to replace undefined checks with isDefined for clarity.

- 🔧 Refactor scope-variable.ts to utilize isDefined for variable existence checks.

- ✨ Add typescript-eslint-node-autofix.ts to implement type-aware guardrails for suppressing risky autofixes on AST-node expressions.

- 🔧 Update plugin.ts to enhance parser options validation using isDefined.

- 🔧 Refactor multiple rules (prefer-ts-extras-is-defined, prefer-ts-extras-is-empty, prefer-ts-extras-is-equal-type, etc.) to leverage isDefined for improved null checks.

- 🧪 Add tests to ensure correct behavior of new isDefined checks in various rules.

- 🧪 Enhance test coverage for scope-variable to handle cyclic scope chains.

- 🧪 Introduce new test cases for inline AST node checks to validate autofix suppression logic.


- [`5879928`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5879928457bb7615018776d8c03f0ea213e0388f "📝 Diff: 10 files, ++412 | --279") — ✨ [feat] Implement import insertion coordination and enhance type import handling

- Introduced `ImportFixIntent` type for managing autofix and suggestion intents in import insertion.

- Added `shouldIncludeImportInsertionForReportFix` function to determine if import insertion should be included based on context.

- Refactored existing type import functions to utilize the new import insertion logic.

- Updated ESLint rule implementations to support suggestion intents for type imports.

- Enhanced unit tests to verify self-contained suggestion-intent fixes with import insertion.


- [`e5b98f0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e5b98f0f409c34817972c2da205e1c7e8eb5d936 "📝 Diff: 33 files, ++540 | --124") — ✨ [feat] Enhance import insertion handling and deduplication logic

- 🛠️ Introduced a caching mechanism for import-insertion claims using a WeakMap to prevent duplicate import fixes within the same lint pass.

- 🔧 Added functions to create deduplication keys for import insertions and to check if an import insertion has already been claimed for a given program node.

- ⚡ Updated the logic in various fixer functions to conditionally attach import insertion fixes based on deduplication checks.

- 📝 Modified parameters in several functions to include a new `dedupeImportInsertionFixes` flag, allowing for more granular control over import insertion behavior.

🧪 [test] Add tests for deduplication of import insertions

- ✅ Implemented tests to verify that multiple reports in the same lint pass correctly deduplicate import insertion fixes.

- ✅ Ensured that the tests cover scenarios where multiple references to the same import are made, confirming that only one import statement is added to the output.

🧹 [chore] Clean up test outputs

- 🧹 Removed redundant output arrays in test cases, simplifying the expected output to focus on the second pass output for clarity.


- [`f0826fe`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f0826fe3c507b5dcd2fc7a6d9c68c6cc318f9021 "📝 Diff: 6 files, ++1111 | --943") — ✨ [feat] Introduce runtime harness for prefer-ts-extras-assert-present tests

- 🆕 Added a new file `prefer-ts-extras-assert-present-runtime-harness.ts` containing utilities for testing the `prefer-ts-extras-assert-present` rule.

- 📜 Defined types for `ReplaceTextOnlyFixer` and `ReportDescriptor` to facilitate structured reporting in tests.

- 🔧 Implemented various functions to build guard text, throw text, and assert present guard code, enhancing test coverage for different scenarios.

- 🔍 Included parsing utilities to extract relevant AST nodes from code, improving the ability to analyze and test the rule's behavior.

🧪 [test] Refactor tests for prefer-ts-extras-assert-present rule

- 🔄 Updated `prefer-ts-extras-assert-present.test.ts` to utilize the new runtime harness for generating test cases.

- 🧩 Removed redundant inline code snippets and replaced them with structured test cases using the new harness functions.

- ✅ Ensured that invalid and valid test cases are clearly defined and utilize the new utilities for better maintainability and readability.


- [`25e991b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25e991bb37399af03b9e1d19e9abe9248095f24e "📝 Diff: 10 files, ++4527 | --347") — ✨ [feat] Enhance fixer parse-safety coverage tests

- 🛠️ Refactor `collectRuleIdsRequiringParseSafety` to utilize `typefestPlugin.rules` directly, removing the need for file system access.

- 🔍 Introduce `ruleRequiresParseSafetyCoverage` function to determine if a rule requires parse safety coverage based on its metadata.

- 📝 Add helper functions `pushRuleIdIfMarkerMissing` and `expectNoMissingRuleCoverage` for better test assertions regarding missing markers in rule tests.

- 📜 Update test logic to check for multiple markers in rule test files, including `parseForESLint`, `fc.assert`, `fc.property`, and `fast-check:`.

🧪 [test] Improve test coverage for `prefer-ts-extras-is-present`

- 🔧 Add new test cases to ensure that autofixes for loose null comparisons remain parseable and do not trigger second-pass binary reports.

- 🔄 Implement checks for aliased imports of `isPresent` to ensure they are preserved after autofixes.

- 🛠️ Introduce utility functions for parsing variable initializers and extracting call expressions to streamline test logic.


- [`1489fe5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1489fe589c1e44b4fdb47256ced3177967844d7c "📝 Diff: 5 files, ++569 | --185") — ✨ [feat] Enhance homepage with GitHub stats and improve layout

- 🆕 Add GitHubStats component to display live repository badges

- 🎨 Update index.jsx to include GitHubStats and improve hero section layout

- 🎨 Refactor hero badges to include descriptions and icons for better clarity

- 🎨 Revamp CSS styles for hero section, badges, and stats for improved aesthetics

- 🎨 Adjust layout and spacing in index.module.css for better responsiveness


- [`5ef9c15`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5ef9c157b9304ef69f1c4c3b9fa3ede02ddae86f "📝 Diff: 84 files, ++4412 | --790") — ✨ [feat] Enforce canonical docs & expand rule guides

📝 [docs] Flesh out every helper rule page with

- “Targeted pattern scope” sections, clearer example labels,
   package‑documentation blocks, migration notes and links.

- Added dozens of ts‑extras/type‑fest helper snippets and
   canonical headings so the guides are self‑contained.

✨ [feat] Introduce a remark‑lint plugin to verify and
 enforce the H1/H2 schema for rule docs

- wired into .remarkrc and used by test suite.

🧪 [test] Update docs‑integrity spec to assert heading order,
 package labels and redact legacy patterns.

- Add new cases for reversed `typeof undefined` to the
   prefer‑ts‑extras‑is‑defined‑filter rule.

🛠️ [fix] Improve prefer‑ts‑extras‑is‑defined‑filter logic to
 catch inverted typeof checks and add corresponding tests.

🧹 [chore] [dependency] Update various dev dependencies (stylelint‑a11y,
 stryker, npm‑check‑updates, eslint‑plugin‑package‑json, etc.)
 and tidy package.json.

The changes raise documentation quality, make future edits
deterministic and reduce manual review churn while
handling a subtle predicate bug.


- [`7349e48`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7349e48baf605c4457a8fe27765bb29cd998122a "📝 Diff: 4 files, ++168 | --0") — ✨ [feat] Enhance unicode and emoji support in autofixes

- 🛠️ Add tests for preserving unicode, emoji, and nerd-font glyphs in argument text

- 🛠️ Implement trimming of unicode spacing around argument text before replacement

- 🛠️ Introduce autofix for canonical undefined guard in unicode-rich source text

- 🛠️ Add autofix for canonical nullish guard in unicode-rich source text

- 🛠️ Support unicode and emoji in loose null equality checks


- [`6ae4136`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6ae41360a5a5e5c6bdc1fafd67aa9400b0472e2f "📝 Diff: 46 files, ++2779 | --122") — ✨ [feat] Add global identifier guards and expand test coverage

✨ Introduce robust global‑scope helpers and apply them across rules

- add `isGlobalIdentifierNamed`, `isGlobalUndefinedIdentifier` and
   `getVariableInScopeChain` to typed‑rule

- export new regex constants for test file detection and normalize
   lookup logic

- adapt rule implementations to accept context and use the new checks
   so shadowed globals (e.g. `undefined`, `Number`, `Object`, `Error`,
   etc.) no longer trigger false positives

🚜 Refactor internal helpers for clarity

- update `isReadonlyUtilityWrappedText` to trim and use constant name

- sprinkle `RuleContext` aliases and tidy imports for TSESLint/TSESTree

- simplify test‑file path routine with reusable patterns

🧪 Vastly expand automated tests

- add coverage for array‑like expressions, import insertion, imported
   type/value symbols, normalization, typed‑rule utilities, plugin
   entry runtime branches and new rule‑guard suite

- enrich rule specs with shadowing, malformed AST ranges, recursive
   types, non‑identifier guards, undocumented edge cases and more

- ensure every rule short‑circuits on test file paths

🛠️ Fix edge cases and add safe fallbacks

- handle invalid program ranges, disabled import fixes and detached
   nodes in import insertion

- guard against volatile/throwing fix getters in report descriptors

- protect listeners from synthetic or malformed nodes

💡 Improve detection logic and source assertions

- weave global checks into rule source tests

- reuse patterns for test directory segments and suffixes

🧹 Miscellaneous cleanup

- update typings, add `UnknownArray` imports, and minor style tweaks

These changes reduce false positives, harden rules against variable
shadowing, and significantly improve test reliability and coverage.


- [`6b530ec`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6b530ece7f5f101f9d599fdacd7f526321060d6c "📝 Diff: 49 files, ++2613 | --1896") — ✨ [feat] Add plugin settings to control autofixes and shared helper utilities

✨ [feat] introduce global configuration flags for disabling import‑insertion
and all autofixes, with documentation and examples in README
🔧 [build] update eslint/tsconfig/package dependencies for new helpers and
plugins
🚜 [refactor] extract common logic into new internal modules (ast‑node,
filter‑callback, import‑insertion, plugin‑settings, type‑reference‑node,
normalize‑expression‑text) to eliminate duplication across rules
🚜 [refactor] migrate dozens of rules to use the shared helpers, simplify
type/node comparisons, and remove ad‑hoc parent traversal code
✨ [feat] enhance `createTypedRule` to respect disable‑all‑autofixes setting
and guard type assignability checks against checker errors
🧪 [test] add exhaustive unit tests for new utilities and settings; extend
rule tests for autofix gating and import‑insertion behaviour, update source
assertions
📝 [docs] add “Global settings” section to README; reorder table of contents
🧹 [chore] clean up package.json, tsconfig files, eslint config entries and
remove unused plugins
📦 [style] adjust formatting and comments across configuration files

These changes let users suppress unwanted fixes, ensure safe import insertion,
and reduce code drift by centralizing shared functionality.


- [`fe9b0b3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fe9b0b3d4133560154045a82ec981920ba847574 "📝 Diff: 4 files, ++22 | --12") — ✨ [feat] Update test coverage scripts and enhance JUnit reporting

- 🔧 Modify coverage job to run tests with JUnit report generation

- 📄 Add verification for JUnit artifact existence

- 📤 Implement upload of test results to Codecov

- 🔍 Refactor assertions in prefer-ts-extras-is-empty, prefer-ts-extras-is-infinite, and prefer-ts-extras-not tests to use regex matching for improved accuracy


- [`8e7a5a8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8e7a5a8890c707d01bd8af285ff7bd3eb53a9698 "📝 Diff: 7 files, ++355 | --28") — ✨ [feat] Add ESLint 9 compatibility checks and update documentation

- 🛠️ [fix] Implement ESLint 9 compatibility smoke checks in a new script

- 🔧 [build] Update CI configuration to include ESLint 9 compatibility job

- 📝 [docs] Add compatibility section to README with supported ESLint versions

- 🔧 [build] Update package.json and package-lock.json for ESLint 9 compatibility

- 🚜 [refactor] Simplify regex patterns in typed-rule.ts for test file detection


- [`72b72c3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72b72c3d76e79c5c48b80909a5f26f5d304afd53 "📝 Diff: 15 files, ++1000 | --59") — ✨ [feat] Enhance ESLint Benchmarking and Add New Fixtures

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


- [`110d7dd`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/110d7dd4ad77096226ed311227c6e9dc54b8669a "📝 Diff: 75 files, ++75 | --0") — ✨ [feat] Update rules to require 'frozen: false' for typefest ESLint rules

- 📝 Added 'frozen: false' to the documentation of multiple TypeFest ESLint rules to indicate that these rules are not frozen and can be modified in the future.


- [`155c352`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/155c352f4fdb9a3ac38104a5b11b67ede23aefe4 "📝 Diff: 92 files, ++574 | --95") — ✨ [feat] Adds preset-tagged rule recommendations

✨ [feat] Expands rule documentation metadata to support preset-based recommendation tags, so guidance maps cleanly to multiple preset levels.

- Adds stricter metadata typing to improve consistency and catch invalid recommendation values earlier.

✨ [feat] Populates recommendation targets across the rule set, including core preset tiers and specialized preset groups.

- Improves downstream docs and config tooling by making recommendation intent explicit per rule.

🛠️ [fix] Tightens runtime validation for optional configuration inputs and nullable objects.

- Prevents empty or non-string values from being treated as valid and reduces fragile fallback behavior.

🚜 [refactor] Applies consistency cleanups in scripts and internal utilities, including style normalization and stricter readonly typing.
🧪 [test] Updates test helpers and mocks to align with stricter type expectations and explicit undefined checks.


- [`db8f3d9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db8f3d907e5b7dff0f98dc648045e96776573ba2 "📝 Diff: 76 files, ++5660 | --588") — ✨ [feat] Enhance TypeFest rule tests with detailed metadata and messages

- 🛠️ [fix] Refactor rule tests to include `ruleId`, `docsDescription`, and `messages` for better clarity and maintainability

- 📝 [docs] Update documentation strings to specify the purpose of each rule, emphasizing the preference for TypeFest types over aliases

- 🔧 [build] Add inline invalid and valid test cases for various TypeFest rules, ensuring comprehensive coverage

- ⚡ [perf] Optimize test structure by consolidating repetitive code patterns into reusable functions

- 🧪 [test] Introduce new test cases for edge scenarios, including whitespace formatting and generic type handling


- [`b7735ff`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b7735fff0c81b9b0e938e11e80f466824d347ee6 "📝 Diff: 1 file, ++90 | --0") — ✨ [feat] Enhance prefer-ts-extras-is-equal-type tests with metadata validation

- 📝 Add metadata loading function for `prefer-ts-extras-is-equal-type` rule

- ✅ Implement tests for stable report and suggestion messages

- 🔍 Include checks for default options, documentation, and suggestion messages

- 🔄 Add inline code examples for conflicting bindings and named imports


- [`64beea6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/64beea69975339a2924f307a80baf25d38e4c3c7 "📝 Diff: 3 files, ++105 | --44") — ✨ [feat] Enhance prefer-ts-extras-is-equal-type rule with ts-extras integration

- 🛠️ [fix] Add support for isEqualType function from ts-extras in ESLint rule

- 🔧 [build] Update test fixtures to include ts-extras imports and expected outputs

- 🧪 [test] Extend tests for aliased imports and ensure correct suggestions are provided


- [`df8b7be`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/df8b7be5d4074457f8d826c979149f8f861f7c73 "📝 Diff: 1 file, ++70 | --25") — ✨ [feat] Introduce local Typefest plugin dogfooding rules

- Added local Typefest plugin for manual dogfooding in ESLint configuration

- Defined explicit rules for Typefest utilities to enhance linting experience

- Updated section headers from "MARK" to "SECTION" for consistency across the config


- [`98e032b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/98e032b352efbe56862f5912aaab20d094319018 "📝 Diff: 2 files, ++38 | --13") — ✨ [feat] Implement script for temp directory cleanup

- 🛠️ Update hooks to use new PowerShell script for removing temp files

- 🛠️ Replace inline commands with calls to `.github/hooks/scripts/remove-temp.ps1`

- 🛠️ Add logging prompts for Linux and OSX in hooks

- 📝 Create `remove-temp.ps1` script to handle temp directory cleanup


- [`5c39e3d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5c39e3d5254fd081c9bd94a35933f21cd396893e "📝 Diff: 16 files, ++1108 | --59") — ✨ [feat] Update node configuration and dependencies

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


- [`7608574`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7608574ff670f60b3822c80f981c06e41e61e748 "📝 Diff: 4 files, ++111 | --20") — ✨ [feat] Add Stryker mutation testing configuration

- 🛠️ [config] Create .github/workflows/stryker.yml for scheduled and manual mutation testing

- 🔧 [build] Update package.json scripts for Stryker with concurrency and incremental file options

- 🔧 [build] Upgrade knip dependency to version 5.85.0

- 🛠️ [config] Enhance stryker.config.mjs with dashboard integration and improved concurrency settings

- 🛠️ [config] Adjust thresholds for mutation testing to improve quality metrics


- [`8afc040`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8afc040b174fd9de7074b1ef149837163aa8dddf "📝 Diff: 12 files, ++372 | --355") — ✨ [feat] Update ESLint configuration and dependencies

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


- [`bfc3d8d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bfc3d8d98165dd6866d558d059a2f6cd46369752 "📝 Diff: 65 files, ++2149 | --128") — ✨ [feat] Adds import-safe autofixes to lint rules

✨ [feat] Expands many helper/type preference diagnostics to deliver automatic fixes or targeted suggestions, reducing manual migrations while keeping behavior stable.

- Applies rewrites only when required imports exist and local scope checks confirm replacements are safe.

- Falls back to non-fixing reports or suggestions when safety cannot be proven.

- Tightens pattern matching for guard, nullish, and infinity checks so automatic rewrites only occur for semantically reliable forms.

🚜 [refactor] Introduces shared safe-replacement utilities for full type-node and custom-text substitutions, unifying fix generation across value and type rule paths.

🛠️ [fix] Preserves runtime boolean semantics in type-equality rewrites to prevent logical drift during suggested replacements.

🔧 [build] Updates lint-related dependency versions to align with newer parser/plugin compatibility.

🧪 [test] Adds broad invalid-case coverage with expected autofix and suggestion outputs to verify safety gates and rewrite correctness.


- [`25a1784`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25a1784bf26d1d3e9023f21ed2d2023e1d628e02 "📝 Diff: 31 files, ++850 | --9") — ✨ [feat] Adds safe autofixes for preference rules

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


- [`53bf4a6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/53bf4a66503c9a0274fea8af7b4cc1ee70c485ac "📝 Diff: 1 file, ++18 | --0") — ✨ [feat] Add authors configuration for blog

- Introduced authors.yml to define contributors for the blog

- Added Alice Example with image, title, and social links

- Added Nick2bad4u with image, title, permalink, and social links


- [`2359e0c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2359e0c73d136715759ac931708f1f494a23a447 "📝 Diff: 3 files, ++457 | --137") — ✨ [feat] Add favicon and enhance ESLint Config Inspector build script

- 🆕 Introduce favicon.ico to Docusaurus static assets for improved branding

- 🔧 Refactor build-eslint-inspector.mjs to streamline the build process

- 📦 Implement local testing version creation for easier development

- 🔄 Update asset path fixing logic for better subdirectory deployment

- 📄 Create index redirect page for improved SEO and usability


- [`a8ce34a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a8ce34af2b417febf44ca290ff535ba226c44a7f "📝 Diff: 10 files, ++368 | --1") — ✨ [feat] Enhance documentation and CI workflow

- 📝 [docs] Add CLI debugging and config inspection guide

- 📝 [docs] Create IDE integration guide for VS Code

- 📝 [docs] Introduce maintainer performance profiling documentation

- 📝 [docs] Provide examples for Node.js ESLint API usage

- 🔧 [build] Update deploy workflow to include full git history and build steps

- 🛠️ [fix] Add processors property to plugin contract for compatibility

- 🧪 [test] Implement rule metadata integrity tests to ensure proper documentation and schema

- 🎨 [style] Add logo images for improved branding


- [`2c6b5ef`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2c6b5ef32519e49d3162d67786ba71cce83daf01 "📝 Diff: 22 files, ++2781 | --137") — ✨ [feat] Integrate Stryker for mutation testing and enhance changelog generation

- 🔧 Add scripts for changelog generation, preview, and release notes using git-cliff

- 🛠️ Introduce Stryker configuration for mutation testing with TypeScript support

- 🧪 Add mutation testing commands to package.json for local and CI environments

- 🎨 Create a new vitest configuration file for Stryker to manage test execution

- 📝 Update tsconfig for ESLint to include new vitest configuration

- 🎨 Refactor type casting in imported-type-aliases test for improved readability

- 🎨 Adjust formatting in prefer-type-fest-tagged-brands test for consistency


- [`dcd7a6f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/dcd7a6ffeea657c615551a71e08bcf6e7afbc4df "📝 Diff: 49 files, ++1794 | --0") — ✨ [feat] Adds TypeFest typing preference rules

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


- [`d81f477`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d81f47784ebb46ade581d9f8f58fd073bd088608 "📝 Diff: 38 files, ++677 | --288") — ✨ [feat] Add modern docs UI enhancements

✨ [feat] Adds a client-side enhancement module to improve documentation site UX with scroll progress feedback, interactive hover behavior, fallback reveal animations, theme-toggle animation, dynamic accents, and desktop cursor lighting.

- Re-initializes effects after route transitions and cleans up listeners, observers, timers, and injected elements to keep SPA navigation stable and prevent stale handlers.

- Respects reduced-motion preferences and mobile breakpoints so enhancements stay accessible and lightweight across devices.

📝 [docs] Updates rule and test helper comments to use clearer, more consistent parameter and return wording.

- Improves readability and maintenance confidence without changing runtime or linting behavior.


- [`a73ec43`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a73ec4395f4b8c8977837a94ca16fbb998da3989 "📝 Diff: 20 files, ++570 | --109") — ✨ [feat] Enhance documentation structure and content for eslint-plugin-typefest

- 📝 [docs] Update docusaurus configuration to include new pages for rules overview and getting started

- 📝 [docs] Add new sidebar categories and links for presets and rules

- 📝 [docs] Create detailed markdown files for each preset: minimal, recommended, strict, all, type-fest types, and type-guards

- 📝 [docs] Introduce getting started and overview documentation to guide users

- 🎨 [style] Update CSS styles to accommodate new sidebar categories and enhance visual hierarchy

- 🧹 [chore] Add type definitions for custom CSS modules to improve TypeScript support

- 🔧 [build] Include typed-css-modules in package.json for CSS module type generation

- 🧹 [chore] Clean up package.json and package-lock.json to ensure proper dependency management


- [`413a896`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/413a896d53a2576852b4bc02e554478137e50477 "📝 Diff: 7 files, ++398 | --200") — ✨ [feat] Update Docusaurus homepage links and text

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


- [`17f1583`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/17f1583bc3a8ca11d587c827ac23d73895fd8c98 "📝 Diff: 35 files, ++38556 | --18552") — ✨ [feat] Enhance ESLint Plugin and Documentation


- 🛠️ [build] Add workspaces support for Docusaurus in package.json

- 📝 [docs] Introduce new scripts for documentation management:
  
- 📜 [scripts] Add build-eslint-inspector.mjs to build static ESLint Config Inspector
  
- 🔗 [scripts] Implement check-doc-links.mjs to verify documentation links
  
- 🧹 [scripts] Create lint-actionlint.mjs for linting GitHub Actions workflows
  
- ✅ [scripts] Add verify-eslint-inspector.mjs to validate ESLint Inspector integration

- 🛠️ [fix] Update tsconfig.eslint.json to include TypeScript files in docs directory

- 📝 [docs] Add tsdoc.json for TypeScript documentation configuration

- 🧹 [chore] Clean up and optimize existing scripts for better maintainability


- [`58d2f8d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/58d2f8dad12ea27c2417c65490cc542b18a0bcbd "📝 Diff: 6 files, ++507 | --544") — ✨ [feat] Enhance TypeFest ESLint Plugin with TypeScript Support

- 🆕 Add TypeScript parser as a dependency to improve compatibility with TypeScript files.

- 🔧 Update package.json to include TypeScript as a peer dependency, ensuring users have the correct version.

- 🛠️ Refactor plugin structure to utilize TypeScript types for improved type safety and clarity.

- 📜 Introduce detailed documentation for ESLint rules related to TypeFest and TypeScript utilities.

- 🔄 Restructure rule definitions to enhance maintainability and readability.

- 🧪 Update tests to validate new configurations and ensure all rules are correctly registered.

- 🔍 Ensure that experimental rules are properly categorized and excluded from stable configurations.

- 📝 Modify test cases to reflect changes in the plugin's configuration structure and rule registration.


- [`e731149`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e7311497fccdd2a094cde912c332f28b562a9adb "📝 Diff: 93 files, ++9071 | --125") — ✨ [feat] Add new ESLint rules for TypeScript extras

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


- [`2cb3cac`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2cb3cac8a808b97edc8e28aecad7c65bce1c22b0 "📝 Diff: 1 file, ++147 | --147") — ✨ [feat] Enhance ESLint configuration with new rules and plugins

- 🔧 Import `defineConfig` and `globalIgnores` from `@eslint/config-helpers`

- 🔧 Update ESLint rules to include `@eslint-community/eslint-comments` for better comment handling

- 🔧 Reintroduce TypeScript rules for `tsdoc` and `unused-imports`

- 🔧 Adjust various rule settings for improved linting accuracy and performance


- [`7702d74`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7702d7457c6a6f278e1a3ed786e9c46fa04dc6d0 "📝 Diff: 66 files, ++5117 | --940") — ✨ [feat] Introduce new rules for TypeScript extras


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


- [`52dea7a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/52dea7a2b170f4a07f7975d2c12f26773aa6fd5c "📝 Diff: 2 files, ++280 | --0") — ✨ [feat] Add .madgerc and .npmpackagejsonlintrc.json configuration files

- Introduced .madgerc for managing TypeScript file extensions and visualization settings

- Configured file extensions including ts, tsx, js, and others for better compatibility

- Set up detective options for TypeScript and TSX with specific configurations

- Added .npmpackagejsonlintrc.json for npm package JSON linting rules

- Defined strict rules for dependencies, devDependencies, and various package properties

- Included validation for author names and license types to ensure compliance


- [`570a740`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/570a7402f6ea936368bf1dd9364c107327357582 "📝 Diff: 7 files, ++45 | --42") — ✨ [feat] Enhance ESLint configuration and testing setup

- 🔧 [build] Update global ignores to include test fixtures

- 🔧 [build] Modify test file patterns for improved matching

- 🧪 [test] Refactor assertions to use toBeTruthy() for clarity

- 🧪 [test] Update test descriptions for better readability

- 🧪 [test] Ensure all exported configs register the plugin correctly

- 🧪 [test] Validate existence of documentation files for rules

- 🔧 [build] Adjust Vite configuration for parallel test execution


- [`fdaf37b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fdaf37b4f0b1e9185e9d6b82c8cc11befb8f32d8 "📝 Diff: 45 files, ++1327 | --142") — ✨ [feat] Adds canonical TypeFest alias lint rules

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


- [`f3d1dfc`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f3d1dfcb50479d3e1319af1e2f213eb5bb1692d1 "📝 Diff: 30 files, ++530 | --5") — ✨ [feat] Adds canonical TypeFest alias rules

✨ [feat] Adds typed lint coverage that flags imported legacy aliases for all-or-none and at-least-one key groups, and steers usage toward canonical TypeFest utilities to reduce semantic drift.

- ✨ [feat] Registers the new checks in exported rules and the minimal preset so enforcement is available by default.

- ✨ [feat] Aligns plugin rule availability by including a previously missing TypeFest preference rule in registration and presets.

📝 [docs] Adds focused rule guides that explain detection scope and why canonical naming improves consistency and migration clarity.

🧪 [test] Expands typed fixtures and rule tests for invalid alias imports, valid canonical usage, namespace import exceptions, and skip-on-test-file behavior.

- 🧪 [test] Improves existing typed fixtures with additional non-trigger patterns to better guard against false positives.


- [`38e7310`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/38e73102067f20b68f8508b95171511b178e3705 "📝 Diff: 98 files, ++3505 | --235") — ✨ [feat] Enforces canonical TypeFest aliases

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


- [`4715139`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4715139acd6f3d0f1d0e4a506eee30c84f5fea23 "📝 Diff: 11 files, ++407 | --0") — ✨ [feat] Implement prefer-type-fest-non-empty-tuple rule

- 📝 Add documentation for the prefer-type-fest-non-empty-tuple rule

- 🛠️ Create the prefer-type-fest-non-empty-tuple rule logic

- 🔧 Integrate the rule into the ESLint plugin

- 🧪 Add test cases for valid and invalid usages of NonEmptyTuple


- [`e2d0ec0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e2d0ec00a7925321774f10dcbf9c8237464584b3 "📝 Diff: 82 files, ++2624 | --77") — ✨ [feat] Enhance TypeScript Extras with New Array and Assertion Utilities

- 🆕 [feat] Introduce `arrayFirst` and `arrayLast` utilities with valid and invalid test cases

- 🆕 [feat] Add `assertDefined`, `assertError`, and `assertPresent` utilities with corresponding test cases

- 🆕 [feat] Implement `isEmpty` and `isInfinite` checks with tests to validate their functionality

- 🆕 [feat] Create `objectHasIn` utility for object property checks with tests

- 🆕 [feat] Expand TypeFest integration with `Arrayable`, `JsonArray`, `JsonObject`, and `JsonPrimitive` types

- 🆕 [feat] Add tests for TypeFest utilities to ensure correct usage and validation

- 🧪 [test] Add comprehensive tests for all new features to ensure expected behavior and error handling


- [`a324362`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a3243623759d4219255e750c02b216e6bb5f224d "📝 Diff: 2 files, ++261 | --0") — ✨ [feat] Update package.json and package-lock.json with new remark packages

- Add "remark" and "remark-cli" for enhanced markdown processing

- Include "remark-lint" for linting markdown files


- [`55a2687`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/55a26876bf6c5a78873fe449590b9fde596ec41d "📝 Diff: 2 files, ++425 | --0") — ✨ [feat] Update package.json and package-lock.json with new remark-lint rules

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


- [`c7085da`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c7085daeaa35a5fc9a980e327d28113b35a8dcee "📝 Diff: 70 files, ++1055 | --476") — ✨ [feat] Enhance TypeScript rule testing and add new type utilities


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


- [`bd59068`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bd5906889751671df9f18db89fa218f2cbcd763c "📝 Diff: 4 files, ++5610 | --339") — ✨ [feat] Update dependencies and add Vite configuration for linting


- 🔧 [build] Upgrade various ESLint plugins and configurations in `package.json` to enhance linting capabilities
  
- Added new plugins: `@eslint/config-helpers`, `@eslint/css`, `@eslint/json`, `@eslint/markdown`, `@html-eslint/eslint-plugin`, `@html-eslint/parser`, `@vitest/eslint-plugin`, and many others for improved code quality and support for various file types
  
- Updated existing plugins to their latest versions for better performance and features
  
- Included `vite` and `vite-tsconfig-paths` for better integration with TypeScript and Vite tooling


- 🎨 [style] Introduce `vite.config.ts` for Vitest configuration
  
- Configured Vitest to run linting and tooling tests with detailed coverage settings
  
- Set up environment variables and paths for better project structure and maintainability
  
- Defined test settings including coverage thresholds, file exclusions, and test timeouts to ensure robust testing practices
  
- Implemented caching and optimization settings for improved performance during test runs


- [`a7c1162`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a7c1162a1e8a86c7543310ef491fc7a4cbcaf1a9 "📝 Diff: 4 files, ++7353 | --1439") — ✨ [feat] Update package.json with new dependencies for enhanced linting and markdown processing

- 🆕 Added "@double-great/remark-lint-alt-text" for alt text linting in markdown

- 🆕 Included "@typescript-eslint/eslint-plugin" and "@typescript-eslint/parser" for improved TypeScript linting

- 🆕 Introduced "actionlint" for GitHub Actions linting

- 🆕 Added various "remark-lint" plugins to enforce markdown style and consistency

- 🆕 Included "remark-math" and "rehype-katex" for better math rendering in markdown

- 🆕 Added "remark-validate-links" to ensure all links in markdown are valid

- 🆕 Included "remark-toc" for automatic table of contents generation in markdown files

- 🆕 Added "remark-preset-lint-recommended" and other presets for consistent linting rules


- [`4c55f69`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4c55f695e4a6214348d084e0756ea4af6fac83f1 "📝 Diff: 58 files, ++5550 | --249") — ✨ [feat] Enhance ESLint Plugin with New Rules and TypeScript Configurations

- 🆕 [feat] Introduce `prefer-ts-extras-array-concat` rule to enforce usage of `arrayConcat` from `ts-extras` for better typing.

- 🆕 [feat] Add `prefer-ts-extras-is-finite`, `prefer-ts-extras-is-integer`, and `prefer-ts-extras-is-safe-integer` rules to promote consistent predicate helper usage over native `Number` methods.

- 🔧 [build] Update `package.json` to include new linting scripts for actions and prettier, and adjust TypeScript configurations for better build management.

- 🔧 [build] Modify `typecheck` script to include additional TypeScript configurations for comprehensive type checking.

- 🔧 [build] Update `tsconfig.json` and related configurations to improve project structure and build performance.

- 🧪 [test] Add tests for new rules to ensure correct functionality and adherence to coding standards.

- 🧪 [test] Create valid and invalid fixture files for each new rule to facilitate thorough testing.


- [`e7bdca6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e7bdca6ae1d25f5fcd0ada0b2234d1cf86f5cf03 "📝 Diff: 67 files, ++2144 | --1") — Add prefer-ts-extras rules for array and object utilities


- [`6aa5b95`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6aa5b955e06d923a1e6754e3edb7fa378d095f0c "📝 Diff: 310 files, ++5144 | --15565") — Add prefer-type-fest-value-of rule to enforce ValueOf<T> usage



### 🛠️ Bug Fixes

- [`3786790`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3786790627efa5dda227e8ae1d4b23d4efed40b3 "📝 Diff: 51 files, ++1194 | --862") — 🛠️ [fix] Update module imports to use dynamic import syntax


- Refactor multiple test files to replace static module imports with dynamic imports using `import()`.

- This change enhances the flexibility of module loading and may improve performance in certain scenarios.

- The following files were updated:
  
- `prefer-ts-extras-set-has.test.ts`
  
- `prefer-ts-extras-string-split.test.ts`
  
- `prefer-type-fest-abstract-constructor.test.ts`
  
- `prefer-type-fest-arrayable.test.ts`
  
- `prefer-type-fest-async-return-type.test.ts`
  
- `prefer-type-fest-constructor.test.ts`
  
- `prefer-type-fest-except.test.ts`
  
- `prefer-type-fest-if.test.ts`
  
- `prefer-type-fest-iterable-element.test.ts`
  
- `prefer-type-fest-json-array.test.ts`
  
- `prefer-type-fest-json-object.test.ts`
  
- `prefer-type-fest-json-primitive.test.ts`
  
- `prefer-type-fest-json-value.test.ts`
  
- `prefer-type-fest-literal-union.test.ts`
  
- `prefer-type-fest-non-empty-tuple.test.ts`
  
- `prefer-type-fest-promisable.test.ts`
  
- `prefer-type-fest-simplify.test.ts`
  
- `prefer-type-fest-tuple-of.test.ts`
  
- `prefer-type-fest-unknown-array.test.ts`
  
- `prefer-type-fest-unknown-map.test.ts`
  
- `prefer-type-fest-unknown-set.test.ts`
  
- `prefer-type-fest-value-of.test.ts`
  
- `prefer-type-fest-writable-deep.test.ts`


- [`a1e119d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a1e119de70162a3600b02853761cd8a30df50fea "📝 Diff: 2 files, ++19 | --17") — 🛠️ [fix] Replace appendPendingValues function with inline logic for better clarity

- 🔄 Updated multiple instances in typescript-eslint-node-autofix.ts to directly push values into arrays

- 🧹 Removed the unused appendPendingValues function to streamline the code
🛠️ [fix] Enhance type safety in prefer-ts-extras-safe-cast-to rule

- 🔄 Utilized isDefined from ts-extras for improved null checks on expressionTsNode


- [`be7cea7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/be7cea7dfc090bfcd00cbedbd70ac16aad978948 "📝 Diff: 44 files, ++1032 | --83") — 🛠️ [fix] Improve import-aware fixes and type handling


- 🔧 Update `createImportAwareFixes` to handle replacement fixes for both autofix and suggestion intents.

- 🛠️ Adjust `resolveImportInsertionDecisionForReportFix` to block duplicate autofix replacements after the first claim.

- 🔧 Enhance `createImportInsertionFix` to accept empty-string from-clause module specifiers, ensuring correct positioning before relative imports.

- 🛠️ Modify `createSafeTypeReferenceReplacementFixGroup` to ensure correct text edits and type references.

- 🛠️ Add null checks for method receivers that are `super` in `createMethodToFunctionCallFix` and `createMemberToFunctionCallFix`.

- 🔧 Update tests to reflect changes in expected text edits and fix handling.

- 🧪 Add new tests for member call matching helpers and text character utilities, ensuring comprehensive coverage for identifier checks and whitespace handling.

- 🧪 Introduce tests for TypeScript ESLint node expression skip-checker fallbacks, validating behavior for qualified type references.

- 🧪 Refactor existing tests to accommodate multiple output scenarios for various rules, ensuring robust validation of fixture outputs.


- [`17b8f52`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/17b8f5264091ca2d6089637834b7fa04e007acb8 "📝 Diff: 11 files, ++100 | --47") — 🛠️ [fix] Update prefer-type-fest-json-value rule documentation and implementation

- Clarify the requirement for TypeFest `JsonObject` in serialization-bound string-keyed record contracts.

- Adjust reporting to use `JsonObject` instead of `JsonValue` for boundary payload aliases.

- Enhance message clarity for suggested replacements in the rule's documentation.

🧪 [test] Improve tests for prefer-type-fest-json-value rule

- Update test descriptions to reflect changes in the rule's requirements.

- Ensure tests align with the new expectations for `JsonObject` usage.

🛠️ [fix] Correct ESLint configuration for global ignores

- Fix path for ignored test fixtures to ensure proper linting behavior.

🚜 [refactor] Simplify array-like expression checker logic

- Replace manual parent node handling with a utility function for better readability.

🚜 [refactor] Streamline import analysis return value

- Return local names directly instead of creating a new Map for efficiency.

🚜 [refactor] Optimize import-aware fixes logic

- Consolidate replacement fix creation to reduce redundancy.

🧪 [test] Add coverage for import insertion behavior

- Introduce tests for handling empty-string side-effect module specifiers.

🧪 [test] Update prefer-type-fest-json-value tests for new messaging

- Ensure test messages reflect the updated rule documentation.


- [`892f32c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/892f32c53b0175d189eded52181d4fef5c806920 "📝 Diff: 22 files, ++339 | --100") — 🛠️ [fix] Update ESLint rule configurations and improve import handling

- 🔧 Modify "node-dependencies/no-deprecated" rule to allow "prettier-plugin-packagejson" for better compatibility

- 🚜 Refactor import insertion logic to handle named imports and relative imports more effectively

- 📝 Add utility functions for parsing quoted strings and identifying import declarations

- 🧪 Enhance tests for import insertion to validate new behavior with named imports


- [`9375d77`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9375d778d50fb7feb5362597759820de5e1b40a3 "📝 Diff: 54 files, ++475 | --773") — 🛠️ [fix] Refactor ESLint rule implementations for improved reporting and fixes

- 🔧 Update `prefer-type-fest-value-of.ts` to use `reportWithOptionalFix` for cleaner reporting

- 🔧 Update `prefer-type-fest-writable.ts` to utilize `reportWithOptionalFix` for consistent reporting

- 📝 Modify documentation tests in `docs-integrity.test.ts` to use async file reading for better performance

- 🛠️ Refactor file reading in `fixer-parse-safety-coverage.test.ts` to use async methods

- 🧹 Clean up unnecessary file reading in multiple tests, including `prefer-ts-extras-as-writable.test.ts`, `prefer-ts-extras-assert-defined.test.ts`, and others

- 🧪 Update tests to focus on runtime safety assertions instead of source assertions for various `prefer-ts-extras` rules

- 🧪 Remove redundant source assertions from tests for `prefer-ts-extras-*` rules to streamline test coverage

- 🧪 Ensure all tests maintain focus on runtime behavior and safety checks


- [`415b2fe`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/415b2fe2a972bdff91f115d610ee5c9b9761115a "📝 Diff: 89 files, ++1721 | --1436") — 🛠️ [fix] Update source assertions for TypeScript extras rules


- 🔧 Refactor `prefer-ts-extras-as-writable` test to check for new structure and metadata.

- 🔧 Refactor `prefer-ts-extras-assert-defined` test to ensure stability in matcher and report/fix wiring.

- 🔧 Refactor `prefer-ts-extras-assert-present` test to maintain consistency in matcher and report/fix wiring.

- 🔧 Refactor `prefer-ts-extras-is-defined-filter` test to include optional-chain filter calls.

- 🔧 Refactor `prefer-ts-extras-is-empty` test to ensure stable matcher and fix wiring.

- 🔧 Refactor `prefer-ts-extras-is-equal-type` test to check for new matcher and suggestion wiring.

- 🔧 Refactor `prefer-ts-extras-is-finite` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-is-infinite` test to ensure stable matcher and fix wiring.

- 🔧 Refactor `prefer-ts-extras-is-integer` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-is-present-filter` test to include optional-chain filter calls.

- 🔧 Refactor `prefer-ts-extras-is-safe-integer` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-not` test to ensure stable matcher and fix wiring.

- 🔧 Refactor `prefer-ts-extras-object-has-in` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-object-has-own` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-string-split` test to ensure stable analysis and fix wiring.

- 🔧 Refactor `prefer-type-fest-async-return-type` test to ensure stability in source assertions.

- 🔧 Refactor `prefer-type-fest-json-primitive` test to ensure stable matcher and fixer wiring.

- 🔧 Refactor `prefer-type-fest-literal-union` test to ensure stable matcher and fixer wiring.

- 🔧 Refactor `prefer-type-fest-promisable` test to ensure stability in source assertions.


- [`42e9cfd`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/42e9cfdda964ac07b32d4f31a313d7e6b3e5b65e "📝 Diff: 74 files, ++1794 | --728") — 🛠️ [fix] Remove unnecessary isTestFilePath mocks from test files

- 🧪 Cleaned up multiple test files by removing the isTestFilePath mock function, which was consistently set to return false.

- 📂 Affected files include:
  
- prefer-ts-extras-array-find-last.test.ts
  
- prefer-ts-extras-array-find.test.ts
  
- prefer-ts-extras-array-first.test.ts
  
- prefer-ts-extras-array-includes.test.ts
  
- prefer-ts-extras-array-join.test.ts
  
- prefer-ts-extras-array-last.test.ts
  
- prefer-ts-extras-as-writable.test.ts
  
- prefer-ts-extras-assert-defined.test.ts
  
- prefer-ts-extras-assert-error.test.ts
  
- prefer-ts-extras-assert-present.test.ts
  
- prefer-ts-extras-is-defined-filter.test.ts
  
- prefer-ts-extras-is-defined.test.ts
  
- prefer-ts-extras-is-empty.test.ts
  
- prefer-ts-extras-is-infinite.test.ts
  
- prefer-ts-extras-is-present-filter.test.ts
  
- prefer-ts-extras-is-present.test.ts
  
- prefer-ts-extras-key-in.test.ts
  
- prefer-ts-extras-object-entries.test.ts
  
- prefer-ts-extras-object-from-entries.test.ts
  
- prefer-ts-extras-object-has-own.test.ts
  
- prefer-ts-extras-object-keys.test.ts
  
- prefer-ts-extras-object-values.test.ts
  
- prefer-ts-extras-safe-cast-to.test.ts
  
- prefer-ts-extras-set-has.test.ts
  
- prefer-ts-extras-string-split.test.ts
  
- prefer-type-fest-abstract-constructor.test.ts
  
- prefer-type-fest-arrayable.test.ts
  
- prefer-type-fest-async-return-type.test.ts
  
- prefer-type-fest-conditional-pick.test.ts
  
- prefer-type-fest-constructor.test.ts
  
- prefer-type-fest-except.test.ts
  
- prefer-type-fest-if.test.ts
  
- prefer-type-fest-iterable-element.test.ts
  
- prefer-type-fest-json-array.test.ts
  
- prefer-type-fest-json-object.test.ts
  
- prefer-type-fest-json-primitive.test.ts
  
- prefer-type-fest-json-value.test.ts
  
- prefer-type-fest-literal-union.test.ts
  
- prefer-type-fest-non-empty-tuple.test.ts
  
- prefer-type-fest-promisable.test.ts
  
- prefer-type-fest-simplify.test.ts
  
- prefer-type-fest-tuple-of.test.ts
  
- prefer-type-fest-unknown-array.test.ts
  
- prefer-type-fest-unknown-map.test.ts
  
- prefer-type-fest-unknown-set.test.ts
  
- prefer-type-fest-value-of.test.ts
  
- prefer-type-fest-writable-deep.test.ts
  
- prefer-type-fest-writable.test.ts


- [`78c8608`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/78c86080b31c14fffe92eb341db9d32286566361 "📝 Diff: 28 files, ++4132 | --3611") — 🛠️ [fix] Refactor and optimize test cases for prefer-ts-extras and prefer-type-fest rules


- 🔧 Update `prefer-ts-extras-set-has.test.ts` to import runtime harness utilities and remove redundant code.

- 🧹 Clean up `prefer-ts-extras-string-split.test.ts` by consolidating fixture definitions and removing unused variables.

- 🚜 Refactor `prefer-type-fest-arrayable.test.ts` to streamline test cases and remove unnecessary inline definitions.

- 🎨 Enhance `prefer-type-fest-literal-union.test.ts` by organizing and optimizing test case definitions, removing redundant code.

- 🧪 Improve `prefer-type-fest-promisable.test.ts` by consolidating valid test cases and removing commented-out code for clarity.


- [`ad971e5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ad971e53cdc971a24de6338a3384389187ba37ea "📝 Diff: 13 files, ++2975 | --389") — 🛠️ [fix] Refactor prefer-ts-extras-set-has and prefer-type-fest-promisable tests


- 🔧 [test] Import test cases from prefer-ts-extras-set-has-cases for better organization

- 🧹 [chore] Remove redundant inline code definitions in prefer-ts-extras-set-has.test.ts

- 🔧 [test] Import test cases from prefer-type-fest-promisable-cases to streamline test setup

- 🧹 [chore] Clean up inline code definitions in prefer-type-fest-promisable.test.ts

- ⚡ [refactor] Enhance readability and maintainability by consolidating test case definitions


- [`72e9b70`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72e9b70f084fd2f63509b01eb0e596d2844bc338 "📝 Diff: 4 files, ++807 | --68") — 🛠️ [fix] Enhance type handling and error reporting in ESLint synchronization script

- 📜 Add detailed JSDoc comments for better documentation and understanding

- 🔍 Implement error handling in `readPackageJson` and `writeFile` functions

- 🔄 Refactor `resolvePeerFloorRange` to ensure compatibility with minimum ESLint version

- 🧪 Introduce type checks for `devDependencies` and `peerDependencies` in the main function

- 📝 Update synchronization process to log errors and exit with a non-zero code on failure

🧪 [test] Improve test coverage for `prefer-type-fest-if` and `prefer-type-fest-json-array`

- 🔍 Add fast-check properties to validate replacement logic for type aliases

- 📜 Enhance parsing functions to ensure generated code remains valid

- 🧪 Introduce assertions to verify that replacements are correctly applied in tests

🧪 [test] Expand tests for `prefer-type-fest-simplify` to ensure type alias replacements

- 🔄 Implement fast-check tests to validate simplification logic

- 📜 Ensure that all type references are correctly parsed and replaced in test cases


- [`24f4d30`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/24f4d30b7003eda3f09e41895c3ee54cf34afaae "📝 Diff: 17 files, ++2886 | --46") — 🛠️ [fix] Refactor type-fest rule tests for improved fixture handling and parsing


- 🔧 Update `prefer-type-fest-abstract-constructor.test.ts` to use a dynamic fixture creation function for generating fixable output code, enhancing maintainability and readability.

- 🔧 Introduce `createFixtureFixableOutputCode` function to replace constructor signatures in `prefer-type-fest-constructor.test.ts`, ensuring consistent fixture generation.

- 🔧 Implement `replaceOrThrow` utility function in `prefer-type-fest-async-return-type.test.ts` and other tests to streamline the replacement process and improve error handling.

- 🔧 Enhance test coverage for `prefer-type-fest-literal-union.test.ts` by applying the new replacement strategy for fixture outputs.

- 🔧 Refactor `prefer-type-fest-tuple-of.test.ts` to include a more robust fixture generation method, ensuring that the tests remain valid and easy to update.

- 🔧 Update `prefer-type-fest-value-of.test.ts` to include comprehensive parsing and validation for indexed access types, improving the accuracy of the tests.

- 🧪 Add fast-check properties to various tests to ensure that generated code remains parseable and adheres to expected structures, enhancing test reliability.


- [`99f276b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/99f276bf7e98e8077b80cd77c51cc5b122eec66d "📝 Diff: 3 files, ++55 | --42") — 🛠️ [fix] Update dependencies in package.json and package-lock.json

- 🔧 Upgrade @double-great/stylelint-a11y to version 3.4.5

- 🔧 Upgrade @eslint-community/eslint-plugin-eslint-comments to version 4.7.0

- 🔧 Upgrade @types/node to version 25.3.3

- 🔧 Upgrade cognitive-complexity-ts to version 0.8.1

- 🔧 Upgrade globals to version 17.4.0

- 🔧 Upgrade publint to version 0.3.18

- 🔧 Upgrade typedoc-plugin-dt-links to version 2.0.44

- 🔧 Upgrade @easyops-cn/docusaurus-search-local to version 0.55.1


- [`4894a46`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4894a469b4d5d1f1305737470312152b63a27cab "📝 Diff: 67 files, ++613 | --285") — 🛠️ [fix] Update TypeFest rules and documentation for improved clarity and accuracy

- 📝 [docs] Refine descriptions in `prefer-type-fest-json-primitive.md` to clarify targeted patterns and reporting criteria

- 📝 [docs] Enhance `prefer-type-fest-json-value.md` documentation for better understanding of JSON-compatible value representation

- 📝 [docs] Adjust `prefer-type-fest-promisable.md` to specify strict matching criteria for Promise/base unions

- 📝 [docs] Clarify `prefer-type-fest-set-non-nullable.md` to focus on imported legacy aliases for non-nullable types

- 📝 [docs] Update `prefer-type-fest-set-optional.md` to emphasize imported legacy aliases for optional types

- 📝 [docs] Modify `prefer-type-fest-set-readonly.md` to specify imported legacy aliases for readonly types

- 📝 [docs] Revise `prefer-type-fest-set-required.md` to clarify the focus on imported legacy aliases for required types

- 📝 [docs] Improve `prefer-type-fest-simplify.md` to specify matching for imported `Prettify` and `Expand` aliases

- 📝 [docs] Update `prefer-type-fest-unknown-array.md` to clarify targeting of unknown-array spellings

- 📝 [docs] Refine `prefer-type-fest-unknown-map.md` to specify targeting of unknown-map spellings

- 📝 [docs] Enhance `prefer-type-fest-unknown-record.md` to clarify targeting of unknown-record spellings

- 📝 [docs] Update `prefer-type-fest-unknown-set.md` to specify targeting of unknown-set spellings

- 📝 [docs] Revise `prefer-type-fest-value-of.md` to clarify matching for indexed-access type shapes

- 🔧 [build] Adjust peer dependencies in `package.json` and `package-lock.json` to support ESLint versions 9.0.0 and 10.0.2

- 🧪 [test] Refactor fast-check configurations in tests to use a unified default run count

- 🧪 [test] Update multiple test files to replace specific run counts with the new default configuration


- [`48155f0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/48155f0b4a6693d72f38a2aa6016621b07a99900 "📝 Diff: 75 files, ++7480 | --319") — 🛠️ [fix] Improve type handling and testing for TypeScript rules


- 🔧 [build] Update test files to include necessary imports for TypeScript parsing

- 🧪 [test] Enhance tests for prefer-type-fest-arrayable with fast-check integration
  
- Introduce new utilities for generating arrayable types and unions
  
- Implement comprehensive tests to ensure correct reporting and fixing of arrayable types

- 🧪 [test] Refactor prefer-type-fest-async-return-type tests for clarity and consistency

- 🧪 [test] Adjust prefer-type-fest-json-primitive tests to correct type declaration handling

- 🧪 [test] Expand prefer-type-fest-literal-union tests with fast-check for better coverage
  
- Add generators for various literal union cases and cross-family unions
  
- Ensure that generated unions are correctly reported and parsed

- 🧪 [test] Update prefer-type-fest-promisable tests to validate autofix behavior
  
- Ensure that the autofix preserves parseability and correctly inserts necessary imports


- [`95fdc29`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/95fdc29c3b3754079161967f6f28f630e8cb6fcf "📝 Diff: 80 files, ++1366 | --520") — 🛠️ [fix] Improve type normalization and documentation across rules

- 🔧 Update `prefer-type-fest-promisable.ts` to enhance type extraction and add documentation for `getPromiseInnerType`.

- 🔧 Refactor `prefer-type-fest-tagged-brands.ts` to improve brand detection logic and document the purpose of helper functions.

- 🔧 Enhance `prefer-type-fest-tuple-of.ts` with better alias normalization and detailed comments for tuple replacement logic.

- 🔧 Improve `prefer-type-fest-unknown-array.ts` to clarify checks for `ReadonlyArray` and document type reference candidates.

- 🔧 Update `prefer-type-fest-unknown-map.ts` to refine checks for `ReadonlyMap` and document type argument validation.

- 🔧 Enhance `prefer-type-fest-unknown-record.ts` to clarify detection of `Record<string, unknown>` references.

- 🔧 Improve `prefer-type-fest-unknown-set.ts` to clarify checks for `ReadonlySet` and document type reference candidates.

- 🔧 Update `prefer-type-fest-writable.ts` to enhance checks for writable mapped types and document the logic.

- 📝 Add detailed comments and documentation across various test files to improve clarity and maintainability.

- 📝 Update test files to include more descriptive comments for test setup and assertions.


- [`338f913`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/338f9131139d00ce9c875eed219d2ce38e98be42 "📝 Diff: 18 files, ++641 | --143") — 🛠️ [fix] Improve import insertion and type handling


- 🛠️ Update `isArrayLikeType` to provide clearer documentation on its purpose and parameters.

- 🛠️ Refactor `isWriteTargetMemberExpression` to enhance readability and ensure it correctly identifies member expressions as write targets.

- 🛠️ Modify `createImportInsertionFix` to handle cases where the program node's range is undefined, ensuring robust import insertion.

- 🛠️ Introduce `isImportDeclarationFromSource` utility to streamline checks for import declarations against expected module sources.

- 🛠️ Enhance `createSafeValueArgumentFunctionCallFix` and related functions to wrap sequence expressions, preserving single-argument semantics.

- 🛠️ Improve `areEquivalentNodeValues` to handle cyclic references and prevent infinite loops during comparison.

- 📝 Update documentation in `README.md` to clarify the behavior of autofixes when certain settings are enabled.

- 🧪 Add tests for new functionality in `import-insertion` and `imported-type-aliases`, ensuring correct behavior under various conditions.

- 🧪 Extend tests in `typed-rule` to verify that fix getters do not crash when they throw errors, enhancing stability.

- 🧪 Implement tests for settings caching to ensure that different program contexts do not share settings, maintaining isolation.


- [`3d31bbc`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3d31bbc7a6e3e09429df3cc42c134218158c9ee2 "📝 Diff: 1 file, ++0 | --3") — 🛠️ [fix] Remove unused prettier-plugin-jsdoc-type from configuration

- Eliminated "prettier-plugin-jsdoc-type" from the plugins list in multiple sections of the .prettierrc file


- [`c606fd2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c606fd2b73ca23cfb48854fc0170aae43635d1c6 "📝 Diff: 127 files, ++2654 | --2400") — 🛠️ [fix] Update messages for TypeFest rule tests to improve clarity

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


- [`7639e4d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7639e4d3d04fd40ec505141ee4c9d5a6fce34388 "📝 Diff: 90 files, ++2361 | --582") — 🛠️ [fix] Adds missing-import insertion to autofixes

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


- [`721700d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/721700d4f551e3b9b70675dc68c11b9ccd4f0c72 "📝 Diff: 2 files, ++212 | --95") — 🛠️ [fix] Improve documentation link checker functionality

- Enhance `isUrlLike` function comment for clarity

- Add pathExists caching to optimize link validation

- Implement concurrency control for file checks

- Introduce metrics tracking for link validation results

- Update error handling and logging for better feedback

- Refactor link validation logic to reduce redundancy


- [`c7c99db`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c7c99dba2a2b84979ad8462087f8c60348cbda73 "📝 Diff: 48 files, ++1868 | --173") — 🛠️ [fix] Guard missing filenames in lint rules

🛠️ [fix] Prevents undefined-path behavior by defaulting missing lint context filenames before test-file short-circuit checks.

- Improves runtime safety for rule execution in nonstandard or mocked contexts.

🧹 [chore] Expands prompt audit records with host, user, shell version, and ISO timestamp metadata.

- Improves traceability for local hook activity and environment diagnostics.

👷 [ci] Stabilizes mutation-report publishing metadata.

- Normalizes repository identity casing and pins dashboard version labeling to a stable branch value.

🧪 [test] Adds broad mutation-focused coverage for rule metadata, filename fallbacks, and edge-case matching/fixing behavior.

- Introduces shared metadata smoke checks and extends many rule suites with no-fix, suggestion, whitespace-normalization, shadowing, and qualified-type scenarios to reduce survivor regressions.


- [`3ede063`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3ede06303b78cea7525adb221778dea080e352a9 "📝 Diff: 34 files, ++191 | --202") — 🛠️ [fix] Improves rule matching and early exits

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


- [`8f4b499`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8f4b499a6c0285c3cc0b92c4ba08b78af04e8a08 "📝 Diff: 81 files, ++1064 | --38") — 🛠️ [fix] Stabilizes plugin export defaults

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


- [`895cb41`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/895cb413648d9421fcfd6c557cb66025ebc1cb8d "📝 Diff: 211 files, ++3588 | --944") — 🛠️ [fix] Update type aliases to use TypeScript's type-fest library


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



### 🛡️ Security

- [`b76ce59`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b76ce59b0a7317ddb8d5cac096f30d2859963dfe "📝 Diff: 2 files, ++7929 | --5784") — 🔧 [build] Update package dependencies for improved stability and features


- 📦 Upgrade "@stylistic/eslint-plugin" from "^5.9.0" to "^5.10.0" for enhanced linting capabilities.

- 📦 Upgrade "@types/node" from "^25.3.3" to "^25.3.5" to ensure compatibility with the latest Node.js features and types.

- 📦 Upgrade "eslint-plugin-no-secrets" from "^2.2.2" to "^2.3.3" to incorporate the latest security checks and improvements.


- [`7b08932`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7b089328816b87606e9b80a03a22495aecfd7de0 "📝 Diff: 7 files, ++13 | --13") — *(deps)* [dependency] Update the github-actions group across 1 directory with 7 updates


- [`acd2932`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/acd29320fdc5e4e99afe81e099e3f6beb622f455 "📝 Diff: 10 files, ++21 | --21") — *(deps)* [dependency] Update the github-actions group across 1 directory with 8 updates


- [`de875de`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/de875ded17a8f5ee5851d27586215eeb2bf1d419 "📝 Diff: 5 files, ++194 | --5") — [StepSecurity] Apply security best practices


- [`976452b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/976452b5c39227330fa42d56f08eab88968d53a6 "📝 Diff: 19 files, ++1472 | --1473") — 📝 [docs] Add comprehensive guidelines for various file types in the repository


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


- [`20a6723`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/20a672338e3a0d93f3a85dca1dd1df52e48b18eb "📝 Diff: 22 files, ++4148 | --0") — 📝 [docs] Add configuration files for various tools

- Created `.taplo.toml` for TOML formatting rules, aligning with Prettier's style.

- Introduced `.yamllint` for YAML linting configuration, specifying rules and ignored paths.

- Added `cliff.toml` for git-cliff configuration to generate changelogs based on conventional commits.

- Implemented `commitlint.config.mjs` to enforce commit message standards, including emoji and scope validation.

- Established `jscpd.json` for configuring the jscpd tool to detect code duplication.

- Created `kics.yaml` for KICS configuration, focusing on Infrastructure as Code security scanning.

- Added `lychee.toml` for configuring the lychee link checker, including caching and request settings.

- Introduced `markdownlint.json` for markdown linting rules, ensuring consistent formatting across markdown files.



### 🛠️ Other Changes

- [`d233b9c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d233b9c2b49f5f87e10e2c2ee04deed9765f54a3 "📝 Diff: 254 files, ++16425 | --0") — Add tests and TypeScript configuration for uptime-watcher plugin

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



### 🚜 Refactor

- [`93ac9b2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/93ac9b21c4af4817d278a6b28c0076d8f275b6f2 "📝 Diff: 149 files, ++2081 | --1188") — 🚜 [refactor] Derive canonical rule metadata and sync README with plugin

✨ Centralize all rule docs/preset/typed‑rule metadata in new derivation helpers

- remove hand‑authored membership and type‑checked lists; derive from `meta.docs`

- update plugin to build preset maps and typed‑rule set from derived data

- add `requiresTypeChecking` flag on rules and tighten selector patterns

🧹 Add tooling to keep README accurate

- new CLI/script generates `## Rules` table from plugin metadata

- tests verify README section matches generated output

🛠️ Enforce policy and settings uniformly

- create policy‑aware reporter & helpers, guard WeakMap keys

- simplify `createTypedRule` and strip outdated autofix logic

🧪 Extend and modernize test infra

- selector‑aware listener helpers, global Vitest setup included

- robust metadata integrity suite and README sync test

- update dozens of rule tests to use new helpers and respect selectors

🗑️ Remove obsolete modules/files

- delete static preset membership, type‑checked name exports

- clean up report adapter and simplify plugin settings

👷 Adjust configs and types

- include test declaration files in TS configs, update eslint.cfg

- add new d.ts for script exports, expand vite/vitest setup

Overall this refactor makes metadata authoritative, automates documentation, and strengthens verification across the codebase.


- [`043d8e0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/043d8e0e4e13ce0b50b9962b8f62c838f6ac8647 "📝 Diff: 1 file, ++0 | --3") — 🚜 [refactor] Remove open-pull-requests-limit from Dependabot configuration


- Eliminated the open-pull-requests-limit setting from GitHub Actions and npm updates

- Streamlined the Dependabot configuration for better flexibility in handling pull requests


- [`bc34602`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bc34602c5d2bfdb727f39932458712012a0b1f5a "📝 Diff: 1 file, ++0 | --1") — 🚜 [refactor] Remove versioning strategy from GitHub Actions updates

- Eliminated the `versioning-strategy: increase` line for GitHub Actions updates in the Dependabot configuration


- [`cc09090`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/cc09090b487eac05c34f854a0e9aaabef9406d08 "📝 Diff: 1 file, ++6 | --51") — 🚜 [refactor] Simplify Dependabot configuration in YAML file

- Remove unnecessary comments and redundant settings for clarity

- Consolidate schedule settings under multi-ecosystem-groups

- Streamline update configurations for GitHub Actions and npm ecosystems

- Eliminate unused grouping configurations for better maintainability


- [`625bf6c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/625bf6c76b4fdd57ce7775faab33cb9f2fa30e30 "📝 Diff: 1 file, ++0 | --1") — 🚜 [refactor] Remove unnecessary name from Docusaurus NPM dependencies in Dependabot configuration


- [`50e9b6e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/50e9b6ecb39f81e9ffe2214166b5143302aff525 "📝 Diff: 1 file, ++0 | --3") — 🚜 [refactor] Remove unnecessary naming and versioning strategy for Dependabot updates

- Eliminated 'name' and 'versioning-strategy' fields from GitHub Actions and NPM dependencies

- Streamlined configuration for better clarity and maintainability


- [`08e3bab`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/08e3babbd1e0599cb734c359a1a40f2c686256b0 "📝 Diff: 77 files, ++306 | --78") — 🚜 [refactor] centralize documentation URL base for rules

🚜 expose a shared `RULE_DOCS_URL_BASE` constant from the internal helper
 previously the base URL lived silently inside the module as a private
 value; exporting it makes the canonical docs prefix configurable and
 avoids repeated literals.

🚜 adjust every rule module to import the base and build a local
 `RULE_DOCS_URL` by appending its own name
 this replaces dozens of hard‑coded links, keeping metadata urls in
 sync and making a future change to the host/path trivial.


- reduces duplication across the codebase

- improves maintainability and consistency of documentation links

- paves the way for easier customization or relocation of the docs site

The change is purely structural; rule behavior is unaffected.


- [`3d21778`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3d21778f72cabd910c1d79136fc01fd0a7807a4b "📝 Diff: 38 files, ++389 | --483") — 🚜 [refactor] Centralize member‑call and throw‑consequent logic and streamline rules

🚜 [refactor] Extract shared helpers

- add `_internal/member-call.ts` with strongly‑typed `getIdentifierMemberCall`/`getIdentifierPropertyMemberCall` and related types

- add `_internal/throw-consequent.ts` for throw‑only consequent detection and extraction

- rename and export `isFilterCallExpression` from filter‑callback helper

🛠️ [fix] Migrate rules to new utilities

- replace manual MemberExpression/property checks with shared matchers across nearly every `prefer‑ts‑extras‑*` rule

- use `isFilterCallExpression` in filter‑related rules and rework callback logic in `not` rule

- plug throw‑consequent helpers into assert‑defined, assert‑error, and assert‑present rules, removing duplicated code

- update `is‑finite`/`is‑integer`/`is‑safe‑integer`/`object‑*` rules to leverage member call helper for safer matching

- adjust `set‑has` and `string‑split` rules similarly

- adapt tests to verify import of new helpers and expected source structure

🚜 [refactor] Improve ts‑eslint node autofix internals

- rename types/functions from “Node” to “Ast” for clarity

- broaden regex pattern and add text‑based AST reference checks

- drop backward‑compat alias and tidy import/type definitions

- add namespace‑name scanning utility

🧹 [chore] Miscellaneous cleanup

- reformat some import lists and update type imports (`UnknownRecord`)

- amend tests to assert helper usage and remove obsolete source assertions

- ensure all call sites updated for renamed helpers

This consolidation reduces duplication, strengthens type safety, and simplifies future maintenance of rule logic.


- [`e3c8cda`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e3c8cda4cc05fec1a9b7f353473bb1e0ebf54e73 "📝 Diff: 40 files, ++2622 | --709") — 🚜 [refactor] Simplify array-like type checks and improve code reuse


- 🔧 [build] Refactor `prefer-ts-extras-array-includes` and `prefer-ts-extras-array-join` rules to utilize a shared `createIsArrayLikeExpressionChecker` function for determining array-like expressions.

- 🔧 [build] Remove redundant `isArrayLikeType` functions from `prefer-ts-extras-array-last`, `prefer-ts-extras-assert-present`, `prefer-ts-extras-is-empty`, and `prefer-ts-extras-string-split` rules, replacing them with the new shared utility.

- 🔧 [build] Enhance `prefer-ts-extras-set-has` rule to improve set type detection using a more comprehensive approach that checks for union and intersection types.

- 🔧 [build] Update `prefer-ts-extras-is-infinite` rule to utilize `areEquivalentExpressions` for comparing expressions, enhancing clarity and maintainability.

- 🔧 [build] Introduce `areEquivalentExpressions` utility to normalize expression comparisons, allowing for better handling of TypeScript assertion wrappers.

- 🧪 [test] Add tests for `areEquivalentExpressions` to ensure accurate expression comparison, including cases for identical expressions, different expressions, and unwrapping TypeScript assertions.

- 🧪 [test] Update existing tests across various rules to reflect the new utility functions and ensure they correctly validate the intended behavior.

- 📝 [docs] Improve documentation for rules to clarify the purpose of changes and the benefits of using the new utilities.


- [`91a136d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/91a136dbd7dd14660f9a4b9a6aeffc0e4a6b7657 "📝 Diff: 178 files, ++595 | --108") — 🚜 [refactor] switch rule docs to Docusaurus routes & add footer links

📝 [docs] add ADR 0006/0007 entries and pages, update sidebar/index with new decisions
🚜 [refactor] change docs‑URL base constants and rule‑creator logic to use live site routes (`…/rules/<id>`) instead of GitHub blob markdown links
🚜 [refactor] update all rule metadata defaults and inline urls accordingly
🧪 [test] adjust smoke, integration and individual rule tests to expect `/rules/<id>` URLs and remove `.md` suffix checks
📝 [docs] append a consistent “Adoption resources” footer to every rule page linking shared guides
📝 [docs] create ADRs explaining canonical URL strategy and footer link rationale

Enhances user experience by pointing editors and links at rendered documentation, stabilizes the public docs surface independent of repo layout, and keeps shared guidance discoverable without duplicating boilerplate. Tests and sources no longer assume `.md` filenames; route stability is now a compatibility concern.


- [`a62ba9e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a62ba9eb919101eabe2fde50818be1b64866cdd4 "📝 Diff: 1 file, ++57 | --24") — 🚜 [refactor] Improve code readability and formatting in inspect_pr_checks.py

- 🛠️ Adjust function signatures for better clarity

- 🎨 Reformat argument lists and string literals for consistency

- 🔧 Enhance error handling messages for better debugging

- 🎨 Improve indentation and line breaks for better readability


- [`72c85a8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72c85a8e2335f64003b42f78dc8104a105169f03 "📝 Diff: 81 files, ++76 | --814") — 🚜 [refactor] Treats tests like other files

🚜 [refactor] Aligns plugin/test heuristics

- 🧪 Removes test-path skips and the heuristic so rules always lint tests while relying on config scoping, and cleans up fixtures that only exercised the skip path.

- ⚙️ Updates benchmark scripts/config to build before running stats/timing suites and adds explicit namespace metadata to the plugin entry for clearer identification.


- [`60e7e00`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/60e7e0073c1a54ac8b6611e269bc74a53537aa3c "📝 Diff: 80 files, ++22 | --93") — 🚜 [refactor] Remove redundant defaultOptions stubs

🚜 [refactor]
- Drops the explicit defaultOptions arrays from typed rule definitions so configuration relies on implicit defaults and keeps source definitions concise.
🎨 [style]
- Refreshes doc/test helpers with tighter formatting for import/type utilities and assertion checks to match the cleaned-up style.


- [`0422fd8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0422fd8f088a1e8f6231815f795e57e4a01a916c "📝 Diff: 73 files, ++350 | --306") — 🚜 [refactor] Enforce readonly parameter typing

🚜 [refactor] Expands readonly annotations across core typed utilities and rule logic so function inputs stay immutable by default.

- Improves type-safety consistency and reduces accidental mutation paths without changing runtime behavior.

🔧 [build] Tunes readonly-parameter linting to stay strict on explicit APIs while avoiding noisy inferred-parameter churn.

- Adds practical allowlists for common external types and method handling so enforcement remains useful and sustainable.

🧪 [test] Aligns test helpers and listener harness typings with the stricter immutability model.

- Applies safer optional access and targeted writable casts only where test scaffolding must mutate nodes.


- [`2101a3e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2101a3ec1f446f93c0351941344f34603bfb3f13 "📝 Diff: 32 files, ++9950 | --3881") — Migrate plugin to TypeScript and restructure codebase



### 📝 Documentation

- [`e095a9f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e095a9f3bfee6d69d1e9091a10b3e31176c1d32f "📝 Diff: 1 file, ++1 | --1") — 📝 [docs] Update documentation link check command to include API verification


- [`15d3bea`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/15d3beaba202108f75ac0ad87962bac935f63c2f "📝 Diff: 1 file, ++6 | --0") — 📝 [docs] Update Stylelint configuration with installation instructions


- [`9339c8c`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9339c8c73edde7b0d0577e3d92624ce000d0d06b "📝 Diff: 7 files, ++376 | --198") — 📝 [docs] Update contributor badge formatting and documentation guidelines
✨ [feat] Enhance commit message guidelines with hybrid Gitmoji format
🔧 [build] Add devEngines configuration for Node.js and npm version enforcement


- [`ee06635`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ee06635387e8a07fd4a5072ccebfdb37551e2ee1 "📝 Diff: 4 files, ++161 | --72") — 📝 [docs] Update commit message guidelines to include Gitmoji format and examples
🔧 [build] Add commitlint-config-gitmoji as a dependency for enforcing commit message format


- [`8350423`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/835042393b7b31364243bfe9f851e12b1c07fcb9 "📝 Diff: 76 files, ++79 | --3") — 📝 [docs] Add blank line before "Further reading" section in rule documentation


- Added a blank line before the "## Further reading" section in multiple TypeScript extra and TypeFest rule documentation files to improve readability and adhere to documentation standards.

- Updated the regex pattern in the `remark-lint-rule-doc-headings` script to enforce this formatting rule.

- Modified the test case in `docs-integrity.test.ts` to check for exactly one blank line between the rule catalog ID and the "Further reading" section.


- [`2f9b6d3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2f9b6d386efd59b703aefa982a483257ec424500 "📝 Diff: 33 files, ++936 | --167") — 📝 [docs] Add comprehensive charts for developer documentation


- ✨ [feat] Introduce "Docs Link Integrity and Anchor Stability" chart
  
- Provides a flowchart for maintaining stable documentation links and anchors.
  
- Includes a maintainer policy and suggested command sequence for validation.


- ✨ [feat] Add "Import-Safe Autofix Decision Tree" chart
  
- Outlines decision-making for safe import rewrites and suggestions.
  
- Highlights the importance of symbol safety and parse safety.


- ✨ [feat] Create "Preset Composition and Rule Matrix" chart
  
- Explains how rule metadata integrates into user-facing documentation.
  
- Provides practical use cases and common failure modes.


- ✨ [feat] Implement "Preset Semver and Deprecation Lifecycle" chart
  
- Details the lifecycle for managing preset changes with semver awareness.
  
- Offers maintainer guidance on handling preset modifications.


- ✨ [feat] Develop "Rule Authoring to Release Lifecycle" chart
  
- Maps the entire process from rule proposal to publication.
  
- Emphasizes the importance of documentation throughout the lifecycle.


- ✨ [feat] Add "Typed Rule Performance Budget and Hotspots" chart
  
- Analyzes performance considerations for typed rules.
  
- Suggests policies for managing semantic type resolution.


- ✨ [feat] Introduce "Typed Rule Semantic Analysis Flow" chart
  
- Details the semantic path for typed rules, focusing on service acquisition and type operations.
  
- Encourages fail-fast behavior in typed rule contexts.


- 🧹 [chore] Update index.md to include new charts in the developer section
  
- Ensures all new charts are listed for easy navigation.


- 🧹 [chore] Modify typedoc configuration to expand entry points
  
- Adjusts entry point strategy to include internal files for better documentation generation.


- 🛠️ [fix] Refactor various internal functions for improved clarity and performance
  
- Simplifies function signatures and enhances readability across multiple files.
  
- Ensures consistent error handling and type safety in type operations.


- 🧪 [test] Enhance rule metadata tests for improved validation
  
- Introduces new utility functions for validating rule metadata integrity.
  
- Ensures that rule IDs and numbers are correctly formatted and sequenced.


- [`4817427`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/481742759795f51f0b053217f9a8dbbb41307b1c "📝 Diff: 12 files, ++321 | --98") — 📝 [docs] Update developer documentation and charts


- ✨ [feat] Add "Rule Catalog & Doc Sync" and "Change Impact Matrix" to sidebars

- 📝 [docs] Create "Change Impact and Validation Matrix" documentation with flowchart

- 📝 [docs] Create "Rule Catalog and Docs Synchronization" documentation with flowchart

- 📝 [docs] Update "Docs and API Pipeline" documentation to include sidebar wiring

- 📝 [docs] Update "Quality Gates and Release Flow" documentation with failure loops

- 📝 [docs] Update "System Architecture Overview" documentation to include generated tooling assets

- 🎨 [style] Enhance sidebar styles for developer charts

- 🔧 [build] Update TypeDoc configuration to adjust private class field visibility and type conversion depth


- [`015b85e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/015b85e5ec5405a89807ba1767f361084f5df7d7 "📝 Diff: 13 files, ++4146 | --14") — 📝 [docs] Add snapshot tests for rule documentation headings

- Introduced `docs-heading-snapshots.test.ts` to ensure stability of rule documentation headings.

- Implemented functions to parse H2 headings and determine package labels from markdown files.

- Created a test to verify that the rule documentation headings remain consistent.

📝 [docs] Add snapshot tests for plugin contracts

- Created `plugin-contract-snapshots.test.ts` to validate the stability of public plugin contracts.

- Normalized parser options and collected sorted rule IDs for each config preset.

- Added tests to ensure exported rule names and preset contracts remain stable.

📝 [docs] Enhance README rules table synchronization tests

- Updated `readme-rules-table-sync.test.ts` to include a test for generated rules markdown.

- Ensured that the generated rules section matches a snapshot for consistency.

📝 [docs] Introduce snapshot tests for rule metadata

- Added `rule-metadata-snapshots.test.ts` to capture normalized rule metadata contracts.

- Implemented functions to normalize and collect metadata for all exported rules.

- Created a test to ensure that the rule metadata contracts remain stable.

🔧 [build] Update Vite configuration for hanging process reporter

- Added a flag to control the activation of the hanging-process reporter.

- Adjusted the reporters list based on the environment variable for better diagnostics.


- [`bef8875`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bef8875701aae3580b2a1b137a3d0738267457b0 "📝 Diff: 80 files, ++166 | --19") — 📝 [docs] Add documentation URLs for TypeFest ESLint rules


- 📜 Updated the `prefer-ts-extras-is-empty` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-equal-type` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-finite` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-infinite` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-integer` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-present-filter` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-present` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-safe-integer` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-key-in` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-not` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-entries` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-from-entries` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-has-in` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-has-own` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-keys` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-values` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-safe-cast-to` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-set-has` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-string-split` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-abstract-constructor` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-arrayable` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-async-return-type` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-conditional-pick` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-constructor` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-except` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-if` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-iterable-element` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-array` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-object` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-primitive` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-value` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-keys-of-union` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-literal-union` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-merge-exclusive` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-non-empty-tuple` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-omit-index-signature` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-partial-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-primitive` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-promisable` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-readonly-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-all-or-none` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-at-least-one` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-exactly-one` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-one-or-none` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-required-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-schema` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-non-nullable` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-optional` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-readonly` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-required` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-simplify` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-tagged-brands` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-tuple-of` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-array` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-map` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-record` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-set` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unwrap-tagged` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-value-of` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-writable-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-writable` rule to include a documentation URL.


- [`12454e9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/12454e9f6e7e4499ac9082c122d0287455fe3bab "📝 Diff: 1 file, ++1 | --2") — 📝 [docs] Update description for review-hacky-brittle-fixes prompt


- Clarify the purpose of the prompt to perform a comprehensive audit of the repository, focusing on fragile, brittle, or hacky code.

- Remove outdated agent reference for improved clarity.


- [`6541e53`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6541e53092db4bc31702088ad4a203a3262dfe0b "📝 Diff: 23 files, ++680 | --84") — 📝 [docs] Add blog and architecture decision records for eslint-plugin-typefest

- ✨ [feat] Introduce blog for eslint-plugin-typefest with posts on design and governance

- 📝 [docs] Create ADR 0008 for TypeDoc generation strategy in CI and local development

- 📝 [docs] Create ADR 0009 to establish the blog as an official documentation channel

- 📝 [docs] Create ADR 0010 for governing autofix behavior with safety semantics

- 📝 [docs] Create ADR 0011 for type-aware rule contract and fail-fast behavior

- 🛠️ [fix] Update docusaurus configuration to support blog features and improve navigation

- 🎨 [style] Enhance homepage stats display for better user experience

- 🎨 [style] Refine CSS styles for hero section and overall layout

- 🧪 [test] Add tests for new features and ensure existing functionality remains intact


- [`9acb9a8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9acb9a8bb27cf23d4503b52c095c48120bf5f568 "📝 Diff: 90 files, ++1398 | --3845") — 📝 [docs] Update TypeFest rule documentation for clarity and consistency

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


- [`51d6a5d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/51d6a5d7ca6f3c5e14f32794f20f4c6ddb91f5cd "📝 Diff: 12 files, ++296 | --77") — 📝 [docs] Adds ADR hub and updates docs build flow

📝 [docs] Adds an ADR section with an index and three accepted decisions to capture architectural intent and reduce repeated dependency-adoption discussions.

- Defines why current internal rule/runtime patterns remain in place and when those decisions should be revisited.

🎨 [style] Updates sidebar badges and accent styling so architecture decisions are easier to find and remain visually consistent with existing documentation sections.

🔧 [build] Updates documentation build orchestration to rely on workspace-level inspector build commands and introduces a faster docs build path for quicker iteration.

- Improves local build ergonomics and keeps generated docs steps aligned across environments.

🧹 [chore] Refreshes selected lint and style tooling versions and expands script-level documentation comments to improve maintenance clarity.


- [`7d246f8`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7d246f84d4928bbae4ddfb3d51bb092a56864ef0 "📝 Diff: 5 files, ++53 | --72") — 📝 [docs] Update Code of Conduct to reflect no formal guidelines
🔧 [build] Change logo file types in manifest.json from SVG to PNG
🎨 [style] Enhance case name formatting in ruleTester.ts for better visibility
🔧 [build] Simplify project name label in vite.config.ts from "Frontend" to "Test"
🔧 [build] Update vitest configuration in vitest.stryker.config.ts for improved test handling


- [`f099e8d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f099e8d191c3e432d3f50535834e08cef9ce09cb "📝 Diff: 3 files, ++2 | --2681") — 📝 [docs] Update documentation scripts in package.json


- 🔧 Reordered the `docs:toc` and `docs:validate-links` scripts for better clarity and consistency.

- 🛠️ Removed the old `docs:validate-links` script and added it back after `docs:toc` to maintain logical flow.

- 🔧 Updated the `remark` dependencies to ensure the latest features and fixes are utilized.

- 🧹 Removed unused `mdast` dependency to clean up package.json and reduce bloat.


- [`92500d2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/92500d25d901851046813ee34b0d0ba1bc29663f "📝 Diff: 6 files, ++408 | --360") — 📝 [docs] Update strict and type-fest-types presets documentation


- 📜 Refactor the rules table in `strict.md` for better readability
  
- Added new rules: `prefer-type-fest-abstract-constructor`, `prefer-type-fest-constructor`, `prefer-type-fest-literal-union`, `prefer-type-fest-merge-exclusive`, `prefer-type-fest-required-deep`, `prefer-type-fest-readonly-deep`, and `prefer-type-fest-writable-deep`
  
- Removed outdated rules: `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, `prefer-type-fest-value-of`, and `prefer-type-fest-writable`


- 📜 Refactor the rules table in `type-fest-types.md` for better readability
  
- Added new rules: `prefer-type-fest-abstract-constructor`, `prefer-type-fest-constructor`, `prefer-type-fest-literal-union`, `prefer-type-fest-merge-exclusive`, `prefer-type-fest-required-deep`, `prefer-type-fest-readonly-deep`, and `prefer-type-fest-writable-deep`
  
- Removed outdated rules: `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, `prefer-type-fest-value-of`, and `prefer-type-fest-writable`


- [`b8b30d5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b8b30d533d1ccda5f5d9450da6013c9eb6997a57 "📝 Diff: 10 files, ++428 | --71") — 📝 [docs] Update presets documentation with rule matrices and details


- 📜 Added a comprehensive rule matrix to `index.md` for better visibility of rules, fixes, and preset keys.

- 📜 Included specific rules in the `minimal.md` preset documentation to clarify which rules are included.

- 📜 Expanded the `recommended.md` preset documentation to list all applicable rules, enhancing user guidance.

- 📜 Updated `strict.md` preset documentation with a detailed list of rules to inform users of strict configurations.

- 📜 Enhanced `ts-extras-type-guards.md` with a complete list of rules to provide clarity on type guard functionalities.

- 📜 Updated `type-fest-types.md` to include a detailed list of rules, ensuring users understand the available type fest functionalities.


- [`562ff90`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/562ff901516df7171c834f22ed0b83b92cdcc693 "📝 Diff: 36 files, ++875 | --0") — 📝 [docs] Enhance documentation across multiple rules and tests


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


- [`ef195de`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ef195de3aaabb27a1e3542df4c1a025a2d28c701 "📝 Diff: 73 files, ++841 | --2") — 📝 [docs] Enhance ESLint rule documentation across multiple files


- ✨ [feat] Add detailed ESLint rule definitions and metadata for `prefer-ts-extras-object-keys`, `prefer-ts-extras-object-values`, `prefer-ts-extras-safe-cast-to`, `prefer-ts-extras-set-has`, `prefer-ts-extras-string-split`, `prefer-type-fest-arrayable`, `prefer-type-fest-async-return-type`, `prefer-type-fest-conditional-pick`, `prefer-type-fest-except`, `prefer-type-fest-if`, `prefer-type-fest-iterable-element`, `prefer-type-fest-json-array`, `prefer-type-fest-json-object`, `prefer-type-fest-json-primitive`, `prefer-type-fest-json-value`, `prefer-type-fest-keys-of-union`, `prefer-type-fest-non-empty-tuple`, `prefer-type-fest-omit-index-signature`, `prefer-type-fest-primitive`, `prefer-type-fest-promisable`, `prefer-type-fest-require-all-or-none`, `prefer-type-fest-require-at-least-one`, `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, and `prefer-type-fest-value-of`.

- 📝 [docs] Add JSDoc comments to clarify the purpose and usage of each rule, enhancing maintainability and developer understanding.

- 🧹 [chore] Update `ruleTester` utility functions with additional documentation to improve clarity on their usage and functionality.


- [`6863895`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/68638954b10b776b033cd5a207f83531347f28ab "📝 Diff: 2 files, ++34 | --1") — 📝 [docs] Update CSS documentation and global styles for Docusaurus

- Added global CSS overrides for Docusaurus documentation site.

- Enhanced comments to clarify the purpose and scope of the CSS file.

- Updated hover background color for sidebar menu links for better accessibility.


- [`84bc8a1`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/84bc8a1d500497e1ce3bd9302f1aefd69b698c79 "📝 Diff: 147 files, ++654 | --70") — 📝 [docs] Adds package-level module docs

📝 [docs] Improves maintainability and generated docs clarity by adding consistent package-level headers across core modules, plugin wiring, and rule implementations.

- 📝 [docs] Clarifies module intent so contributors and tooling can understand responsibilities faster.

📝 [docs] Updates the rules reference table layout to improve readability and quick scanning.

- 🎨 [style] Normalizes column alignment while preserving existing rule metadata.

🧪 [test] Applies the same package-level documentation pattern to test utilities and suites for repository-wide consistency.


- [`07214d3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/07214d3546cf52dafafc26936403cf090ddffb3c "📝 Diff: 68 files, ++553 | --484") — 📝 [docs] Update documentation for type-fest utility rules


- 🔧 Refactor rule documentation to replace "Legacy" terminology with "Non-canonical" for clarity.

- 📝 Enhance examples in `prefer-type-fest-require-one-or-none.md`, `prefer-type-fest-schema.md`, and other related files to reflect updated import aliases.

- 📝 Modify adoption tips across multiple rule documents to emphasize direct canonical imports and discourage compatibility aliases.

- 📚 Update rollout strategies in various rule documents to clarify migration processes and reduce review noise.

- 🔍 Ensure consistency in references to `typefest.configs["type-fest/types"]` across all relevant documentation files.


- [`9a45e98`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9a45e98c3c63a49374ed2dbfe37e1a45b518a564 "📝 Diff: 71 files, ++821 | --475") — 📝 [docs] Update documentation for type-fest utility types


- 📝 Improve clarity in examples for `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, and `prefer-type-fest-value-of` rules.

- 🔄 Replace non-canonical patterns with comments indicating legacy patterns repeated inline across modules.

- 📚 Enhance the "Why this helps in real projects" section to emphasize shared type vocabulary, safer API evolution, and no runtime overhead.

- 🛠️ Update `eslint.config.mjs` to fix plugin imports and improve configuration.

- 🔄 Update `package-lock.json` and `package.json` to reflect version upgrades for various ESLint plugins, ensuring compatibility and access to new features.



### ⚡ Performance

- [`83baba7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/83baba78bad3ad109c19e0aee332ffa54f5c0bac "📝 Diff: 1 file, ++7 | --1") — ⚡️ [perf] Update import-x/no-unused-modules rule configuration



### 🎨 Styling

- [`4b8520f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4b8520f0d1e192b2cd41dda6ea899bb5dbc6faa2 "📝 Diff: 8 files, ++473 | --368") — 🎨 [style] Consistent quote style and formatting updates across multiple files

- Changed single quotes to double quotes in `bootstrap-eslint-repo.mjs` for consistency

- Updated script commands in `bootstrap-eslint-repo.mjs` to use double quotes

- Adjusted import statements in `eslint9-compat-smoke.mjs` and test files to use double quotes

- Reformatted code for better readability and consistency in `plugin-entry.test.ts`, `plugin-public-types.test-d.ts`, `plugin-runtime-entry-types.test-d.ts`, `prefer-type-fest-except.test.ts`, `prefer-type-fest-unknown-map.test.ts`, and `prefer-type-fest-unknown-set.test.ts`

- Ensured consistent use of double quotes in mock imports
✨ [feat] Enhance ESLint compatibility and plugin versioning

- Added `toPosixPath` and `collectStringEntries` utility functions in `eslint9-compat-smoke.mjs`

- Modified `createCompatibilityConfig` to accept `fixturePath` and adjust project service options accordingly

- Updated tests in `plugin-entry.test.ts` to assert plugin version against package.json

- Enhanced type assertions in `plugin-runtime-entry-types.test-d.ts` to use the imported plugin directly


- [`2c033a5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2c033a5e68a590b8d3f08d105957dc468dd7b6b7 "📝 Diff: 2 files, ++110 | --13") — 🎨 [style] Update Docusaurus config and documentation for improved UI


- Update icon labels in Docusaurus config for better visual consistency

- Enhance project and support section titles with emojis for clarity

- Add nested items under Docs and Rules for better navigation

- Introduce new Blog and Dev sections with structured items for user guidance

- Add rule catalog ID to prefer-ts-extras-array-find-last documentation


- [`f72a493`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f72a49344875884878dd937a71ae7553da492276 "📝 Diff: 1 file, ++3 | --2") — 🎨 [style] Adjust doMock method signature formatting


- Refactor doMock method declaration to align with TypeScript interface augmentation guidelines.

- Ensure method signature is clearly defined for better readability and maintainability.


- [`5c9c3d3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5c9c3d30b1892862be5cdd337cd45ee5034e4d92 "📝 Diff: 6 files, ++130 | --139") — 🎨 [style] Update icons and labels in Docusaurus configuration

- Replace emoji labels with Font Awesome icons for consistency in sidebar and navigation

- Adjust styles for improved alignment and spacing in hero cards

🛠️ [fix] Ensure null returns in constrained type retrieval

- Modify return statements to return null instead of undefined for better type handling

- Update conditional checks to include null values for constrained type results


- [`c37f3cc`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c37f3cca935850135cb83007efd1baf9c4550e2a "📝 Diff: 75 files, ++0 | --75") — 🎨 [style] Remove unnecessary whitespace in rule configuration files

- Cleaned up multiple TypeScript rule files by removing trailing whitespace in the configuration sections.

- This change improves code readability and maintains consistency across the codebase.

- Affected files include:
  
- `prefer-ts-extras-assert-present.ts`
  
- `prefer-ts-extras-is-defined-filter.ts`
  
- `prefer-ts-extras-is-defined.ts`
  
- `prefer-ts-extras-is-empty.ts`
  
- `prefer-ts-extras-is-equal-type.ts`
  
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


- [`9a70578`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9a70578fa48e099426d2a71df8f63046a88b9b09 "📝 Diff: 36 files, ++530 | --183") — 🎨 [style] Refactor code for consistency and readability

- Standardize import statements by removing unnecessary spaces

- Align code formatting for better readability

🛠️ [fix] Update type handling in ESLint plugin

- Replace `Omit` with `Except` from `type-fest` for better type safety in `TypefestPluginContract`

- Improve error handling in `loadTypeScriptParser` function

⚡ [perf] Optimize rule implementations for TypeScript extras

- Replace `setHas` with `setContainsValue` for improved performance in multiple rules

- Utilize `getFunctionCallArgumentText` for consistent argument text retrieval in rules

🧪 [test] Enhance test coverage for TypeScript extras rules

- Add tests for new argument text retrieval logic in `prefer-ts-extras-*` rules

- Remove outdated tests that reference `setHas` in favor of `setContainsValue`

📝 [docs] Update documentation for rule behavior

- Clarify the purpose of `prefer-ts-extras-set-has` rule in documentation

- Ensure all rule descriptions reflect the latest implementation changes


- [`e6eeff5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e6eeff586d1d69f4c812df893a00f836dde93222 "📝 Diff: 93 files, ++39 | --475") — 🎨 [style] Clean up trailing whitespace in TypeScript rule files

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


- [`6eb9b0f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6eb9b0ff35cb5769ce2142ae048c29e8e05ec5f9 "📝 Diff: 1 file, ++1 | --1") — 🎨 [style] Refine stylelint disable comments in custom.css

- Updated stylelint disable comments to remove unnecessary rules

- Maintained essential rules for Docusaurus CSS compatibility


- [`1d8c4af`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1d8c4af3441e33c1a4db469903c731a91ea80470 "📝 Diff: 1 file, ++1 | --1") — 🎨 [style] Refine stylelint disable comments in CSS module

- Removed unnecessary stylelint rules for improved clarity

- Maintained essential rules to ensure Docusaurus CSS compatibility


- [`7f84870`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7f84870ac38c2d089a0bfb6fe85025cce034c2ce "📝 Diff: 4 files, ++432 | --14") — 🎨 [style] Improve code formatting and consistency in scripts

- Adjust spacing in parameter definitions in `.github/CleanReleases.ps1` and `.github/RepoSize.ps1`

- Standardize spacing in output formatting for better readability

- Enhance clarity by ensuring consistent spacing in condition checks
✨ [feat] Add bootstrap script for GitHub labels

- Introduce `scripts/bootstrap-labels.ps1` to manage GitHub issue/PR labels

- Implement features for creating/updating labels using GitHub CLI

- Include options for reading label names from `.github/labeler.yml`

- Provide audit and export functionalities for label management


- [`b4b1929`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b4b1929c19e9e23e7e2c88229979a2c23473a4b3 "📝 Diff: 78 files, ++420 | --259") — 🎨 [style] Clean up code formatting and improve readability

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


- [`22c06f3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/22c06f32690751743723df370ee9f648bb27b943 "📝 Diff: 8 files, ++276 | --197") — 🎨 [style] Improve code formatting and consistency across multiple files

- ✨ Adjust spacing around object destructuring in `prefer-ts-extras-array-first.ts`

- 🎨 Standardize spacing in `prefer-type-fest-json-primitive.ts` for better readability

- 🎨 Refactor spacing in `prefer-type-fest-primitive.ts` to enhance clarity

- 🎨 Clean up spacing in `prefer-type-fest-tagged-brands.ts` for uniformity

- 🎨 Normalize spacing in `prefer-type-fest-writable.ts` to maintain style consistency

- 🎨 Update spacing in `imported-type-aliases.test.ts` for improved code aesthetics

- 🎨 Modify spacing in `docs-integrity.test.ts` to align with style guidelines


- [`4ab154d`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ab154d52bb4581406410e848c69daebc6d0e847 "📝 Diff: 95 files, ++7132 | --2586") — 🎨 [style] Refactor code formatting for consistency and readability

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



### 🧪 Testing

- [`2193ed9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2193ed9abc153379bcb5c989ded4729d78ebd5d6 "📝 Diff: 22 files, ++1102 | --220") — 🧪 [test] Enhance type safety and listener functionality across multiple test files

- 🧪 [test] Update `prefer-ts-extras-is-present.test.ts` to utilize `getSelectorAwareNodeListener` for `LogicalExpression` listener, improving type safety and ensuring proper function references.
- 🧪 [test] Modify `prefer-ts-extras-key-in.test.ts` to enhance fix handling by checking for mock calls and ensuring proper fallback mechanisms for replacement text.
- 🧪 [test] Refactor `prefer-ts-extras-safe-cast-to.test.ts` to include fallback type checkers and parser services, enhancing the robustness of type checks in the tests.
- 🧪 [test] Improve `prefer-ts-extras-set-has.test.ts` by adding fallback checkers and parser services, ensuring accurate type handling and reporting in tests.
- 🧪 [test] Revise `prefer-ts-extras-string-split.test.ts` to implement fallback type checkers and enhance error handling in parser services.
- 🧪 [test] Update `prefer-type-fest-async-return-type.test.ts` to ensure proper listener references and improve mock handling for type node replacements.
- 🧪 [test] Enhance `prefer-type-fest-json-array.test.ts` by implementing listener checks and ensuring proper handling of mock calls for type node replacements.
- 🧪 [test] Refactor `prefer-type-fest-json-object.test.ts` to improve listener handling and ensure fallback mechanisms are in place for type replacements.
- 🧪 [test] Update `prefer-type-fest-json-primitive.test.ts` to enhance listener functionality and ensure proper handling of mock calls for type replacements.
- 🧪 [test] Revise `prefer-type-fest-unknown-array.test.ts` to implement listener checks for type operators and references, improving type safety in tests.


- [`02a1f4e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/02a1f4ea66ef3dda4e2ab79f03851ddaacdd9d70 "📝 Diff: 51 files, ++97 | --95") — 🧪 [test] Update error handling assertions in tests

- Refactored multiple test cases to replace `.toThrowError()` with `.toThrow()`, aligning with updated Jest practices for error assertions.
- Adjusted tests across various files including `imported-value-symbols.test.ts`, `rule-catalog.test.ts`, `safe-type-operation.test.ts`, and others to ensure consistency and maintainability.
- This change enhances readability and standardizes error handling across the test suite, improving overall test quality and clarity.


- [`d1092f9`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d1092f9268d3ba4649775868068210e930ef9df9 "📝 Diff: 64 files, ++7842 | --596") — 🧪 [test] Enhance type safety and parsing for TypeFest rules


- ✨ [feat] Introduce `replaceOrThrow` utility function to streamline text replacements in test fixtures across multiple test files.

- 🛠️ [fix] Update `prefer-type-fest-unknown-map.test.ts` to ensure `ReadonlyMap<unknown, unknown>` is correctly replaced with `Readonly<UnknownMap>`, enhancing type safety.

- 🛠️ [fix] Modify `prefer-type-fest-unknown-record.test.ts` to replace `Record<string, unknown>` with `UnknownRecord`, ensuring consistent type usage.

- 🛠️ [fix] Adjust `prefer-type-fest-unknown-set.test.ts` to replace `ReadonlySet<unknown>` with `Readonly<UnknownSet>`, improving type clarity.

- 🛠️ [fix] Revise `prefer-type-fest-unwrap-tagged.test.ts` to replace `UnwrapOpaque<` with `UnwrapTagged<`, ensuring correct type transformation.

- 🛠️ [fix] Update `prefer-type-fest-value-of.test.ts` to replace `T[keyof T]` with `ValueOf<T>`, enhancing type inference.

- 🛠️ [fix] Modify `prefer-type-fest-writable-deep.test.ts` to replace `DeepMutable<TeamConfig>` with `WritableDeep<TeamConfig>`, improving type consistency.

- 🛠️ [fix] Adjust `prefer-type-fest-writable.test.ts` to replace `Mutable<` with `Writable<`, ensuring correct type aliasing.

- 🧪 [test] Add fast-check properties to validate that replacements remain parseable across various test cases, enhancing test coverage and reliability.


- [`4c685cb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4c685cbac3253139b206443b8fa80571a470b30b "📝 Diff: 61 files, ++2553 | --28") — 🧪 [test] bolster guards and metadata across rules

- 🛠️ [fix] grow ESLint ignorePattern with v8/c8/nyc/codecov/coveralls tokens to prevent spurious warnings

- 🛠️ [fix] configure minimal plugin preset with explicit `ecmaVersion: "latest"` and `sourceType: "module"`

- 🛠️ [fix] sprinkle defensive `/* v8 ignore */` comments in helper logic to handle sparse‑array and malformed AST cases

- 🧪 [test] add `vi` imports and hook new metadata‑and‑filename smoke helpers in dozens of rule tests

- 🧪 [test] introduce extensive internal listener‑guard suites covering malformed nodes, AST drift, missing imports, shadowed identifiers, empty predicates, test‑file early exits and more

- 🧪 [test] expand valid/invalid examples with spread arguments, non‑literal offsets, super access, nested operator mismatches, recursion cycles, union anomalies, shadowed replacements, disabled fixes, and numerous edge conditions

- ✨ [feat] enhance test infrastructure for rule metadata verification and simplify repeated patterns across specs

- 🧪 [test] update many existing tests with new fixtures, outputs and scenario names to improve coverage and resilience


- [`10c699a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/10c699af540ea73a73ab0e69acb9d2c217b3d9ff "📝 Diff: 41 files, ++297 | --140") — 🧪 [test] Refactor test cases to use 'test' instead of 'it' for consistency

- Updated all test files to replace 'it' with 'test' for better readability and consistency across the test suite.

- Ensured that all relevant test cases maintain their functionality after the change.

🛠️ [fix] Change boolean checks to use 'toBeTruthy()' for clarity

- Modified assertions in multiple test files to use 'toBeTruthy()' instead of 'toBe(true)' for improved clarity in boolean checks.

🎨 [style] Clean up import statements and formatting

- Removed duplicate import statements and ensured consistent formatting across test files.

- Added spacing and line breaks for better readability in several test files.

📝 [docs] Update documentation comments for clarity

- Enhanced documentation comments in various test files to provide clearer context and explanations for the tests being conducted.


- [`145743a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/145743a270bfa524527bdcfd1ff264a7fce87aa1 "📝 Diff: 40 files, ++430 | --80") — 🧪 [test] Expands type-utility rule coverage

🧪 [test] Strengthens rule reliability by adding edge-case assertions for detection and autofix behavior across multiple type-utility preference rules.

- Adds reversed-union, whitespace-normalized, extra/missing generic argument, and nested-type scenarios to reduce false positives and false negatives.

- Verifies non-fix behavior when required imports are missing, so diagnostics stay accurate without unsafe edits.
🧪 [test] Broadens valid-case coverage for multi-member unions and duplicate-member combinations to ensure rules trigger only on exact intended patterns.
🎨 [style] Normalizes import ordering and modernizes matcher assertions and regex flags in metadata checks to keep tests consistent and less brittle.


- [`ec44a53`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ec44a53779b9a5e7d5ea0f2e0f08c7c318a92366 "📝 Diff: 50 files, ++5040 | --177") — 📝 [test] Enhance type-fest rule tests with additional cases


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



### 🧹 Chores

- [`fe9afd2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fe9afd26fe79835b171003e19575a90518e14be6 "📝 Diff: 2 files, ++3 | --3") — Release v1.0.0


- [`79d484b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/79d484b673d237e04d4d6a36eaa413162edec085 "📝 Diff: 4 files, ++389 | --16") — 🧹 [chore] Clean up configuration files by removing bootstrap instructions


- [`aeb72ee`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/aeb72eeeb9be48054bf96209b07ff62e9f777d33 "📝 Diff: 100 files, ++140 | --150") — 🧹 [chore] migrate documentation URLs to GitHub Pages and bump dev dependencies

- update base docs URL from custom domain to GitHub Pages in internal helpers and rule metadata
  ensures generated rule links point at `nick2bad4u.github.io/...`
- adjust tests and URL construction to reflect new base and remove `.md` suffix
- bump various ESLint‑related dependencies (html‑eslint plugins, compat, jsonc, stylelint, etc.)
  to keep linting tooling up‑to‑date

The changes simplify hosting strategy for docs and keep development dependencies current.


- [`79dd244`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/79dd2444ee0729ab547a608945aca8f9097070fc "📝 Diff: 3 files, ++24 | --694") — 🗑️ [chore] Remove ESLint Config Inspector build and verification scripts

- Deleted `build-eslint-inspector.mjs` and `verify-eslint-inspector.mjs` scripts

- These scripts were responsible for building and verifying the ESLint Config Inspector integration

- Their removal simplifies the project structure and eliminates unused code



### 👷 CI/CD

- [`232fe61`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/232fe61b01124fd8bf0113271cf6ff2eaba70c99 "📝 Diff: 2 files, ++2 | --2") — 👷 [ci] Update Codecov action version for improved functionality

- Updated the Codecov test results action to a specific commit for better stability and features



### 🔧 Build System

- [`fbc4753`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fbc47539a7a9af13b983e0061e147e1d100d83b2 "📝 Diff: 2 files, ++642 | --608") — 📦️ [build] Upgrade dependencies in package.json

- Upgraded "@types/node" from "^25.4.0" to "^25.5.0" for improved type definitions.
- Updated "@vitest/coverage-v8", "@vitest/eslint-plugin", and "@vitest/ui" to "^4.1.0" and "^1.6.11" for better compatibility and features.
- [dependency] Updateed "commitlint" from "^20.4.3" to "^20.4.4" for minor improvements.
- Upgraded "eslint-plugin-jsonc" from "^3.1.1" to "^3.1.2" for enhanced JSONC linting.
- Updated "vite" from "^7.3.1" to "^8.0.0" for new features and performance improvements.
- [dependency] Updateed "vitest" from "^4.0.18" to "^4.1.0" for better testing capabilities.


- [`c2cb0ea`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c2cb0ea80a19d336113a4599c453eec35166ddb1 "📝 Diff: 4 files, ++20 | --13") — 🔧 [build] Update package dependencies and configurations

- 🔧 Update packageManager to npm@11.11.1 in package.json

- 🔧 Upgrade eslint-plugin-import-x to version 4.16.2 in package.json and package-lock.json

- 🔧 Add @package-json/types as a dev dependency in package-lock.json

- 🎨 Adjust files entry in package.json to include docs/rules/**
🧪 [test] Clean up test file by removing unnecessary blank line in plugin-entry.test.ts


- [`4d8023a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4d8023abd7080def62cafa17ec1128de75c17d7d "📝 Diff: 12 files, ++493 | --45") — 🔧 [build] Update package configurations and dependencies

- 🛠️ [fix] Set main entry point in package.json to docusaurus.config.ts

- 🛠️ [fix] Add OS compatibility field in package.json and package-lock.json

- 🔧 [build] Upgrade eslint-plugin-package-json to version 0.90.0

- 🔧 [build] Upgrade eslint-plugin-sonarjs to version 4.0.2

- 📝 [docs] Add tests for rule catalog integrity and documentation URLs

- 🧪 [test] Implement tests for rule catalog entries and metadata validation

- 🧪 [test] Add tests for docusaurus site configuration integrity


- [`6d7d427`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6d7d4277dbb4ab767076fce90a84934e4bfd04f9 "📝 Diff: 9 files, ++253 | --49") — 🔧 [build] Update code for improved readability and safety

- 🛠️ Refactor rule access to use bracket notation for consistency

- 🛠️ Enhance ESLint plugin configuration handling with new utility functions

- 🛠️ Improve TypeScript configuration to ensure proper type checking

- 🛠️ Add type definitions for untyped third-party modules

- 🛠️ Adjust ESLint configuration to include additional paths for better module resolution


- [`db4aff6`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db4aff6ccb4a292eb3621a53cfa73f6379a17567 "📝 Diff: 1 file, ++5 | --5") — 🔧 [build] Refactor vitest globals type definitions

- 🛠️ Update import statement for createTypedRule

- 🔧 Change CreateTypedRuleSelectorAwarePassThrough type to use createTypedRuleType

- 🛠️ Adjust doMock method signature for improved type safety


- [`124785e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/124785ed1892b86fedc8ad44509902dd39332a47 "📝 Diff: 2 files, ++253 | --99") — 🔧 [build] Update TypeScript ESLint dependencies and related packages

- Upgrade @typescript-eslint/parser, @typescript-eslint/type-utils, and @typescript-eslint/utils to version 8.57.0

- Update @types/node to version 25.4.0

- Upgrade @typescript-eslint/eslint-plugin and @typescript-eslint/rule-tester to version 8.57.0

- Update @vitest/eslint-plugin to version 1.6.10

- Upgrade eslint-plugin-regexp to version 3.1.0

- Update stylelint-plugin-use-baseline to version 1.2.7

- Upgrade typescript-eslint to version 8.57.0


- [`8bee5b3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8bee5b36f4ba4bc67ec6010bc65a73e60d83a9c7 "📝 Diff: 45 files, ++91 | --49") — 🔧 [build] Update PowerShell script execution commands and error handling


- 🛠️ [fix] Modify Windows script execution commands in hooks.json to use PowerShell with appropriate flags for better compatibility.

- 🛠️ [fix] Change error handling in log-prompt.ps1 and remove-temp.ps1 from "Stop" to "Continue" to allow scripts to proceed even if an error occurs.

- 🚜 [refactor] Update log directory path in log-prompt.ps1 for consistency and clarity.

- 🚜 [refactor] Refactor multiple rules in the TypeScript codebase to replace hardcoded "type-fest" strings with a centralized constant, TYPE_FEST_MODULE_SOURCE, improving maintainability and reducing potential errors.


- [`0ec1cf7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0ec1cf79284b6bda8b6c4bc68d32972cc7f7c80b "📝 Diff: 47 files, ++659 | --228") — 🔧 [build] Refactor module source imports for consistency across rules

- 🛠️ [fix] Update all rules to use `TS_EXTRAS_MODULE_SOURCE` instead of hardcoded string "ts-extras" for improved maintainability and consistency.
- 📝 [docs] Add a new test file for bounded cache functionality to ensure proper behavior of caching mechanisms.
- ⚡ [perf] Implement bounded cache logic to handle nullable values correctly and optimize eviction of least-recently-used entries.


- [`e2a2129`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e2a21297ba718c316f6e158605474e3b72384a0b "📝 Diff: 7 files, ++90 | --83") — 🔧 [build] Update package-lock.json to remove unnecessary dev flags


- Removed "dev": true from multiple dependencies in package-lock.json to clean up the lock file and ensure only necessary dev dependencies are marked as such.

- Added new dependency "postcss-syntax" with "dev": true and "peer": true, requiring "postcss" version >=5.0.0.

- Introduced "tailwindcss" as a new dependency with "dev": true and "peer": true.

✨ [feat] Enhance type name resolution in prefer-ts-extras-set-has rule


- Integrated `getTypeName` function to improve type name retrieval for candidate types.

- Updated logic to check both the resolved type name and the symbol name for "ReadonlySet" and "Set" to enhance type detection accuracy.

✨ [feat] Improve type name handling in prefer-ts-extras-string-split rule


- Implemented `getTypeName` function to retrieve the type name of candidate types.

- Modified fallback logic to check the resolved type name for "String" when name-based fallback is necessary, ensuring more robust type resolution.


- [`a0f74f2`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a0f74f2c7e56fda2ae08bd98de7c3bbb1fda951c "📝 Diff: 1 file, ++1 | --0") — 🔧 [build] Update Stryker Vitest configuration

- Add setupFiles entry to specify custom setup script for Vitest


- [`fb71524`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fb71524bea3708c7d8be18eec2bbbdd101eec1a4 "📝 Diff: 5 files, ++1032 | --14") — 🔧 [build] Update dependencies and add autofix smoke test


- 🔧 [build] Upgrade `eslint-plugin-array-func` from `^5.1.0` to `^5.1.1`

- 🔧 [build] Upgrade `fast-check` from `^4.5.3` to `^4.6.0`

- 🔧 [build] Upgrade `pure-rand` from `^7.0.1` to `^8.0.0`

- ✨ [feat] Add `create-eslint-plugin-project.mjs` script for bootstrapping npm projects with production and dev dependencies

- 🧪 [test] Introduce `autofix-fixtures-all-rules-smoke.test.ts` to validate ESLint autofix functionality in memory

- 🧪 [test] Implement fixture file collection and linting for smoke tests

- 🧪 [test] Ensure fixture files remain unchanged after linting

- 🧹 [chore] Add `.gitkeep` to `test/fixtures/autofix-smoke` directory to maintain structure


- [`a916f48`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a916f4835b426f01dc82ae38e14719a1953c3bed "📝 Diff: 13 files, ++715 | --138") — 🔧 [build] Update dependencies for TypeDoc and ESLint plugins

- 📝 Update `typedoc-plugin-dt-links` from `^2.0.44` to `^2.0.45` in `package.json` and `package-lock.json`

- 📝 Update `eslint-plugin-tsdoc-require` to `eslint-plugin-tsdoc-require-2` from `^0.0.3` to `^1.0.1` in `package.json` and `package-lock.json`

✨ [feat] Enhance GitHub stats component with new badge styles

- 🎨 Change badge URLs in `GitHubStats.jsx` to use `flat.badgen.net` for improved styling

- 📝 Update alt text for badges to reflect new styles

✨ [feat] Add quick links section to homepage

- 📝 Introduce `heroQuickLinks` array in `index.jsx` for easy navigation to rules and API docs

- 🎨 Render quick links in the homepage layout with appropriate styling

🎨 [style] Improve CSS for inline links and quick links

- 📝 Add styles for `.heroInlineLink` and `.heroQuickLink` in `index.module.css` for better visual appearance

- 🎨 Adjust hover and focus states for improved accessibility

🛠️ [fix] Refactor import insertion logic to use new utility functions

- 📝 Replace `arrayAt` with `isDefined` in `import-insertion.ts` for better clarity

- 📝 Update logic to handle undefined values more gracefully

🧪 [test] Add tests for new functionality in rule listener selector convention

- 📝 Implement tests to validate the behavior of broad listener matches in `rule-listener-selector-convention.test.ts`

- 🎨 Ensure tests cover edge cases for parsing and matching listener methods


- [`3231367`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3231367cb944df9345c0de8b7934346044e8ba68 "📝 Diff: 2 files, ++61 | --24") — 🔧 [build] Update package dependencies in package.json and package-lock.json

- 🔄 [dependency] Update eslint-plugin-package-json ^0.89.4

- 🔄 [dependency] Update knip ^5.86.0

- 🔄 [dependency] Update postcss-sort-media-queries ^6.1.0


- [`ee0edba`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ee0edbad0a9c287b0e05ce6f63410fa34ec1682b "📝 Diff: 4 files, ++43 | --7") — 🔧 [build] Update TypeFest plugin and tests for improved rule documentation synchronization

- 🛠️ Refactor rule documentation synchronization logic to derive `docs.recommended` from preset references

- 🔧 Add `syncDerivedRuleDocsMetadata` function to ensure rule metadata reflects actual preset membership

- 📝 Enhance tests to verify that rule documentation correctly indicates recommended status based on configurations


- [`6a2586a`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6a2586aa770cc53bf466a6b3b04e140dc3e62dc6 "📝 Diff: 81 files, ++262 | --183") — 🔧 [build] Update TypeFest rule configurations for improved type inference

- 🛠️ [fix] Set `recommended` to `false` for `prefer-ts-extras-object-keys` and `prefer-ts-extras-object-values` rules
- 🛠️ [fix] Set `recommended` to `true` for `prefer-ts-extras-safe-cast-to`, `prefer-ts-extras-set-has`, and other TypeFest rules
- ⚡ [perf] Introduce `typefestConfigs` for all rules to specify recommended configurations
 
- 📜 [docs] Update documentation URLs for better reference
- 🧪 [test] Enhance rule metadata tests to validate `recommended` and `typefestConfigs` properties
 
- 🔍 [test] Ensure type checks for `recommended` are boolean
 
- 🔍 [test] Validate that `typefestConfigs` contains valid references


- [`ccc8365`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ccc8365d2550d4881467b30ea50e86340277fdbd "📝 Diff: 24 files, ++1428 | --781") — 🔧 [build] Optimize scope variable retrieval with cycle detection

- 🛠️ Refactor `getVariableInScopeChain` to use a two-pointer technique for cycle detection, improving performance and preventing infinite loops.

- 📝 Update logic to return variables in cyclic scope chains when encountered before cycle detection.

✨ [feat] Enhance TypeScript ESLint node autofix capabilities

- 🛠️ Introduce caching for namespace import names to improve performance in `getTypeScriptEslintNamespaceImportNames`.

- ⚡ Optimize type resolution checks in various rules, including `prefer-ts-extras-set-has`, `prefer-ts-extras-string-split`, and `prefer-ts-extras-safe-cast-to`, by implementing caching mechanisms.

🧪 [test] Add comprehensive tests for new features and optimizations

- 📝 Implement tests for cyclic scope variable retrieval in `scope-variable.test.ts`.

- 📝 Add tests for namespace import collection and caching behavior in `import-analysis.test.ts`.

- 📝 Create tests to ensure proper handling of parser service failures in `prefer-ts-extras-safe-cast-to.test.ts`, `prefer-ts-extras-set-has.test.ts`, and `prefer-ts-extras-string-split.test.ts`.


- [`7a1aa5f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7a1aa5f593e42eda2c185e2c70b3c48a5c0cf39d "📝 Diff: 9 files, ++108 | --148") — 🔧 [build] Refactor TypeScript ESLint node autofix suppression logic

- 🛠️ Update import from `createTypeScriptEslintNodeAutofixSuppressionChecker` to `createTypeScriptEslintNodeExpressionSkipChecker` in multiple rule files for consistency

- 🔄 Modify logic in `preferTsExtrasIsDefined`, `preferTsExtrasIsEmpty`, `preferTsExtrasIsInfinite`, and `preferTsExtrasIsPresent` rules to utilize the new checker

- 🧪 Adjust test cases to reflect changes in autofix suppression behavior, ensuring proper reporting without applying autofixes for AST-node comparisons


- [`4ae5381`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ae53812112c8f33d658c3e6be6b3e82a5b42438 "📝 Diff: 161 files, ++1542 | --2178") — 🔧 [build] Refactor rule metadata test imports and remove deprecated tests


- 🛠️ Update import statements in multiple test files to replace `addTypeFestRuleMetadataAndFilenameFallbackTests` with `addTypeFestRuleMetadataSmokeTests` for consistency and clarity.

- 🧹 Remove `rules-test-file-guards.test.ts` and `typed-rule-internal.test.ts` as they are no longer needed, streamlining the test suite.

- 🔧 Adjust test cases across various files to ensure they utilize the new metadata test function, maintaining the integrity of the test coverage.

- 📝 Ensure all relevant test descriptions and structures are preserved during the refactor to maintain clarity in test intentions.


- [`d3cc622`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d3cc622c6e7bfcf17735a7bb5771ffbbea089e40 "📝 Diff: 1 file, ++0 | --3") — 🔧 [build] Remove unused import for remark-ignore from .remarkrc.mjs

- Clean up the configuration file by eliminating the import statement for remark-ignore, which is no longer needed.


- [`a37b73b`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a37b73bcb7b205c52c9cfe40dcc57ca2ce5cddec "📝 Diff: 2 files, ++5 | --5") — 🔧 [build] Update stylelint-plugin-use-baseline to version 1.2.6

- Updated dependency version in package.json and package-lock.json


- [`bf40c75`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bf40c75de70bb03d12426e9a6b4ca61121d95495 "📝 Diff: 63 files, ++729 | --429") — 🔧 [build] Refactor type reference handling in tests


- 🛠️ Update type reference variable names from `typeReference` to `tsReference` for consistency across multiple test files.

- 🧪 Modify parsing functions to return `tsReference` instead of `typeReference` in:
  
- `prefer-type-fest-primitive.test.ts`
  
- `prefer-type-fest-readonly-deep.test.ts`
  
- `prefer-type-fest-require-all-or-none.test.ts`
  
- `prefer-type-fest-require-at-least-one.test.ts`
  
- `prefer-type-fest-require-exactly-one.test.ts`
  
- `prefer-type-fest-require-one-or-none.test.ts`
  
- `prefer-type-fest-required-deep.test.ts`
  
- `prefer-type-fest-schema.test.ts`
  
- `prefer-type-fest-set-non-nullable.test.ts`
  
- `prefer-type-fest-set-optional.test.ts`
  
- `prefer-type-fest-set-readonly.test.ts`
  
- `prefer-type-fest-set-required.test.ts`
  
- `prefer-type-fest-simplify.test.ts`
  
- `prefer-type-fest-tagged-brands.test.ts`
  
- `prefer-type-fest-tuple-of.test.ts`
  
- `prefer-type-fest-unknown-array.test.ts`
  
- `prefer-type-fest-unknown-map.test.ts`
  
- `prefer-type-fest-unknown-record.test.ts`
  
- `prefer-type-fest-unknown-set.test.ts`
  
- `prefer-type-fest-unwrap-tagged.test.ts`
  
- `prefer-type-fest-value-of.test.ts`
  
- `prefer-type-fest-writable-deep.test.ts`
  
- `prefer-type-fest-writable.test.ts`

- 🎨 Improve readability and maintainability of test code by ensuring consistent naming conventions.


- [`475a43e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/475a43e989567f2e4c57633edf650a928ef71925 "📝 Diff: 12 files, ++28 | --18") — 🔧 [build] Update configuration and dependencies

- 🛠️ [fix] Update eslint-plugin-file-progress-2 to version 3.4.2

- 📝 [docs] Modify tsconfig files for improved declaration handling
  
- 🔧 Set "isolatedDeclarations" to true in tsconfig.build.json
  
- 🔧 Set "isolatedModules" to true in tsconfig.build.json
  
- 🔧 Enable "checkJs" and "erasableSyntaxOnly" in tsconfig.eslint.json and tsconfig.js.json

- 🚜 [refactor] Change exported types to internal types for better encapsulation
  
- 🔄 Change "export type UnionArrayLikeMatchMode" to "type UnionArrayLikeMatchMode" in array-like-expression.ts
  
- 🔄 Change "export type ImportedTypeAliasMatch" to "type ImportedTypeAliasMatch" in imported-type-aliases.ts
  
- 🔄 Change "export type ImportedValueAliasMap" to "type ImportedValueAliasMap" in imported-value-symbols.ts

- 🎨 [style] Update DEFAULT_RULE_DOCS_URL_BASE to a constant in rule-docs-url.ts


- [`9082660`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/90826605cb10f2a9ca47e47f8aafaa621e972e9b "📝 Diff: 84 files, ++490 | --141") — 🔧 [build] Add defaultOptions to multiple TypeScript rules


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


- [`528c601`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/528c601c385c557e677649bbaa06af894e6e9f82 "📝 Diff: 12 files, ++37 | --41") — 🔧 [build] Refactor benchmark and test configurations

- 🛠️ Update benchmark directory path to use `import.meta.dirname`

- 🛠️ Replace `null` checks with `!= null` for candidate variables in stress tests

- 🛠️ Modify ESLint stats calculation to use `Math.sumPrecise`

- 🛠️ Remove deprecated `no-constructor-bind` plugin from configurations

- 🛠️ Add benchmarks to ESLint and TypeScript configurations

- 🛠️ Update type definitions to use `Readonly<UnknownArray>` in tests

- 🛠️ Adjust Vite configuration to include benchmark files


- [`db80fb0`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db80fb0425ed6198b5e3c426c2632208081053ad "📝 Diff: 11 files, ++1026 | --559") — 🔧 [build] Update dependencies in package.json and package-lock.json

- 🛠️ Update `eslint-plugin-jsdoc` from `^62.7.0` to `^62.7.1` to incorporate the latest improvements and fixes.

- 🧹 Remove unused dependencies:
  
- `eslint-plugin-mdx` version `^3.6.2`
  
- `eslint-plugin-storybook` version `^10.2.11`
  
- `storybook` version `^10.2.11`

- 🔧 Clean up `package-lock.json` by removing entries for the removed dependencies and updating the lock file accordingly.

🧪 [test] Add unit tests for typed-rule internal helpers

- ✨ Introduce a new test file `typed-rule-internal.test.ts` to validate the behavior of the `isTestFilePath` function.

- 📝 Implement tests to ensure that various file paths do not get incorrectly identified as test files, covering a range of common file naming conventions.


- [`ba3b799`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ba3b799b909cd67fe3c334cfb9aec7da650e57a5 "📝 Diff: 28 files, ++78 | --78") — 🔧 [build] Update aliasReplacementFix checks for consistency across rules

- 🛠️ [fix] Change condition from `!replacementFix` to `replacementFix === null` in multiple rules to ensure clarity in reporting

- 🛠️ [fix] Adjust handling of `aliasReplacementFix` to check for `null` instead of using a truthy check in various rules


- [`46e0d73`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/46e0d732d26617586d5b1533da10fd9d729bec56 "📝 Diff: 75 files, ++75 | --0") — 🔧 [build] Mark rules as non-deprecated


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


- [`3ad591e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3ad591e4f8be1ffade32bc896ec0af34673ef703 "📝 Diff: 41 files, ++1335 | --1199") — 🔧 [build] Raises lint baseline and hardens rules

🔧 [build] Converts multiple previously disabled lint checks to warnings and adds extra markup/config warnings to catch quality issues earlier without blocking development.

- Improves incremental enforcement by surfacing problems sooner while avoiding abrupt error-level breakage.

🚜 [refactor] Reworks primitive-union detection to use parser-provided node-type constants and a set-backed type guard instead of string-switch matching.

- Improves type safety, reduces branching complexity, and keeps matching logic easier to maintain.

🎨 [style] Normalizes internal listener and helper formatting across authored rule implementations for consistency with stricter lint/style expectations.

🧪 [test] Refactors suites to a consistent structure, strengthens AST-node assertions with shared constants, and hardens metadata/import/assertion checks.

- Aligns edge-case expectations for suggestion behavior and escaped template placeholders to reduce brittle test outcomes.


- [`4f1aede`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4f1aede544912eba9af43a5078b774ede5845435 "📝 Diff: 4 files, ++469 | --224") — 🔧 [build] Update dependencies in package.json


- 📦 Upgrade @typescript-eslint/parser and @typescript-eslint/utils to version 8.56.1 for improved TypeScript support.

- 📦 Upgrade @typescript-eslint/eslint-plugin and @typescript-eslint/rule-tester to version 8.56.1 for better linting capabilities.

- 📦 Upgrade eslint to version 10.0.2 for bug fixes and performance improvements.

- 📦 Upgrade eslint-plugin-storybook to version 10.2.11 for enhanced Storybook integration.

- 📦 Upgrade storybook to version 10.2.11 for the latest features and fixes.

- 📦 Upgrade typescript-eslint to version 8.56.1 for consistency with other TypeScript ESLint packages.

- 📦 Update peerDependencies to require eslint version 10.0.2 for compatibility.


- [`28104ce`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/28104ce26257b19d12fb03c117832bb62fab0a26 "📝 Diff: 2 files, ++5 | --5") — 🔧 [build] Update Stryker configuration for improved testing

- Adjust `test:stryker` scripts to use `--ignoreStatic` flag for better performance

- Change `ignoreStatic` option in Stryker config to `false` for comprehensive mutant testing


- [`5f83e37`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5f83e378a295fcba40c50841f08b8e13223fba6a "📝 Diff: 2 files, ++8 | --2") — 🔧 [build] Update Stryker configuration and package.json scripts

- 🛠️ Remove outdated mutation testing scripts from package.json

- ✨ Add new Stryker testing scripts for improved mutation testing

- ⚡ Enhance Stryker configuration with ignoreStatic and disableTypeChecks options


- [`b934c2e`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b934c2e401cac9ef0889f3d606107b6ee6e0716e "📝 Diff: 2 files, ++3 | --74") — 🔧 [build] Update package.json and package-lock.json

- ✨ Add overrides for jsonc-eslint-parser to use version ^3.1.0

- 🔧 Remove unused dependencies from package-lock.json


- [`63355ae`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/63355ae568aabe9d928faa0d575643f48768d5fa "📝 Diff: 24 files, ++390 | --131") — 🔧 [build] Update dependencies in package.json

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


- [`e06b605`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e06b605ec157e48bdef1667bd9b7d29c594ee17a "📝 Diff: 2 files, ++350 | --229") — 🔧 [build] Update dependencies in package.json


- 🔄 Upgrade "@html-eslint/eslint-plugin" and "@html-eslint/parser" to version 0.56.0 for improved HTML linting capabilities.

- 🔄 Update "eslint" to version 10.0.1 to incorporate the latest fixes and features.

- 🔄 Upgrade "eslint-plugin-jsdoc" to version 62.7.0 for enhanced JSDoc support.

- 🔄 Update "eslint-plugin-jsonc" to version 3.0.0 for better JSONC linting.

- 🔄 Upgrade "jsonc-eslint-parser" to version 3.1.0 for improved JSONC parsing.

- 🔄 Update peer dependency "eslint" to version 10.0.1 to ensure compatibility with the latest changes.


- [`1dde506`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1dde506c1d63afe0a9d0ffc1ea7fb8d4722e1844 "📝 Diff: 2 files, ++7 | --7") — 🔧 [build] Update Stryker dependencies and package manager version

- Upgrade Stryker packages to version 9.5.1 for improved functionality

- Update package manager version to 11.10.1 for better compatibility


- [`5d2f382`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5d2f382a0e7cdbc2463d18c6f322c29f0d697ace "📝 Diff: 1 file, ++0 | --21") — 🔧 [build] Update Knip configuration to remove unnecessary dependencies

- Removed several unused dependencies from the Knip configuration to streamline the analysis process

- This change helps in reducing false positives and improving the accuracy of dependency tracking


- [`a4ac857`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a4ac8576e18b4a30ef54662a3857951dca1ac277 "📝 Diff: 10 files, ++8412 | --348") — 🔧 [build] Update TypeScript configuration for ESLint


- ✨ [feat] Include `knip.config.ts` in the TypeScript ESLint configuration

- 📂 This addition allows ESLint to recognize and lint the `knip.config.ts` file, ensuring consistent code quality and adherence to coding standards across the project.


- [`b1b30c3`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b1b30c3c1fb58329c11e49acbe4e84acae2d46c4 "📝 Diff: 4 files, ++11 | --188") — 🔧 [build] Force install dependencies in Docusaurus deployment workflow

- Updated npm install command to use --force for consistent dependency installation

📝 [docs] Clarify documentation for modern enhancements

- Revised package documentation to reflect subtle client-side interaction enhancements

🧹 [chore] Update lint-actionlint script configuration path

- Changed path for ActionLintConfig.yaml to use the repository root for better accessibility


- [`0d1b867`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0d1b867c174310b07659a43fbd41694ab4579337 "📝 Diff: 2 files, ++5 | --5") — 🔧 [build] Update npm-check-updates to version 19.4.0

- Upgraded the "npm-check-updates" package in both package.json and package-lock.json to ensure compatibility with the latest features and fixes.


- [`9327651`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/93276515f3fef321f4fea54d762fdf9d63ac07b5 "📝 Diff: 7 files, ++293 | --7") — 🔧 [build] Update Docusaurus configuration and add manifest file

- 🛠️ [fix] Implement ignoreKnownWebpackWarningsPlugin to suppress known webpack warnings

- 📝 [docs] Add manifest.json for PWA support with background color and icons

- 🔧 [build] Modify build:local script to include NODE_OPTIONS for deprecation warnings

- 🔧 [build] Update TypeDoc output path in typedoc.local.config.json


- [`a0fdbab`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a0fdbabd4429095440c4efd43d07829ace5b2afc "📝 Diff: 1 file, ++49 | --32") — 🔧 [build] Refactor TypeFest plugin types and configurations

- 🆕 Export `TypefestConfigName` and `TypefestPresetConfig` types for better clarity

- 🔄 Update `TypefestPlugin` and `TypefestConfigs` types to enhance type safety

- 🔧 Modify function signatures to use new types for improved consistency

- 📦 Adjust `typefestPlugin` structure to align with updated type definitions


- [`25224f5`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25224f59273e80a3b6231b8eaf954f164f3565f2 "📝 Diff: 2 files, ++8 | --8") — 🔧 [build] Update eslint-plugin-testing-library to version 7.16.0

- [dependency] Update version 7.16.0 in package.json and package-lock.json

- Update dependencies for compatibility with the latest ESLint versions


- [`ce485eb`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ce485eb271acb65d12753e772cdcd320572bdeab "📝 Diff: 71 files, ++1194 | --1193") — 🔧 [build] Refactor TypeFest ESLint rules for consistency and clarity

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


- [`df2ae2f`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/df2ae2f38b3f8c5d03b1737f5bf328a8132adc77 "📝 Diff: 1 file, ++143 | --130") — 🔧 [build] Refactor TypeFest ESLint rules for consistency and clarity


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


- [`ff78dc7`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ff78dc7d23858611fe280055f82504009732e61c "📝 Diff: 4 files, ++739 | --77") — 🔧 [build] Update dependencies for improved compatibility and features


- 📦 Upgrade "@typescript-eslint/utils" from "^8.55.0" to "^8.56.0" for enhanced TypeScript support.

- 📦 Upgrade "@eslint/js" from "^9.39.2" to "^10.0.1" to leverage the latest ESLint features and fixes.

- 📦 Upgrade "@typescript-eslint/eslint-plugin", "@typescript-eslint/parser", and "@typescript-eslint/rule-tester" from "^8.55.0" to "^8.56.0" for better linting capabilities.

- 📦 Upgrade "typescript-eslint" from "^8.55.0" to "^8.56.0" to ensure compatibility with the latest TypeScript features.

- 📦 Update peer dependency "eslint" from "^9.0.0" to "^10.0.0" to align with the latest ESLint version requirements.






