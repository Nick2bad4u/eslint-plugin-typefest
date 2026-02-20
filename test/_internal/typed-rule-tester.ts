/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { readFileSync } from "node:fs";
import * as path from "node:path";

import { applySharedRuleTesterRunBehavior, repoPath } from "./ruleTester";

const applyRuleTesterRunBehavior = applySharedRuleTesterRunBehavior as (
    tester: RuleTester
) => RuleTester;

const typedFixturesRoot = repoPath("test", "fixtures", "typed");

/**
 * Resolve a path inside `test/fixtures/typed`.
 *
 * @param segments - Optional nested fixture path segments.
 *
 * @returns Absolute fixture path.
 */
export const typedFixturePath = (...segments: string[]): string =>
    path.join(typedFixturesRoot, ...segments);

/**
 * Read a typed fixture file as UTF-8 text.
 *
 * @param segments - Fixture path segments under `test/fixtures/typed`.
 *
 * @returns Fixture source text.
 */
export const readTypedFixture = (...segments: string[]): string =>
    readFileSync(typedFixturePath(...segments), "utf8");

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
export const typedRuleTester = createTypedRuleTester();
