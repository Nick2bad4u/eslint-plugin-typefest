import type { UnknownArray, UnknownRecord } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable-deep.test` behavior.
 */
import * as fs from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { getPluginRule, repoPath } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const writableDeepRule = getPluginRule("prefer-type-fest-writable-deep");

const validFixtureName = "prefer-type-fest-writable-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-writable-deep.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { WritableDeep } from "type-fest";\n${invalidFixtureCode.replace(
    "DeepMutable<TeamConfig>",
    "WritableDeep<TeamConfig>"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "MutableDeep<TeamConfig>",
    "WritableDeep<TeamConfig>"
);
const inlineFixableInvalidCode = [
    'import type { DeepMutable } from "type-aliases";',
    'import type { WritableDeep } from "type-fest";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = DeepMutable<User>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type MutableUser = DeepMutable<User>;",
    "type MutableUser = WritableDeep<User>;"
);

ruleTester.run("prefer-type-fest-writable-deep", writableDeepRule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferWritableDeep" },
                { messageId: "preferWritableDeep" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture DeepMutable aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferWritableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline DeepMutable alias import",
            output: inlineFixableOutputCode,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
    ],
});

interface WritableDeepRuleMetadataSnapshot {
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

const loadWritableDeepRuleMetadata =
    async (): Promise<WritableDeepRuleMetadataSnapshot> => {
        vi.resetModules();
        const moduleUnderTest =
            await import("../src/rules/prefer-type-fest-writable-deep");

        return moduleUnderTest.default as WritableDeepRuleMetadataSnapshot;
    };

describe("prefer-type-fest-writable-deep metadata", () => {
    it("declares stable metadata values", async () => {
        const metadataRule = await loadWritableDeepRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.name).toBe("prefer-type-fest-writable-deep");
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest WritableDeep over `DeepMutable` and `MutableDeep` aliases."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
        );
        expect(writableDeepRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
        );
        expect(metadataRule.meta?.messages?.["preferWritableDeep"]).toBe(
            "Prefer `WritableDeep` from type-fest over `DeepMutable`/`MutableDeep`."
        );

        const writableDeepRuleSource = fs.readFileSync(
            repoPath("src", "rules", "prefer-type-fest-writable-deep.ts"),
            "utf8"
        );

        expect(writableDeepRuleSource).toMatch(
            /\/docs\/rules\/prefer-type-fest-writable-deep"/v
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
                (await import("../src/rules/prefer-type-fest-writable-deep")) as {
                    default: WritableDeepRuleMetadataSnapshot;
                };

            expect(undecoratedModule.default.meta?.docs?.url).toBe(
                "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

interface WritableDeepRuleModuleForCreate {
    create: (
        context: Readonly<{
            filename?: string | undefined;
            sourceCode: object;
        }>
    ) => UnknownRecord;
}

describe("prefer-type-fest-writable-deep filename fallback", () => {
    it("short-circuits missing filenames as test-path matches", async () => {
        const collectDirectNamedImportsFromSourceMock = vi.fn(() => {
            throw new Error(
                "collectDirectNamedImportsFromSource should not run when filename is missing"
            );
        });

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (filePath: string): boolean => filePath === "",
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource:
                    collectDirectNamedImportsFromSourceMock,
                createSafeTypeReferenceReplacementFix: () => undefined,
            }));

            const moduleUnderTest =
                (await import("../src/rules/prefer-type-fest-writable-deep")) as unknown as {
                    default: WritableDeepRuleModuleForCreate;
                };

            const listeners = moduleUnderTest.default.create({
                sourceCode: {},
            });

            expect(listeners).toStrictEqual({});
            expect(
                collectDirectNamedImportsFromSourceMock
            ).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.resetModules();
        }
    });
});
