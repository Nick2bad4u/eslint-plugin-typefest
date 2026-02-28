/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { readFileSync } from "node:fs";
import * as path from "node:path";

import { applySharedRuleTesterRunBehavior, repoPath } from "./ruleTester";

/**
 * Narrowed view of the shared run-behavior patcher used by typed tests.
 */
const applyRuleTesterRunBehavior = applySharedRuleTesterRunBehavior as (
    tester: Readonly<RuleTester>
) => RuleTester;

/** Absolute root directory for typed test fixtures. */
const typedFixturesRoot = repoPath("test", "fixtures", "typed");
/** Canonical line ending expected by RuleTester snapshots on Windows CI. */
const carriageReturnAndLineFeed = "\r\n";
/** Regex matching LF/CRLF line breaks for normalization. */
const lineFeedPattern = /\r?\n/gv;

/**
 * Normalize fixture source to CRLF line endings for stable RuleTester output
 * comparisons across platforms.
 *
 * @param fixtureSource - Raw fixture file contents.
 *
 * @returns Fixture source with normalized line endings.
 */
const normalizeLineEndingsForRuleTester = (fixtureSource: string): string =>
    fixtureSource.replaceAll(lineFeedPattern, carriageReturnAndLineFeed);

/**
 * Resolve a path inside `test/fixtures/typed`.
 *
 * @param segments - Optional nested fixture path segments.
 *
 * @returns Absolute fixture path.
 */
export const typedFixturePath = (...segments: readonly string[]): string =>
    path.join(typedFixturesRoot, ...segments);

/**
 * Read a typed fixture file as UTF-8 text.
 *
 * @param segments - Fixture path segments under `test/fixtures/typed`.
 *
 * @returns Fixture source text.
 */
export const readTypedFixture = (...segments: readonly string[]): string =>
    normalizeLineEndingsForRuleTester(
        readFileSync(typedFixturePath(...segments), "utf8")
    );

/**
 * Create a RuleTester configured for typed fixture tests.
 *
 * @returns Configured RuleTester instance.
 */
export const createTypedRuleTester = (): RuleTester =>
    applyRuleTesterRunBehavior(
        new RuleTester({
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    ecmaVersion: "latest",
                    projectService: {
                        allowDefaultProject: [
                            "file.ts",
                            "test/fixtures/typed/*.ts",
                            "test/fixtures/typed/tests/*.ts",
                        ],
                        defaultProject: "tsconfig.eslint.json",
                    },
                    sourceType: "module",
                    tsconfigRootDir: repoPath(),
                },
            },
        })
    );

/**
 * Shared typed RuleTester singleton for test modules.
 */
export const typedRuleTester: RuleTester = createTypedRuleTester();
