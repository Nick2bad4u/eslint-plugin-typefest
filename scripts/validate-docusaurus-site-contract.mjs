#!/usr/bin/env node

/**
 * @packageDocumentation
 * Compatibility wrapper that delegates to the workspace-owned CLI entrypoint.
 */

import { runCli } from "../packages/docusaurus-site-contract/cli.mjs";

await runCli(process.argv.slice(2));
