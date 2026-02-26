/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-as-writable.test` behavior.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-as-writable.valid.ts";
const namespaceValidFixtureName =
    "prefer-ts-extras-as-writable.namespace.valid.ts";
const invalidFixtureName = "prefer-ts-extras-as-writable.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const inlineInvalidTypeAssertionCode = [
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = <Writable<ReadonlyRecord>>readonlyRecord;",
    "",
    "String(mutableRecord);",
].join("\n");
const inlineInvalidTypeAssertionOutput = [
    'import type { Writable } from "type-fest";',
    'import { asWritable } from "ts-extras";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = asWritable(readonlyRecord);",
    "",
    "String(mutableRecord);",
].join("\n");
const inlineValidTypeLiteralAssertionCode = [
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as { readonly id: number };",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidNonTypeFestNamespaceCode = [
    'import type * as Aliases from "type-aliases";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as Aliases.Writable<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidDefaultImportAliasCode = [
    'import type WritableDefault from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as WritableDefault<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidNamedImportUsedAsQualifiedNamespaceCode = [
    'import type { Writable as MutableAlias } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as MutableAlias.Writable<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidTypeFestNamespaceNonWritableMemberCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as TypeFest.ReadonlyDeep<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineFixableCode = [
    'import { asWritable } from "ts-extras";',
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = readonlyRecord as Writable<ReadonlyRecord>;",
    "",
    "String(mutableRecord);",
].join("\n");
const inlineFixableOutput = [
    'import { asWritable } from "ts-extras";',
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = asWritable(readonlyRecord);",
    "",
    "String(mutableRecord);",
].join("\n");
const fixtureInvalidOutput = [
    'import { asWritable } from "ts-extras";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "    readonly name: string;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableByNamedImport = asWritable(readonlyRecord);",
    "const mutableByAliasedImport = readonlyRecord as MutableAlias<ReadonlyRecord>;",
    "const mutableByNamespace = readonlyRecord as TypeFest.Writable<ReadonlyRecord>;",
    "",
    "String(mutableByNamedImport);",
    "String(mutableByAliasedImport);",
    "String(mutableByNamespace);",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");
const fixtureInvalidOutputWithMixedLineEndings =
    'import type { Writable, Writable as MutableAlias } from "type-fest";\r\n' +
    'import type * as TypeFest from "type-fest";\n' +
    `${fixtureInvalidOutput}\r\n`;
const fixtureInvalidSecondPassOutputWithMixedLineEndings =
    fixtureInvalidOutputWithMixedLineEndings
        .replace(
            "const mutableByAliasedImport = readonlyRecord as MutableAlias<ReadonlyRecord>;\r\n",
            "const mutableByAliasedImport = asWritable(readonlyRecord);\r\n"
        )
        .replace(
            "const mutableByNamespace = readonlyRecord as TypeFest.Writable<ReadonlyRecord>;\r\n",
            "const mutableByNamespace = asWritable(readonlyRecord);\r\n"
        );

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-as-writable",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras asWritable over Writable<T> style assertions from type-fest.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasAsWritable:
                "Prefer `asWritable(value)` from `ts-extras` over `Writable<...>` assertions.",
        },
        name: "prefer-ts-extras-as-writable",
    }
);

describe("prefer-ts-extras-as-writable source assertions", () => {
    it("keeps as-writable import and qualified-name guards in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-as-writable.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain(
            'const filePath = context.filename ?? "";'
        );
        expect(ruleSource).toContain("collectNamedImportLocalNamesFromSource(");
        expect(ruleSource).toContain(
            "collectNamespaceImportLocalNamesFromSource("
        );
        expect(ruleSource).not.toContain(
            "for (const statement of context.sourceCode.ast.body) {"
        );
        expect(ruleSource).toContain(
            'if (typeAnnotation.typeName.type !== "TSQualifiedName") {'
        );
        expect(ruleSource).toContain(
            'typeAnnotation.typeName.right.type === "Identifier" &&'
        );
        expect(ruleSource).toContain(
            "typeAnnotation.typeName.right.name === WRITABLE_TYPE_NAME"
        );
    });

    it("preserves authored rule metadata and source-level branching", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-as-writable.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('name: "prefer-ts-extras-as-writable"');
        expect(ruleSource).toContain("defaultOptions: []");
        expect(ruleSource).toContain("meta: {");
        expect(ruleSource).toContain("const isWritableTypeReference = (");
        expect(ruleSource).toContain(
            'if (typeAnnotation.type !== "TSTypeReference") {'
        );
        expect(ruleSource).toContain(
            "require ts-extras asWritable over Writable<T> style assertions from type-fest."
        );
    });
});

ruleTester.run(
    "prefer-ts-extras-as-writable",
    getPluginRule("prefer-ts-extras-as-writable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture type-fest Writable assertions",
                output: [
                    fixtureInvalidOutputWithMixedLineEndings,
                    fixtureInvalidSecondPassOutputWithMixedLineEndings,
                ],
            },
            {
                code: inlineInvalidTypeAssertionCode,
                errors: [{ messageId: "preferTsExtrasAsWritable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports angle-bracket Writable assertion",
                output: inlineInvalidTypeAssertionOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasAsWritable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes Writable assertion when asWritable import is in scope",
                output: inlineFixableOutput,
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
                name: "accepts namespace-specific safe fixture patterns",
            },
            {
                code: inlineValidTypeLiteralAssertionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores assertion to plain type literal",
            },
            {
                code: inlineValidNonTypeFestNamespaceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Writable from non-type-fest namespace",
            },
            {
                code: inlineValidDefaultImportAliasCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic default import aliases from type-fest",
            },
            {
                code: inlineValidNamedImportUsedAsQualifiedNamespaceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores named Writable import used as a fake namespace qualifier",
            },
            {
                code: inlineValidTypeFestNamespaceNonWritableMemberCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores type-fest namespace members that are not Writable",
            },
        ],
    }
);
