import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";

const expectedRuleTypes = new Set([
    "layout",
    "problem",
    "suggestion",
]);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

type RuleEntry = readonly [RuleName, RuleModule];
type RuleModule = (typeof typefestPlugin.rules)[RuleName];
type RuleName = keyof typeof typefestPlugin.rules;

describe("rule metadata integrity", () => {
    it("exports processors for plugin shape parity", () => {
        expect(typefestPlugin).toHaveProperty("processors");
        expect(typefestPlugin.processors).toEqual({});
    });

    it("enforces required metadata invariants for every rule", () => {
        const ruleEntries = Object.entries(typefestPlugin.rules) as RuleEntry[];

        expect(ruleEntries.length).toBeGreaterThan(0);

        for (const [ruleName, ruleModule] of ruleEntries) {
            const meta = ruleModule.meta;
            const defaultOptions =
                "defaultOptions" in ruleModule
                    ? (
                          ruleModule as RuleModule & {
                              defaultOptions?: unknown;
                          }
                      ).defaultOptions
                    : undefined;

            expect(meta, `Rule '${ruleName}' must define meta`).toBeDefined();

            if (meta) {
                const metaType = meta.type;
                const docs = meta.docs;
                const docsDescription = docs?.description;
                const docsUrl = docs?.url;
                const schema = meta.schema;
                const messages = meta.messages ?? {};

                expect(
                    isNonEmptyString(metaType) &&
                        expectedRuleTypes.has(metaType),
                    `Rule '${ruleName}' has unsupported meta.type '${String(metaType)}'`
                ).toBeTruthy();

                expect(
                    isNonEmptyString(docsDescription),
                    `Rule '${ruleName}' must provide a non-empty docs.description`
                ).toBeTruthy();

                expect(
                    isNonEmptyString(docsUrl),
                    `Rule '${ruleName}' must provide a non-empty docs.url`
                ).toBeTruthy();

                if (isNonEmptyString(docsUrl)) {
                    expect(
                        docsUrl.endsWith(`/docs/rules/${ruleName}.md`),
                        `Rule '${ruleName}' docs.url should end with /docs/rules/${ruleName}.md`
                    ).toBeTruthy();
                }

                expect(
                    Array.isArray(schema),
                    `Rule '${ruleName}' must declare a schema array`
                ).toBeTruthy();

                expect(
                    Array.isArray(defaultOptions),
                    `Rule '${ruleName}' must declare defaultOptions as an array`
                ).toBeTruthy();

                const messageEntries = Object.entries(messages);

                expect(
                    messageEntries.length,
                    `Rule '${ruleName}' must define at least one message`
                ).toBeGreaterThan(0);

                for (const [messageId, messageTemplate] of messageEntries) {
                    expect(
                        isNonEmptyString(messageTemplate),
                        `Rule '${ruleName}' message '${messageId}' must be a non-empty string`
                    ).toBeTruthy();
                }
            }
        }
    });
});
