# Unified Migration Guide — Shared Tooling Configs

Migrate a consuming repository to all five shared `nick2bad4u` tooling presets.
Run each section independently or use the [combined script](#6-combined-migration-script).

All commands must be executed from the **root of the consuming repository**.

---

1. [1. Prettier Migration](#1-prettier-migration)
2. [2. Remark Migration](#2-remark-migration)
3. [3. Stylelint Migration](#3-stylelint-migration)
4. [4. Secretlint Migration](#4-secretlint-migration)
5. [5. ESLint Migration](#5-eslint-migration)
6. [6. Combined Migration Script](#6-combined-migration-script)
7. [7. Combined Migration Script (No ESLint)](#7-combined-migration-script-no-eslint)
8. [8. Final Notes](#8-final-notes)

---

## 1. Prettier Migration

Migrate to `prettier-config-nick2bad4u`, removing local plugin dependencies and replacing local config files.

```powershell
Write-Host "`n🔧 Starting Prettier migration..." -ForegroundColor Cyan

# 1) Remove Prettier plugins now bundled by the shared config
$sharedPrettierDeps = @(
    "prettier-plugin-jsdoc-type",
    "@softonus/prettier-plugin-duplicate-remover",
    "prettier-plugin-ini",
    "prettier-plugin-interpolated-html-tags",
    "prettier-plugin-jsdoc",
    "prettier-plugin-merge",
    "prettier-plugin-multiline-arrays",
    "prettier-plugin-packagejson",
    "prettier-plugin-properties",
    "prettier-plugin-sh",
    "prettier-plugin-sort-json",
    "prettier-plugin-sql",
    "prettier-plugin-toml"
)
npm uninstall $sharedPrettierDeps --force

# 2) Install shared config + Prettier peer
npm install --save-dev prettier prettier-config-nick2bad4u --force

# 3) Write new config
@'
import prettierConfig from "prettier-config-nick2bad4u";

/** @type {import("prettier").Config} */
const localConfig = {
    ...prettierConfig,
};

export default localConfig;
'@ | Set-Content -Path "prettier.config.mjs" -Encoding utf8

# 4) Remove legacy config files
Remove-Item ".prettierrc", ".prettierrc.json", ".prettierrc.mjs", "prettier.config.js", "prettier.config.cjs", "prettier.config.ts" -ErrorAction SilentlyContinue

# 5) Verify
npx prettier . --check

Write-Host "`n🎉 Prettier migration complete!" -ForegroundColor Green
```

---

## 2. Remark Migration

Migrate to `remark-config-nick2bad4u`, removing local remark plugins and replacing config with the shared preset.

```powershell
Write-Host "`n🔧 Starting Remark migration..." -ForegroundColor Cyan

# 1) Remove remark deps now owned by the shared config
$pkg = Get-Content .\package.json -Raw | ConvertFrom-Json
$names = @(
    $pkg.dependencies.PSObject.Properties.Name
    $pkg.devDependencies.PSObject.Properties.Name
) | Sort-Object -Unique

$keep   = @("remark", "remark-cli", "remark-config-nick2bad4u")
$remove = $names | Where-Object {
    (($_ -match '^remark($|-)') -or ($_ -eq 'unified')) -and ($_ -notin $keep)
}

if ($remove.Count -gt 0) {
    npm uninstall $remove --force
} else {
    Write-Host "✔️ No managed remark deps found to remove."
}

# 2) Install shared preset + remark + remark-cli
npm install --save-dev remark-config-nick2bad4u remark remark-cli

# 3) Write new .remarkrc.mjs
@'
import { createConfig } from "remark-config-nick2bad4u";

/** @type {import("remark-config-nick2bad4u").RemarkConfig} */
const remarkConfig = createConfig({
    settings: {},
    plugins: [],
});

export default remarkConfig;
'@ | Set-Content .\.remarkrc.mjs -Encoding UTF8

# 4) Remove legacy config files
Remove-Item ".remarkrc", ".remarkrc.js", ".remarkrc.cjs", ".remarkrc.json" -Force -ErrorAction SilentlyContinue

# 5) Add recommended scripts
npm pkg set "scripts.lint:remark=remark . --frail --ignore-path .remarkignore"
npm pkg set "scripts.lint:remark:fix=remark . --ignore-path .remarkignore --output"

# 6) Verify
npx remark . --frail --ignore-path .remarkignore

Write-Host "`n🎉 Remark migration complete!" -ForegroundColor Green
```

---

## 3. Stylelint Migration

Migrate to `stylelint-config-nick2bad4u`, removing local stylelint ecosystem packages and replacing config.

```powershell
Write-Host "`n🔧 Starting Stylelint migration..." -ForegroundColor Cyan

# 1) Detect and uninstall managed stylelint deps
$pkg      = Get-Content package.json -Raw | ConvertFrom-Json
$depNames = @()
if ($pkg.dependencies)    { $depNames += $pkg.dependencies.PSObject.Properties.Name }
if ($pkg.devDependencies) { $depNames += $pkg.devDependencies.PSObject.Properties.Name }

$managedRegex = '^(stylelint($|-)|@stylistic/stylelint-plugin$|@stylelint-types/stylelint-(order|stylistic)$|@double-great/stylelint-a11y$|postcss-(html|scss|styled-jsx|styled-syntax)$)'
$toRemove = $depNames | Sort-Object -Unique | Where-Object {
    $_ -match $managedRegex -and
    $_ -ne 'stylelint-config-nick2bad4u' -and
    $_ -ne 'stylelint'
}

if ($toRemove.Count -gt 0) {
    npm uninstall $toRemove --force
} else {
    Write-Host "✔️ No managed stylelint deps found to remove."
}

# 2) Install shared config + peer stylelint
npm install --save-dev stylelint-config-nick2bad4u stylelint --force

# 3) Write new stylelint.config.mjs
@'
import sharedConfig from "stylelint-config-nick2bad4u";

/** @type {import("stylelint").Config} */
const stylelintConfig = {
    ...sharedConfig,
};

export default stylelintConfig;
'@ | Set-Content -Path .\stylelint.config.mjs -Encoding utf8

# 4) Remove legacy config files
Get-ChildItem -Force -Name .stylelintrc* | ForEach-Object {
    Remove-Item $_ -Force -ErrorAction SilentlyContinue
}

# 5) Verify
npx stylelint "**/*.{css,scss,sass}" --allow-empty-input

Write-Host "`n🎉 Stylelint migration complete!" -ForegroundColor Green
```

---

## 4. Secretlint Migration

Migrate to `secretlint-config-nick2bad4u`, removing local rule packages and replacing config.

```powershell
Write-Host "`n🔧 Starting Secretlint migration..." -ForegroundColor Cyan

# 1) Uninstall Secretlint rule deps now handled by the shared config
npm uninstall --save-dev --force `
    @secretlint/secretlint-rule-anthropic `
    @secretlint/secretlint-rule-aws `
    @secretlint/secretlint-rule-database-connection-string `
    @secretlint/secretlint-rule-gcp `
    @secretlint/secretlint-rule-github `
    @secretlint/secretlint-rule-no-dotenv `
    @secretlint/secretlint-rule-no-homedir `
    @secretlint/secretlint-rule-npm `
    @secretlint/secretlint-rule-openai `
    @secretlint/secretlint-rule-pattern `
    @secretlint/secretlint-rule-preset-recommend `
    @secretlint/secretlint-rule-privatekey `
    @secretlint/secretlint-rule-secp256k1-privatekey `
    @secretlint/types

# 2) Install shared config
npm install --save-dev secretlint secretlint-config-nick2bad4u --force

# 3) Write new .secretlintrc.cjs
@'
const sharedConfig = require("secretlint-config-nick2bad4u/secretlintrc.json");

/** @type {import("@secretlint/types").SecretLintConfigDescriptor} */
const secretlintConfig = {
    ...sharedConfig,
    rules: [
        ...sharedConfig.rules,
    ],
};

module.exports = secretlintConfig;
'@ | Set-Content -Path ".secretlintrc.cjs" -Encoding utf8

# 4) Remove legacy config files
Remove-Item ".secretlintrc.json", ".secretlintrc.yaml", ".secretlintrc.yml", ".secretlintrc.js" -ErrorAction SilentlyContinue

# 5) Update any package.json scripts that reference the old config filename
$package = Get-Content .\package.json -Raw | ConvertFrom-Json -AsHashtable
foreach ($scriptName in @($package.scripts.Keys)) {
    $package.scripts[$scriptName] = $package.scripts[$scriptName].Replace('.secretlintrc.json', '.secretlintrc.cjs')
}
$package | ConvertTo-Json -Depth 100 | Set-Content .\package.json

# 6) Verify
npx secretlint --secretlintrc .secretlintrc.cjs --secretlintignore .gitignore "**/*"

Write-Host "`n🎉 Secretlint migration complete!" -ForegroundColor Green
```

---

## 5. ESLint Migration

Migrate to `eslint-config-nick2bad4u`, removing all local plugin dependencies and replacing the flat config.

```powershell
Write-Host "`n🔧 Starting ESLint migration..." -ForegroundColor Cyan

# 1) Remove plugins now bundled by the shared config
$eslintPlugins = @(
    "@eslint/css",
    "@eslint/json",
    "@eslint/markdown",
    "@html-eslint/eslint-plugin",
    "@html-eslint/parser",
    "@stylistic/eslint-plugin",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "eslint-config-prettier",
    "eslint-plugin-canonical",
    "eslint-plugin-comment-length",
    "eslint-plugin-de-morgan",
    "eslint-plugin-eslint-comments",
    "eslint-plugin-eslint-plugin",
    "eslint-plugin-import-x",
    "eslint-plugin-jsdoc",
    "eslint-plugin-jsonc",
    "eslint-plugin-math",
    "eslint-plugin-n",
    "eslint-plugin-no-only-tests",
    "eslint-plugin-perfectionist",
    "eslint-plugin-prefer-arrow",
    "eslint-plugin-prettier",
    "eslint-plugin-promise",
    "eslint-plugin-regexp",
    "eslint-plugin-security",
    "eslint-plugin-sonarjs",
    "eslint-plugin-testing-library",
    "eslint-plugin-unicorn",
    "eslint-plugin-unused-imports",
    "eslint-plugin-vitest",
    "eslint-plugin-write-good-comments",
    "typescript-eslint"
)
npm uninstall @($eslintPlugins)

# 2) Install shared config
npm install --save-dev eslint-config-nick2bad4u --force

# 3) Write new eslint.config.mjs
@'
import nick2bad4u from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nick2bad4u.configs.all,
];

export default config;
'@ | Set-Content -Path "eslint.config.mjs" -Encoding utf8

# 4) Verify
npm run lint

Write-Host "`n🎉 ESLint migration complete!" -ForegroundColor Green
```

---

## 6. Combined Migration Script

Run all five migrations in sequence. Pass the absolute path to the repository root.

```powershell
# Update Deps

Write-Host "`n🔧 Updating dependencies..." -ForegroundColor Cyan
npm run update-deps

# ── Prettier ─────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Prettier migration..." -ForegroundColor Cyan

$sharedPrettierDeps = @(
  "prettier-plugin-jsdoc-type",
  "@softonus/prettier-plugin-duplicate-remover",
  "prettier-plugin-ini",
  "prettier-plugin-interpolated-html-tags",
  "prettier-plugin-jsdoc",
  "prettier-plugin-merge",
  "prettier-plugin-multiline-arrays",
  "prettier-plugin-packagejson",
  "prettier-plugin-properties",
  "prettier-plugin-sh",
  "prettier-plugin-sort-json",
  "prettier-plugin-sql",
  "prettier-plugin-toml"
)
npm uninstall $sharedPrettierDeps --force
npm install --save-dev prettier prettier-config-nick2bad4u --force
@'
import prettierConfig from "prettier-config-nick2bad4u";

/** @type {import("prettier").Config} */
const localConfig = {
    ...prettierConfig,
};

export default localConfig;
'@ | Set-Content -Path "prettier.config.mjs" -Encoding utf8
Remove-Item ".prettierrc",".prettierrc.json",".prettierrc.mjs","prettier.config.js","prettier.config.cjs","prettier.config.ts" -ErrorAction SilentlyContinue
npx prettier . --check

# ── Remark ───────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Remark migration..." -ForegroundColor Cyan

$pkg = Get-Content .\package.json -Raw | ConvertFrom-Json
$names = @(
  $pkg.dependencies.PSObject.Properties.Name
  $pkg.devDependencies.PSObject.Properties.Name
) | Sort-Object -Unique
$keep = @("remark","remark-cli","remark-config-nick2bad4u")
$remove = $names | Where-Object {
  (($_ -match '^remark($|-)') -or ($_ -eq 'unified')) -and ($_ -notin $keep)
}
if ($remove.Count -gt 0) { npm uninstall $remove --force }

npm install --save-dev remark-config-nick2bad4u remark remark-cli --force
@'
import { createConfig } from "remark-config-nick2bad4u";

/** @type {import("remark-config-nick2bad4u").RemarkConfig} */
const remarkConfig = createConfig({
    settings: {},
    plugins: [],
});

export default remarkConfig;
'@ | Set-Content .\.remarkrc.mjs -Encoding UTF8
Remove-Item ".remarkrc",".remarkrc.js",".remarkrc.cjs",".remarkrc.json" -Force -ErrorAction SilentlyContinue
npm pkg Set-Variable "scripts.lint:remark=remark . --frail --ignore-path .remarkignore"
npm pkg Set-Variable "scripts.lint:remark:fix=remark . --ignore-path .remarkignore --output"
npx remark . --frail --ignore-path .remarkignore

# ── Stylelint ─────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Stylelint migration..." -ForegroundColor Cyan

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$depNames = @()
if ($pkg.dependencies) { $depNames += $pkg.dependencies.PSObject.Properties.Name }
if ($pkg.devDependencies) { $depNames += $pkg.devDependencies.PSObject.Properties.Name }
$managedRegex = '^(stylelint($|-)|@stylistic/stylelint-plugin$|@stylelint-types/stylelint-(order|stylistic)$|@double-great/stylelint-a11y$|postcss-(html|scss|styled-jsx|styled-syntax)$)'
$toRemove = $depNames | Sort-Object -Unique | Where-Object {
  $_ -match $managedRegex -and
  $_ -ne 'stylelint-config-nick2bad4u' -and
  $_ -ne 'stylelint'
}
if ($toRemove.Count -gt 0) { npm uninstall $toRemove --force }

npm install --save-dev stylelint-config-nick2bad4u stylelint --force
@'
import sharedConfig from "stylelint-config-nick2bad4u";

/** @type {import("stylelint").Config} */
const stylelintConfig = {
    ...sharedConfig,
};

export default stylelintConfig;
'@ | Set-Content -Path .\stylelint.config.mjs -Encoding utf8
Get-ChildItem -Force -Name .stylelintrc* | ForEach-Object { Remove-Item $_ -Force -ErrorAction SilentlyContinue }
npx stylelint "**/*.{css,scss,sass}" --allow-empty-input

# ── Secretlint ────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Secretlint migration..." -ForegroundColor Cyan

npm uninstall --save-dev --force `
   @secretlint/secretlint-rule-anthropic `
   @secretlint/secretlint-rule-aws `
   @secretlint/secretlint-rule-database-connection-string `
   @secretlint/secretlint-rule-gcp `
   @secretlint/secretlint-rule-github `
   @secretlint/secretlint-rule-no-dotenv `
   @secretlint/secretlint-rule-no-homedir `
   @secretlint/secretlint-rule-npm `
   @secretlint/secretlint-rule-openai `
   @secretlint/secretlint-rule-pattern `
   @secretlint/secretlint-rule-preset-recommend `
   @secretlint/secretlint-rule-privatekey `
   @secretlint/secretlint-rule-secp256k1-privatekey `
   @secretlint/types
npm install --save-dev secretlint secretlint-config-nick2bad4u --force
@'
const sharedConfig = require("secretlint-config-nick2bad4u/secretlintrc.json");

/** @type {import("@secretlint/types").SecretLintConfigDescriptor} */
const secretlintConfig = {
    ...sharedConfig,
    rules: [
        ...sharedConfig.rules,
    ],
};

module.exports = secretlintConfig;
'@ | Set-Content -Path ".secretlintrc.cjs" -Encoding utf8
Remove-Item ".secretlintrc.json",".secretlintrc.yaml",".secretlintrc.yml",".secretlintrc.js" -ErrorAction SilentlyContinue
$package = Get-Content .\package.json -Raw | ConvertFrom-Json -AsHashTable
foreach ($scriptName in @($package.scripts.Keys)) {
  $package.scripts[$scriptName] = $package.scripts[$scriptName].Replace('.secretlintrc.json','.secretlintrc.cjs')
}
$package | ConvertTo-Json -Depth 100 | Set-Content .\package.json
npx secretlint --secretlintrc .secretlintrc.cjs --secretlintignore .gitignore "**/*"

# ── ESLint ────────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting ESLint migration..." -ForegroundColor Cyan

$eslintPlugins = @(
  "@eslint/css",
  "@eslint/json",
  "@eslint/markdown",
  "@html-eslint/eslint-plugin",
  "@html-eslint/parser",
  "@stylistic/eslint-plugin",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "eslint-config-prettier",
  "eslint-plugin-canonical",
  "eslint-plugin-comment-length",
  "eslint-plugin-de-morgan",
  "eslint-plugin-eslint-comments",
  "eslint-plugin-eslint-plugin",
  "eslint-plugin-import-x",
  "eslint-plugin-jsdoc",
  "eslint-plugin-jsonc",
  "eslint-plugin-math",
  "eslint-plugin-n",
  "eslint-plugin-no-only-tests",
  "eslint-plugin-perfectionist",
  "eslint-plugin-prefer-arrow",
  "eslint-plugin-prettier",
  "eslint-plugin-promise",
  "eslint-plugin-regexp",
  "eslint-plugin-security",
  "eslint-plugin-sonarjs",
  "eslint-plugin-testing-library",
  "eslint-plugin-unicorn",
  "eslint-plugin-unused-imports",
  "eslint-plugin-vitest",
  "eslint-plugin-write-good-comments",
  "typescript-eslint"
)
npm uninstall @($eslintPlugins) --force
npm install --save-dev eslint-config-nick2bad4u --force
@'
import nick2bad4u from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nick2bad4u.configs.all,
];

export default config;
'@ | Set-Content -Path "eslint.config.mjs" -Encoding utf8
npm run lint

Write-Host "`n🎉 All migrations complete!" -ForegroundColor Green

Write-Host "Migration complete! Review the new eslint.config.mjs and adjust presets or add overrides as needed. Make sure to add "**/*", "**/.*" to your tsconfig.eslint.json include if you haven't already." -ForegroundColor Green
```

---

## 7. Combined Migration Script (No ESLint)

```powershell
# Update Deps

Write-Host "`n🔧 Updating dependencies..." -ForegroundColor Cyan
npm run update-deps

# ── Prettier ─────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Prettier migration..." -ForegroundColor Cyan

$sharedPrettierDeps = @(
  "prettier-plugin-jsdoc-type",
  "@softonus/prettier-plugin-duplicate-remover",
  "prettier-plugin-ini",
  "prettier-plugin-interpolated-html-tags",
  "prettier-plugin-jsdoc",
  "prettier-plugin-merge",
  "prettier-plugin-multiline-arrays",
  "prettier-plugin-packagejson",
  "prettier-plugin-properties",
  "prettier-plugin-sh",
  "prettier-plugin-sort-json",
  "prettier-plugin-sql",
  "prettier-plugin-toml"
)
npm uninstall $sharedPrettierDeps --force
npm install --save-dev prettier prettier-config-nick2bad4u --force
@'
import prettierConfig from "prettier-config-nick2bad4u";

/** @type {import("prettier").Config} */
const localConfig = {
    ...prettierConfig,
};

export default localConfig;
'@ | Set-Content -Path "prettier.config.mjs" -Encoding utf8
Remove-Item ".prettierrc",".prettierrc.json",".prettierrc.mjs","prettier.config.js","prettier.config.cjs","prettier.config.ts" -ErrorAction SilentlyContinue
npx prettier . --check

# ── Remark ───────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Remark migration..." -ForegroundColor Cyan

$pkg = Get-Content .\package.json -Raw | ConvertFrom-Json
$names = @(
  $pkg.dependencies.PSObject.Properties.Name
  $pkg.devDependencies.PSObject.Properties.Name
) | Sort-Object -Unique
$keep = @("remark","remark-cli","remark-config-nick2bad4u")
$remove = $names | Where-Object {
  (($_ -match '^remark($|-)') -or ($_ -eq 'unified')) -and ($_ -notin $keep)
}
if ($remove.Count -gt 0) { npm uninstall $remove --force }

npm install --save-dev remark-config-nick2bad4u remark remark-cli --force
@'
import { createConfig } from "remark-config-nick2bad4u";

/** @type {import("remark-config-nick2bad4u").RemarkConfig} */
const remarkConfig = createConfig({
    settings: {},
    plugins: [],
});

export default remarkConfig;
'@ | Set-Content .\.remarkrc.mjs -Encoding UTF8
Remove-Item ".remarkrc",".remarkrc.js",".remarkrc.cjs",".remarkrc.json" -Force -ErrorAction SilentlyContinue
npm pkg Set-Variable "scripts.lint:remark=remark . --frail --ignore-path .remarkignore"
npm pkg Set-Variable "scripts.lint:remark:fix=remark . --ignore-path .remarkignore --output"
npx remark . --frail --ignore-path .remarkignore

# ── Stylelint ─────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Stylelint migration..." -ForegroundColor Cyan

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$depNames = @()
if ($pkg.dependencies) { $depNames += $pkg.dependencies.PSObject.Properties.Name }
if ($pkg.devDependencies) { $depNames += $pkg.devDependencies.PSObject.Properties.Name }
$managedRegex = '^(stylelint($|-)|@stylistic/stylelint-plugin$|@stylelint-types/stylelint-(order|stylistic)$|@double-great/stylelint-a11y$|postcss-(html|scss|styled-jsx|styled-syntax)$)'
$toRemove = $depNames | Sort-Object -Unique | Where-Object {
  $_ -match $managedRegex -and
  $_ -ne 'stylelint-config-nick2bad4u' -and
  $_ -ne 'stylelint'
}
if ($toRemove.Count -gt 0) { npm uninstall $toRemove --force }

npm install --save-dev stylelint-config-nick2bad4u stylelint --force
@'
import sharedConfig from "stylelint-config-nick2bad4u";

/** @type {import("stylelint").Config} */
const stylelintConfig = {
    ...sharedConfig,
};

export default stylelintConfig;
'@ | Set-Content -Path .\stylelint.config.mjs -Encoding utf8
Get-ChildItem -Force -Name .stylelintrc* | ForEach-Object { Remove-Item $_ -Force -ErrorAction SilentlyContinue }
npx stylelint "**/*.{css,scss,sass}" --allow-empty-input

# ── Secretlint ────────────────────────────────────────────────────────────────
Write-Host "`n🔧 Starting Secretlint migration..." -ForegroundColor Cyan

npm uninstall --save-dev --force `
   @secretlint/secretlint-rule-anthropic `
   @secretlint/secretlint-rule-aws `
   @secretlint/secretlint-rule-database-connection-string `
   @secretlint/secretlint-rule-gcp `
   @secretlint/secretlint-rule-github `
   @secretlint/secretlint-rule-no-dotenv `
   @secretlint/secretlint-rule-no-homedir `
   @secretlint/secretlint-rule-npm `
   @secretlint/secretlint-rule-openai `
   @secretlint/secretlint-rule-pattern `
   @secretlint/secretlint-rule-preset-recommend `
   @secretlint/secretlint-rule-privatekey `
   @secretlint/secretlint-rule-secp256k1-privatekey `
   @secretlint/types
npm install --save-dev secretlint secretlint-config-nick2bad4u --force
@'
const sharedConfig = require("secretlint-config-nick2bad4u/secretlintrc.json");

/** @type {import("@secretlint/types").SecretLintConfigDescriptor} */
const secretlintConfig = {
    ...sharedConfig,
    rules: [
        ...sharedConfig.rules,
    ],
};

module.exports = secretlintConfig;
'@ | Set-Content -Path ".secretlintrc.cjs" -Encoding utf8
Remove-Item ".secretlintrc.json",".secretlintrc.yaml",".secretlintrc.yml",".secretlintrc.js" -ErrorAction SilentlyContinue
$package = Get-Content .\package.json -Raw | ConvertFrom-Json -AsHashTable
foreach ($scriptName in @($package.scripts.Keys)) {
  $package.scripts[$scriptName] = $package.scripts[$scriptName].Replace('.secretlintrc.json','.secretlintrc.cjs')
}
$package | ConvertTo-Json -Depth 100 | Set-Content .\package.json
npx secretlint --secretlintrc .secretlintrc.cjs --secretlintignore .gitignore "**/*"

Write-Host "`n🎉 All migrations complete! (No ESLint)" -ForegroundColor Green

Write-Host "Migration complete! Review the new eslint.config.mjs and adjust presets or add overrides as needed. Make sure to add "**/*", "**/.*" to your tsconfig.eslint.json include if you haven't already." -ForegroundColor Green
```

---

## 8. Final Notes

- Each section can be run independently per repository, or use the [combined script](#6-combined-migration-script) to apply all five at once.
- Ensure `tsconfig.eslint.json` exists in the repository root before running the ESLint migration.
- Ensure `.remarkignore` and `.gitignore` are accurate before running the Remark and Secretlint migrations.
- After all migrations, run a full workspace lint check:

  ```bash
  npm run lint --workspaces --if-present
  ```
