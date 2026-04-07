---
title: Docusaurus site contract
description: Build-time contract validation for the Docusaurus docs site, with repo-agnostic guidance for copied plugin repos.
---

# Docusaurus site contract

This repository keeps a source-level contract for its Docusaurus site that maintainers can validate manually during docs, lint, and release work.

The goal is to stop template drift early.

Instead of relying on maintainers to remember a long checklist of nav items, preset pages, inspector links, favicons, sidebar hooks, hero content, and repo-local validation entrypoints, the repository keeps those expectations in one contract file and validates them through thin script wrappers.

## Why this exists

A lot of the painful Docusaurus regressions in plugin templates are not single-file lint problems.

They are usually cross-file site-contract problems, such as:

- navbar order drifting away from the intended UX
- preset pages existing but not being linked from the sidebar or navbar
- logo, favicon, or manifest assets going stale
- sidebar styling hooks getting renamed without updating CSS
- repo-local validation wrappers disappearing during refactors
- inspector links or hero cards disappearing during refactors

That is why this feature is implemented as a dedicated validator script instead of an ESLint rule.

In other words: this is **not an ESLint rule**.

## What it validates

The current validator supports both structured Docusaurus config checks and generic source-file checks.

### Structured checks

These are the higher-confidence checks that inspect the actual Docusaurus config shape:

- required top-level config properties
- required plugins and themes
- client modules
- navbar items, order, positions, dropdown contents, and logo presence
- footer columns, titles, required links, item-count balance, and logo presence
- local search plugin options
- favicon and theme image presence

### File and source checks

These are repo-agnostic text and filesystem checks:

- required files exist
- manifest fields and icon files exist
- package scripts include required commands
- source files include required snippets
- source files forbid legacy snippets
- source files require regex patterns
- source files forbid regex patterns
- source snippets appear in a required order
- source regex matches appear in a required order

## CLI usage

From the repository root:

```bash
node scripts/validate-docusaurus-site-contract.mjs
```

You can also invoke the CLI directly:

```bash
node packages/docusaurus-site-contract/cli.mjs --config docs/docusaurus/site-contract.config.mjs
```

Validate a different contract file relative to a target repository root:

```bash
node scripts/validate-docusaurus-site-contract.mjs \
  --root ../your-plugin-repo \
  --config docs/docusaurus/site-contract.config.mjs
```

Emit machine-readable JSON for CI or editor tooling:

```bash
node scripts/validate-docusaurus-site-contract.mjs --json --config docs/docusaurus/site-contract.config.mjs
```

Show built-in help:

```bash
node scripts/validate-docusaurus-site-contract.mjs --help
```

## Core files

The feature is split into two real layers plus one repo-local contract:

1. `packages/docusaurus-site-contract/index.mjs`

- Generic validation engine.
- Vendored implementation source of truth.

2. `packages/docusaurus-site-contract/cli.mjs`

- Vendored CLI entrypoint.
- Supports `validate` behavior by default plus the `init` subcommand.
- Supports `--help`, `--json`, `--root`, and `--config`.

3. `docs/docusaurus/site-contract.config.mjs`
   - Repository-local blueprint.
   - Encodes this repository's actual Docusaurus expectations.

## How to reuse this without copying four files

Yes, there is an easier way.

The current repository layout keeps the validator out of `package.json` so copied plugin repos can remove it cleanly.

The intended local-private model is:

- generic engine + CLI in `packages/docusaurus-site-contract`
- thin repo-local wrappers in `scripts/`
- one repo-local contract file

That means the minimum durable setup is now:

1. the local private package under `packages/docusaurus-site-contract`
2. thin repo-local wrappers under `scripts/`
3. one repo-local contract file under `docs/docusaurus/`

If you are working inside a repo copied from this template, the package should already be present.

If you are retrofitting an existing repo, use the `init` command to vendor and wire it automatically.

## Using `init` in projects

If you are already inside a repo that has the repo-local wrappers:

```bash
node scripts/init-docusaurus-site-contract.mjs --root . --skip-vendor-package
```

If the target repository installs the package from npm or links it locally instead:

```bash
docusaurus-site-contract init --root . --skip-vendor-package
```

If you are bootstrapping a different ESLint-plugin repo from this template repository:

```bash
node scripts/init-docusaurus-site-contract.mjs --root ../your-eslint-plugin-repo
```

Preview the bootstrap without mutating files:

```bash
node scripts/init-docusaurus-site-contract.mjs --root . --skip-vendor-package --dry-run --json
```

By default, `init` will:

- vendor the private package into `packages/docusaurus-site-contract`
- create `scripts/docusaurus-site-contract.mjs`
- create `scripts/validate-docusaurus-site-contract.mjs`
- create `scripts/init-docusaurus-site-contract.mjs`
- generate `docs/docusaurus/site-contract.config.mjs`
- generate `docs/docusaurus/site-docs/developer/docusaurus-site-contract.md`
- register the guide in `docs/docusaurus/sidebars.ts` when the developer sidebar follows recognizable template structure
- add guide links to `docs/docusaurus/site-docs/developer/index.md` when that page uses recognizable headings

If those docs surfaces are heavily customized, `init` leaves them alone and you can wire the guide manually.

## Do I need to update the generated config before I run the script?

Usually: **yes, at least a little**.

The config written by `init` is intentionally a **starter contract**, not a perfect final one.

It now starts from the conservative side so that a typical ESLint-plugin docs site can adopt it without immediately failing on repo-specific choices that have not been decided yet.

That is important because sibling plugin docs sites already vary in real ways.

For example:

- `eslint-plugin-typefest` uses `minimal`, `recommended`, `recommended-type-checked`, `strict`, `all`, and focused family presets.
- `eslint-plugin-immutable-2` uses `functional-lite`, `functional`, `immutable`, `recommended`, and `all`.
- `eslint-plugin-copilot` keeps a simpler `minimal` / `recommended` / `strict` / `all` style and different developer/footer copy.

That means a new repo should not blindly inherit this repository's exact preset names, footer titles, hero text, or sidebar labels.

### Recommended process

1. Run `init`.
2. Open `docs/docusaurus/site-contract.config.mjs`.
3. Adjust the assumptions that are repo-specific:

- preset names
- navbar labels
- footer section titles
- package-specific badges and inspector links
- optional search-plugin and manifest rules
- any stricter source snippets that should be unique to the target repo

4. Then run `node scripts/validate-docusaurus-site-contract.mjs`.

If you skip that review step, the contract may be too strict for the new repo for the wrong reasons.

### What should stay optional in a new repo?

Treat these as optional until the target repo confirms them:

- exact preset names
- exact footer column names
- exact hero phrasing
- exact developer sidebar wording
- exact upstream package links

Treat these as strong default candidates:

- having a Docusaurus config file
- having a favicon / theme image / manifest
- keeping repo-local validation wrappers available
- requiring generated assets and key docs entry files to exist
- validating basic navbar/footer structure once the repo settles on names

Useful flags:

```bash
node packages/docusaurus-site-contract/cli.mjs init \
  --root . \
  --force \
  --owner acme \
  --repo eslint-plugin-example \
  --package-name eslint-plugin-example
```

- `--force` overwrites generated init files
- `--owner` overrides detected GitHub owner
- `--repo` overrides detected repository name
- `--package-name` overrides detected npm package name
- `--dry-run` previews changes without writing them
- `--skip-docs-guide` skips generating the maintainer guide page
- `--skip-docs-registration` skips patching the sidebar and developer index
- `--skip-vendor-package` assumes the package already exists in the target repo

This is the private local path I would recommend for template-derived repos.

## Published npm backup

For safekeeping, the package has also been published as:

- `docusaurus-site-contract@0.1.0`

That published package should be treated as a backup/distribution artifact, not the primary maintenance model for this template.

The preferred workflow for template-derived repos is still:

- keep the package vendored locally under `packages/docusaurus-site-contract`
- use `init` to scaffold and wire new repos
- customize the generated starter contract before enforcing repo-specific naming

## If you ever wanted to publish it anyway

The cleaner public-package distribution model would be:

1. publish the engine + CLI as a small dev-only package
2. keep only one repo-local contract file in the consumer repo
3. optionally provide an `init` command that patches scripts automatically

### Recommended consumer experience

In the target repo, the ideal setup should be:

```bash
npm i -D @your-scope/docusaurus-site-contract
```

Then add one small contract file:

```mjs
import { defineDocusaurusSiteContract } from "@your-scope/docusaurus-site-contract";

export default defineDocusaurusSiteContract({
  docusaurusConfig: {
    path: "docs/docusaurus/docusaurus.config.ts",
    requireFavicon: true,
  },
});
```

Then add one root script:

```json
{
  "scripts": {
    "docs:check-site-contract": "docusaurus-site-contract --config docs/docusaurus/site-contract.config.mjs"
  }
}
```

That means the consumer repo does **not** copy the engine, CLI, or local declaration files.

The public-package version of `init` would look like:

```bash
npx @your-scope/docusaurus-site-contract init \
  --owner acme \
  --repo eslint-plugin-example \
  --package eslint-plugin-example
```

That command should:

- create `docs/docusaurus/site-contract.config.mjs`
- add `docs:check-site-contract` to the root `package.json`
- optionally patch `docs/docusaurus/package.json` build scripts to run the check before `docusaurus build`
- print follow-up instructions instead of silently mutating unrelated files

If that ever exists, reuse becomes a one-command setup instead of a multi-file copy exercise.

### Why I would still not make this a Docusaurus plugin

I would package it as a **CLI/tooling package**, not as a normal Docusaurus runtime plugin.

Reason:

- some checks are outside `docusaurus.config.ts`
- some checks inspect arbitrary source files and docs pages
- some checks validate `package.json` scripts and manifest assets
- some checks should run before docs builds and in CI, not only inside a Docusaurus plugin lifecycle

So the right reuse model is:

- package = CLI + validation library
- consumer repo = one contract file + one script

Not:

- consumer repo copies engine files into `scripts/`
- or consumer repo tries to force everything through a runtime plugin hook

## Contract anatomy

A contract file exports either `default` or `siteContract`.

```mjs
export default {
  docusaurusConfig: {
    path: "docs/docusaurus/docusaurus.config.ts",
    requiredPluginNames: ["@docusaurus/plugin-pwa"],
    requiredThemeNames: ["@easyops-cn/docusaurus-search-local"],
    requireFavicon: true,
    navbar: {
      requireLogo: true,
      orderedItems: [
        {
          labelPattern: /Docs/v,
          position: "left",
          type: "dropdown",
        },
      ],
    },
  },
  manifestFiles: [
    {
      path: "docs/docusaurus/static/manifest.json",
      requiredFields: {
        name: "Your docs site",
      },
      requireExistingIconFiles: true,
    },
  ],
  packageJsonFiles: [
    {
      path: "docs/docusaurus/package.json",
      requiredScripts: [
        {
          name: "build",
          includes: "docs:check-site-contract",
        },
      ],
    },
  ],
  requiredFiles: [
    "docs/docusaurus/static/img/logo.svg",
  ],
  sourceFiles: [
    {
      path: "docs/docusaurus/src/js/modernEnhancements.ts",
      requiredSnippets: [
        'window.addEventListener("load", handleWindowLoad, { once: true });',
      ],
      forbiddenSnippets: [
        'document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);',
      ],
      orderedPatterns: [
        {
          description: "load bootstrap before export",
          pattern: /handleWindowLoad/v,
        },
        {
          description: "global assignment after bootstrap",
          pattern: /window\.initializeAdvancedFeatures/v,
        },
      ],
    },
  ],
};
```

### `docusaurusConfig`

Use this for structural assertions that should come from the parsed config rather than string matching.

This is the right place for things like:

- navbar order
- footer balance
- required search plugin options
- required plugin/theme names
- favicon presence

### `manifestFiles`

Use this for PWA/app metadata and icon integrity.

This is the right place for things like:

- required `name` and `short_name`
- minimum number of icons
- ensuring declared icon files actually exist

### `packageJsonFiles`

Use this when the docs site relies on scripts remaining wired together.

Examples:

- inspector prebuild scripts
- contract check integration before `docusaurus build`
- required docs workspace commands

### `requiredFiles`

Use this for assets or docs pages that must always exist.

Examples:

- logo and favicon assets
- preset pages
- site entry files
- maintainer docs pages

### `sourceFiles`

Use this for text-level invariants.

Supported checks:

- `requiredSnippets`
- `forbiddenSnippets`
- `orderedSnippets`
- `requiredPatterns`
- `forbiddenPatterns`
- `orderedPatterns`

Prefer structured checks when you can. Use source-text checks when the value is inherently file-local or intentionally literal.

## Repo-agnostic adoption checklist

When adopting this validator in another ESLint plugin repo:

1. Use `init` instead of manually copying engine files whenever possible.
2. Create or review the repo-local contract file instead of editing the engine.
3. Update paths, asset names, package scripts, and navbar/footer expectations.
4. Keep the starter contract conservative until the docs UX settles.
5. Add at least one passing test against the real repo and one failing fixture test.
6. Wire the check into docs build and release validation.

The engine should stay generic. Repository identity belongs in the contract file, not in the validator core.

## When to use source patterns vs structured config checks

Use structured config checks when the invariant is semantic and can be parsed reliably.

Good examples:

- “the navbar must include GitHub, Dev, and Blog in that order”
- “the footer must define three columns with balanced item counts”
- “the search plugin must keep the search bar on the left”

Use source-text checks when the invariant is intentionally literal or spans non-config files.

Good examples:

- “this CSS class hook must exist for sidebar styling”
- “this page must keep the hero card grid”
- “this runtime enhancement must bootstrap from `load`, not `DOMContentLoaded`”

## What not to encode here

Do not try to force everything into this validator.

This contract is good for stable structure and source-level conventions. It is not the right tool for:

- pixel-perfect layout guarantees
- rendered DOM slot order that only exists after theme composition
- animation details that need browser assertions
- subjective style preferences with high churn

If you need to enforce things like exact theme-toggle placement relative to search and custom navbar actions, use a swizzled component plus browser-level tests.

## Workflow integration in this repo

This repository intentionally keeps the contract available through manual entrypoints:

- `node scripts/validate-docusaurus-site-contract.mjs`
- `node scripts/init-docusaurus-site-contract.mjs`
- direct CLI access through `packages/docusaurus-site-contract/cli.mjs`

That keeps the feature easy to remove from template-derived repos while still making validation easy to run on demand.

## Related maintainer references

- [Developer docs index](../../docs/docusaurus/site-docs/developer/index.md)
- [GitHub Pages SEO and IndexNow deployment behavior](../../docs/docusaurus/site-docs/developer/deploy-pages-seo-and-indexnow.md)
