import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-if.test` behavior.
 */
import { describe, expect, it, vi } from "vitest";

import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-if.valid.ts";
const namespaceValidFixtureName = "prefer-type-fest-if.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-if.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        '} from "type-aliases";\r\n',
        '} from "type-aliases";\nimport type { IsAny } from "type-fest";\r\n'
    )
    .replace("IfAny<", "IsAny<");
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode
    .replace(
        'import type { IsAny } from "type-fest";\r\n',
        'import type { IsAny } from "type-fest";\nimport type { IsEmptyObject } from "type-fest";\r\n'
    )
    .replace("IfEmptyObject<", "IsEmptyObject<");
const fixtureFixableThirdPassOutputCode = fixtureFixableSecondPassOutputCode
    .replace(
        'import type { IsEmptyObject } from "type-fest";\r\n',
        'import type { IsEmptyObject } from "type-fest";\nimport type { IsNever } from "type-fest";\r\n'
    )
    .replace("IfNever<", "IsNever<");
const fixtureFixableFourthPassOutputCode = fixtureFixableThirdPassOutputCode
    .replace(
        'import type { IsNever } from "type-fest";\r\n',
        'import type { IsNever } from "type-fest";\nimport type { IsNull } from "type-fest";\r\n'
    )
    .replace("IfNull<", "IsNull<");
const fixtureFixableFifthPassOutputCode = fixtureFixableFourthPassOutputCode
    .replace(
        'import type { IsNull } from "type-fest";\r\n',
        'import type { IsNull } from "type-fest";\nimport type { IsUnknown } from "type-fest";\r\n'
    )
    .replace("IfUnknown<", "IsUnknown<");
const inlineFixableInvalidCode = [
    'import type { IfAny } from "type-aliases";',
    'import type { IsAny } from "type-fest";',
    "",
    "type Input = IfAny<string, true, false>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = IfAny<string, true, false>;",
    "type Input = IsAny<string, true, false>;"
);

interface IfRuleMetadataSnapshot {
    create: (context: unknown) => unknown;
    defaultOptions?: Readonly<UnknownArray>;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        messages?: Record<string, string>;
    };
    name?: string;
}

const loadIfRuleMetadata = async (): Promise<IfRuleMetadataSnapshot> => {
    vi.resetModules();

    const moduleUnderTest = await import("../src/rules/prefer-type-fest-if");

    return moduleUnderTest.default as IfRuleMetadataSnapshot;
};

describe("prefer-type-fest-if metadata", () => {
    it("exports expected metadata", async () => {
        const metadataRule = await loadIfRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-type-fest-if");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest If + Is* utilities over deprecated If* aliases."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-if"
        );
        expect(metadataRule.meta?.messages?.["preferTypeFestIf"]).toBe(
            "`{{alias}}` is deprecated in type-fest. Prefer `If` combined with `{{replacement}}`."
        );
    });

    it("declares authored docs url literal before RuleCreator decoration", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            const undecoratedModule =
                (await import("../src/rules/prefer-type-fest-if")) as {
                    default: IfRuleMetadataSnapshot;
                };

            expect(undecoratedModule.default.meta?.docs?.url).toBe(
                "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-if"
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("falls back to an empty filename before the test-file guard", async () => {
        const capturedPaths: string[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource: () => new Set<string>(),
                collectImportedTypeAliasMatches: () =>
                    new Map<
                        string,
                        { importedName: string; replacementName: string }
                    >(),
                createSafeTypeReferenceReplacementFix: () => undefined,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (filePath: string): boolean => {
                    capturedPaths.push(filePath);

                    return true;
                },
            }));

            const undecoratedModule =
                (await import("../src/rules/prefer-type-fest-if")) as {
                    default: IfRuleMetadataSnapshot;
                };

            undecoratedModule.default.create({});

            expect(capturedPaths).toStrictEqual([""]);
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run("prefer-type-fest-if", getPluginRule("prefer-type-fest-if"), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "IfAny",
                        replacement: "IsAny",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfEmptyObject",
                        replacement: "IsEmptyObject",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfNever",
                        replacement: "IsNever",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfNull",
                        replacement: "IsNull",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfUnknown",
                        replacement: "IsUnknown",
                    },
                    messageId: "preferTypeFestIf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture If* alias usage",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
                fixtureFixableThirdPassOutputCode,
                fixtureFixableFourthPassOutputCode,
                fixtureFixableFifthPassOutputCode,
            ],
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "IfAny",
                        replacement: "IsAny",
                    },
                    messageId: "preferTypeFestIf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline IfAny alias import",
            output: inlineFixableOutputCode,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(namespaceValidFixtureName),
            filename: typedFixturePath(namespaceValidFixtureName),
            name: "accepts namespace-qualified Is* references",
        },
    ],
});
