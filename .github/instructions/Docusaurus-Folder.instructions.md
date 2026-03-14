---
name: "Docusaurus-Typedoc-Folder-Guidelines"
description: "Guidance for the Docusaurus + TypeDoc documentation app under docs/docusaurus/."
applyTo: "docs/docusaurus/**"
---

# Docusaurus + TypeDoc (docs/docusaurus/) Guidelines

- Treat `docs/docusaurus/` as a self-contained Docusaurus website project that serves as the documentation hub for the repository.
  - Docusaurus configuration, theme, and pages live here.
  - TypeDoc integration is configured via `docs/docusaurus/typedoc.config.json` and related TS configs (for example `tsconfig.typedoc.json`).
  - Typedoc generates to `docs/docusaurus/site-docs/developer/api`, while hand-authored documents and pages live in `docs/docusaurus/src/pages`, `docs/docusaurus/site-docs` and `docs/rules`. Docusaurus connects the root docs to the site via configuration.
- Website and build setup:
  - From the repository root, prefer the `docusaurus:*` and `docs:*` npm scripts (e.g., `npm run docs:start`, `npm run docs:build`) so that TypeDoc and other generated assets are updated before the Docusaurus build.
  - Do not hand-edit generated TypeDoc output under `docs/docusaurus`; adjust source code or TypeDoc config instead.
- ESLint Config Inspector integration:
  - The ESLint configuration inspector is built via the using the eslint inspector build option. `"build:eslint-inspector": "npx -y @eslint/config-inspector@1.4.2 build --outDir \"docs/docusaurus/static/eslint-inspector\" --base \"/repo-name-here/eslint-inspector/\"",`
  - Do not modify the generated files in `static/eslint-inspector` by hand
- Configuration alignment:
  - Keep Docusaurus `docusaurus.config.ts` and TypeScript configs (`tsconfig.typedoc.json`, etc.) in sync with root TS/Vite settings and path aliases.
- Content:
  - Keep examples and snippets up to date with current code.
