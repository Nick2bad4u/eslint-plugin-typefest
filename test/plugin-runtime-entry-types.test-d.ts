/**
 * @packageDocumentation
 * Type-level contract tests for runtime entrypoint declarations.
 */
import type { ESLint } from "eslint";

import { assertType } from "vitest";

import plugin from "../plugin.mjs";

assertType<ESLint.Plugin>(plugin);

assertType<ESLint.Plugin["configs"] | undefined>(plugin.configs);
assertType<string | undefined>(plugin.meta?.name);
assertType<string | undefined>(plugin.meta?.version);
assertType<ESLint.Plugin["rules"] | undefined>(plugin.rules);
