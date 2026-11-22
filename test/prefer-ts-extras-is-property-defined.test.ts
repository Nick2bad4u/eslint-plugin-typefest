/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-property-defined` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-property-defined";
const docsDescription =
    "require ts-extras isPropertyDefined in Array.filter callbacks instead of inline property-undefined checks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-property-defined";
const preferTsExtrasIsPropertyDefinedMessage =
    "Prefer `isPropertyDefined` from `ts-extras` over an inline property-undefined filter callback.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-property-defined.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-property-defined.invalid.ts";

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferTsExtrasIsPropertyDefined: preferTsExtrasIsPropertyDefinedMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-property-defined metadata literals", () => {
    it("declares the authored docs URL and suggestion-only policy", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
        expect(rule.meta.fixable).toBeUndefined();
        expect(rule.meta.hasSuggestions).toBe(true);
    });
});

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

describe("prefer-ts-extras-is-property-defined parse-safety guards", () => {
    it("fast-check: isPropertyDefined replacement produces valid call expression text", () => {
        expect.hasAssertions();

        const propNameArbitrary = fc.constantFrom("name", "email", "title");

        fc.assert(
            fc.property(propNameArbitrary, (propName) => {
                const replacement = `isPropertyDefined(${JSON.stringify(propName)})`;

                expect(replacement).toContain("isPropertyDefined(");
                expect(replacement).toContain(JSON.stringify(propName));

                const codeToCheck = `const arr = [].filter(${replacement});`;

                expect(() => {
                    parser.parseForESLint(codeToCheck, parserOptions);
                }).not.toThrow();
            }),
            fastCheckRunConfig.default
        );
    });
});

const fixtureCode = readTypedFixture(invalidFixtureName);
const importLine = 'import { isPropertyDefined } from "ts-extras";';

const expectedSuggestion = (
    code: string,
    predicate: string,
    propertyName: string
) => ({
    messageId: "preferTsExtrasIsPropertyDefined" as const,
    suggestions: [
        {
            messageId: "replaceWithIsPropertyDefined" as const,
            output:
                (code.startsWith(importLine) ? "" : `${importLine}\n`) +
                code.replace(
                    predicate,
                    `isPropertyDefined(${JSON.stringify(propertyName)})`
                ),
        },
    ],
});

const getterPredicate = "(user) => user.name !== undefined";
const getterCode = [
    'class User { get name(): string | undefined { return "Ada"; } }',
    "const users = [new User()];",
    `const result = users.filter(${getterPredicate});`,
].join("\n");

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: fixtureCode,
            errors: [
                expectedSuggestion(
                    fixtureCode,
                    "(user) => user.name !== undefined",
                    "name"
                ),
                expectedSuggestion(
                    fixtureCode,
                    "(user) => user.email !== undefined",
                    "email"
                ),
                expectedSuggestion(
                    fixtureCode,
                    '(user) => typeof user.name !== "undefined"',
                    "name"
                ),
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "keeps fixture callbacks and offers independent suggestions",
            output: null,
        },
        ...(
            [
                [
                    "(user) => typeof user.name !== 'undefined'",
                    true,
                    "typeof comparison",
                ],
                [
                    "(user) => undefined !== user.name",
                    true,
                    "reversed operands",
                ],
                [
                    "(user) => user.name !== undefined",
                    false,
                    "missing import",
                ],
                [
                    "(user) => user.name !== undefined",
                    true,
                    "existing import",
                ],
            ] as const
        ).map(
            ([
                predicate,
                alreadyImported,
                description,
            ]) => {
                const code = [
                    ...(alreadyImported ? [importLine] : []),
                    "interface User { name: string | undefined }",
                    "declare const users: User[];",
                    `const result = users.filter(${predicate});`,
                ].join("\n");

                return {
                    code,
                    errors: [expectedSuggestion(code, predicate, "name")],
                    filename: typedFixturePath(invalidFixtureName),
                    name: `suggests a replacement for ${description}`,
                    output: null,
                };
            }
        ),
        {
            code: getterCode,
            errors: [expectedSuggestion(getterCode, getterPredicate, "name")],
            filename: typedFixturePath(invalidFixtureName),
            name: "keeps native lookup for a class getter during autofix",
            output: null,
        },
    ],
    valid: [
        {
            code: "const users = [{ name: null }]; users.filter((user) => user.name != undefined);",
            name: "keeps loose undefined comparisons that also exclude null",
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns using isPropertyDefined",
        },
        {
            code: [
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const named = users.filter((user) => user !== undefined);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts filter callback checking the whole item (not a property)",
        },
        {
            code: [
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const named = users.filter((user) => user.name !== null);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts strict null check (isPropertyPresent territory)",
        },
        {
            code: [
                "interface User { info: { name: string | undefined } }",
                "declare const users: User[];",
                "const named = users.filter((user) => user.info.name !== undefined);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts deep member access (only single-level property check is flagged)",
        },
        {
            code: [
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const names = users.map((user) => user.name !== undefined);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts the same pattern in map (only filter is flagged)",
        },
    ],
});
