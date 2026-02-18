/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "node:path";
import { afterAll, describe, it } from "vitest";

import typefestPlugin from "../../src/plugin";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe as unknown as typeof RuleTester.describe;
RuleTester.it = it as unknown as typeof RuleTester.it;
RuleTester.itOnly = it as unknown as typeof RuleTester.itOnly;

type PluginRuleModule = Parameters<RuleTester["run"]>[1];

/**
 * Resolve an absolute repository path from optional relative segments.
 *
 * @param segments - Optional path segments under the repository root.
 *
 * @returns Absolute path rooted at the current workspace.
 */
export const repoPath = (...segments: string[]): string =>
    path.join(process.cwd(), ...segments);

/**
 * Create a RuleTester instance configured for TypeScript parser usage.
 *
 * @returns Configured RuleTester instance.
 */
export const createRuleTester = (): RuleTester =>
    new RuleTester({
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    });

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

/**
 * Check whether a dynamic value looks like an ESLint rule module.
 *
 * @param value - Dynamic value loaded from plugin rule map.
 *
 * @returns `true` when value has a callable `create` method.
 */
const isRuleModule = (value: unknown): value is PluginRuleModule => {
    if (!isRecord(value)) {
        return false;
    }

    const maybeCreate = (value as { create?: unknown }).create;

    return typeof maybeCreate === "function";
};

/**
 * Lookup a rule module from the plugin by its unqualified rule id.
 *
 * @param ruleId - Rule id without the `typefest/` prefix.
 *
 * @returns Matching RuleTester-compatible rule module.
 */
export const getPluginRule = (ruleId: string): PluginRuleModule => {
    const { rules } = typefestPlugin;
    if (!rules) {
        throw new Error("typefestPlugin.rules must be defined");
    }

    const dynamicRules = rules as Record<string, unknown>;
    if (!Object.hasOwn(dynamicRules, ruleId)) {
        throw new Error(`Rule '${ruleId}' is not registered in typefestPlugin`);
    }

    const rule = dynamicRules[ruleId];

    if (!isRuleModule(rule)) {
        throw new Error(`Rule '${ruleId}' is not a valid ESLint rule module`);
    }

    return rule;
};
