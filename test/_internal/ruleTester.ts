/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "node:path";
import pc from "picocolors";
import { afterAll, describe, it } from "vitest";

import typefestPlugin from "../../src/plugin";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe as unknown as typeof RuleTester.describe;
RuleTester.it = it as unknown as typeof RuleTester.it;
const vitestItOnly = Reflect.get(it, "only") as typeof it;
RuleTester.itOnly = vitestItOnly as unknown as typeof RuleTester.itOnly;

type PluginRuleModule = Parameters<RuleTester["run"]>[1];
type RuleRunArguments = Parameters<RuleTester["run"]>;
type RuleRunCases = RuleRunArguments[2];
type RuleRunInvalidCase = RuleRunCases["invalid"][number];
type RuleRunValidCase = RuleRunCases["valid"][number];

const deriveGeneratedCaseName = (
    ruleName: string,
    caseKind: "invalid" | "valid",
    caseIndex: number,
    caseFilename?: string
): string => {
    const caseLabel = [
        pc.magentaBright("UNNAMED"),
        caseKind === "invalid" ? pc.red("invalid") : pc.green("valid"),
        pc.yellow(`#${String(caseIndex + 1)}`),
    ].join(" ");
    const caseSource = caseFilename
        ? pc.cyan(path.basename(caseFilename))
        : pc.blue(ruleName);

    return `${caseSource}${pc.dim(" - ")}${caseLabel}`;
};

const withGeneratedRuleCaseNames = (
    ruleName: string,
    runCases: RuleRunCases
): RuleRunCases => {
    const normalizedInvalidCases: RuleRunCases["invalid"] =
        runCases.invalid.map((entry: RuleRunInvalidCase, caseIndex) =>
            entry.name
                ? entry
                : {
                      ...entry,
                      name: deriveGeneratedCaseName(
                          ruleName,
                          "invalid",
                          caseIndex,
                          entry.filename
                      ),
                  }
        );

    const normalizedValidCases: RuleRunCases["valid"] = runCases.valid.map(
        (entry: RuleRunValidCase, caseIndex) => {
            if (typeof entry === "string") {
                return {
                    code: entry,
                    name: deriveGeneratedCaseName(ruleName, "valid", caseIndex),
                };
            }

            if (entry.name) {
                return entry;
            }

            return {
                ...entry,
                name: deriveGeneratedCaseName(
                    ruleName,
                    "valid",
                    caseIndex,
                    entry.filename
                ),
            };
        }
    );

    return {
        invalid: normalizedInvalidCases,
        valid: normalizedValidCases,
    };
};

const patchRuleTesterRunWithGeneratedCaseNames = (
    tester: RuleTester
): RuleTester => {
    const originalRun = tester.run.bind(tester);
    tester.run = ((ruleName, ruleModule, runCases) => {
        (originalRun as (...args: unknown[]) => void)(
            ruleName,
            ruleModule,
            withGeneratedRuleCaseNames(ruleName, runCases)
        );
    }) as RuleTester["run"];
    return tester;
};

/**
 * Apply shared RuleTester run behavior: prefer explicit per-case `name`, with
 * concise fallback names when omitted.
 *
 * @param tester - RuleTester instance to patch.
 *
 * @returns Patched tester instance.
 */
export const applySharedRuleTesterRunBehavior = (
    tester: RuleTester
): RuleTester => patchRuleTesterRunWithGeneratedCaseNames(tester);

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
    applySharedRuleTesterRunBehavior(
        new RuleTester({
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    ecmaVersion: "latest",
                    sourceType: "module",
                },
            },
        })
    );

/**
 * Check whether the input is record.
 *
 * @param value - Value to inspect.
 *
 * @returns `true` when the value is record; otherwise `false`.
 */

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
