#!/usr/bin/env node

/**
 * @packageDocumentation
 * Repository-local wrapper that runs the vendored Docusaurus site contract CLI
 * manually without package.json script wiring.
 */

import { runCli } from "../packages/docusaurus-site-contract/cli.mjs";

await runCli(process.argv.slice(2));
