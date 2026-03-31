# docusaurus-site-contract

Internal workspace package that owns the reusable Docusaurus site-contract validator used by this template repository.

It is designed to stay reusable across **ESLint plugin repositories that use Docusaurus** without forcing every copied repo to keep the validator implementation scattered across `scripts/`, docs files, and one-off utilities.

## Purpose

This package centralizes the validation engine and CLI so copied repositories do not need to keep the implementation split across multiple unrelated root files.

The intended long-term reuse model is:

- keep the validator engine and CLI in a package
- keep one repo-local contract file near the docs site
- keep one root script that runs the contract check

## Exports

### Library

```mjs
import {
  defineDocusaurusSiteContract,
  formatDocusaurusSiteContractViolations,
  validateDocusaurusSiteContract,
} from "docusaurus-site-contract";
```

### CLI

```bash
docusaurus-site-contract --config docs/docusaurus/site-contract.config.mjs
```

### Init bootstrap

#### When the package is already vendored in the repo

```bash
node packages/docusaurus-site-contract/cli.mjs init --root . --skip-vendor-package
```

#### When the package is installed from npm or linked locally

```bash
docusaurus-site-contract init --root . --skip-vendor-package
```

#### When bootstrapping another ESLint-plugin repo from a template repo that already has the package

```bash
node packages/docusaurus-site-contract/cli.mjs init --root ../your-eslint-plugin-repo
```

Preview changes without writing files:

```bash
docusaurus-site-contract init --root . --skip-vendor-package --dry-run --json
```

The `init` subcommand is intended for private local reuse across template-derived
repositories. It can:

- vendor the local package into `packages/docusaurus-site-contract`
- create `docs/docusaurus/site-contract.config.mjs`
- create a maintainer guide page under `docs/docusaurus/site-docs/developer/`
- patch root/docs workspace package scripts
- register the maintainer guide in `sidebars.ts` and `site-docs/developer/index.md` when those files use recognizable template structure

## Starter-contract philosophy

The generated contract is intentionally a **starter**.

It should enforce stable site structure early, but it should not assume every copied
plugin repo has the exact same preset names, footer titles, navbar wording, or hero copy.

The starter now intentionally defaults to conservative checks that most ESLint plugin
docs sites can support quickly. Stronger expectations, such as manifest validation,
search-plugin assertions, or repo-specific navbar/footer wording, should be added by the
repo-local contract after the target repo settles on its final docs UX.

After running `init`, review `docs/docusaurus/site-contract.config.mjs` and tighten the
repo-specific expectations before treating failures as the final docs-site policy.

## Notes

- This package is currently `private` because it is intended to ship inside this template repository first.
- If you later publish it to npm, review the package name, README examples, and release workflow first.
