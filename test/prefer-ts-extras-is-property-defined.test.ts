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
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsPropertyDefined: preferTsExtrasIsPropertyDefinedMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-property-defined metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
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

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasIsPropertyDefined" },
                { messageId: "preferTsExtrasIsPropertyDefined" },
                { messageId: "preferTsExtrasIsPropertyDefined" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture inline property-undefined filter callbacks",
            // Two passes: pass 1 inserts import + fixes first callback;
            // pass 2 fixes remaining callbacks (import already present).
            output: [
                `import { isPropertyDefined } from "ts-extras";\n${readTypedFixture(
                    invalidFixtureName
                ).replace(
                    "(user) => user.name !== undefined",
                    'isPropertyDefined("name")'
                )}`,
                `import { isPropertyDefined } from "ts-extras";\n${readTypedFixture(
                    invalidFixtureName
                )
                    .replace(
                        "(user) => user.name !== undefined",
                        'isPropertyDefined("name")'
                    )
                    .replace(
                        "(user) => user.email !== undefined",
                        'isPropertyDefined("email")'
                    )
                    .replace(
                        '(user) => typeof user.name !== "undefined"',
                        'isPropertyDefined("name")'
                    )}`,
            ],
        },
        {
            code: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const named = users.filter((user) => user.name !== undefined);",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports item.prop !== undefined and autofixes to isPropertyDefined when import exists",
            output: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                'const named = users.filter(isPropertyDefined("name"));',
            ].join("\n"),
        },
        {
            code: [
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const named = users.filter((user) => user.name !== undefined);",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports item.prop !== undefined and inserts isPropertyDefined import when absent",
            output: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                'const named = users.filter(isPropertyDefined("name"));',
            ].join("\n"),
        },
        {
            code: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const named = users.filter((user) => typeof user.name !== 'undefined');",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports typeof item.prop !== 'undefined' and autofixes to isPropertyDefined",
            output: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                'const named = users.filter(isPropertyDefined("name"));',
            ].join("\n"),
        },
        {
            code: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const named = users.filter((user) => undefined !== user.name);",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports undefined !== item.prop (reversed order) and autofixes",
            output: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                'const named = users.filter(isPropertyDefined("name"));',
            ].join("\n"),
        },
        {
            code: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                "const named = users.filter((user) => user.name != undefined);",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports item.prop != undefined (loose inequality) and autofixes",
            output: [
                'import { isPropertyDefined } from "ts-extras";',
                "interface User { name: string | undefined }",
                "declare const users: User[];",
                'const named = users.filter(isPropertyDefined("name"));',
            ].join("\n"),
        },
    ],
    valid: [
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
