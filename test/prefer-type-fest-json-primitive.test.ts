/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-primitive.test` behavior.
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

const rule = getPluginRule("prefer-type-fest-json-primitive");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-primitive.valid.ts";
const partialValidFixtureName =
    "prefer-type-fest-json-primitive.partial.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-primitive.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { JsonPrimitive } from "type-fest";\n${invalidFixtureCode.replace(
    "boolean | null | number | string",
    "JsonPrimitive"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "boolean | null | number | string",
    "JsonPrimitive"
);
const skipFixtureName = "tests/prefer-type-fest-json-primitive.skip.ts";
const nonKeywordUnionValidCode =
    "type Payload = string | number | boolean | bigint;";
const duplicatePrimitiveUnionValidCode =
    "type Payload = string | number | boolean | number;";
const duplicateBooleanPrimitiveUnionValidCode =
    "type Payload = null | number | string | string;";
const duplicateNullPrimitiveUnionValidCode =
    "type Payload = boolean | number | string | string;";
const duplicateNumberPrimitiveUnionValidCode =
    "type Payload = boolean | null | string | string;";
const duplicateStringPrimitiveUnionValidCode =
    "type Payload = boolean | null | number | number;";
const fiveMemberPrimitiveUnionValidCode =
    "type Payload = boolean | null | number | string | string;";
const inlineInvalidWithoutFixCode =
    "type Payload = boolean | null | number | string;";
const inlineInvalidWithoutFixOutputCode = [
    'import type { JsonPrimitive } from "type-fest";',
    "type Payload = JsonPrimitive;",
].join("\n");
const inlineFixableCode = [
    'import type { JsonPrimitive } from "type-fest";',
    "",
    "type Payload = boolean | null | number | string;",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonPrimitive } from "type-fest";',
    "",
    "type Payload = JsonPrimitive;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-json-primitive",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest JsonPrimitive over explicit null|boolean|number|string unions.",
        enforceRuleShape: true,
        messages: {
            preferJsonPrimitive:
                "Prefer `JsonPrimitive` from type-fest over explicit primitive JSON keyword unions.",
        },
        name: "prefer-type-fest-json-primitive",
    }
);

describe("prefer-type-fest-json-primitive source assertions", () => {
    it("keeps json-primitive helper guard clauses in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-type-fest-json-primitive.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('node.type === "TSBooleanKeyword" ||');
        expect(ruleSource).toContain('node.type === "TSNullKeyword" ||');
        expect(ruleSource).toContain('node.type === "TSNumberKeyword" ||');
        expect(ruleSource).toContain('node.type === "TSStringKeyword";');

        expect(ruleSource).toContain("if (node.types.length !== 4) {");
        expect(ruleSource).toContain(
            "if (!isJsonPrimitiveKeywordNode(typeNode)) {"
        );
        expect(ruleSource).toContain('if (typeNode.type === "TSStringKeyword") {');
        expect(ruleSource).toContain("return false;");
    });
});

ruleTester.run("prefer-type-fest-json-primitive", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferJsonPrimitive",
                },
                {
                    messageId: "preferJsonPrimitive",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonPrimitive-like unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports JSON primitive keyword union without offering a fix when import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes JSON primitive keyword union when JsonPrimitive import is in scope",
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
            code: readTypedFixture(partialValidFixtureName),
            filename: typedFixturePath(partialValidFixtureName),
            name: "accepts partial primitive union fixture",
        },
        {
            code: nonKeywordUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union containing non-json primitive keyword",
        },
        {
            code: duplicatePrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores duplicate member primitive union",
        },
        {
            code: duplicateBooleanPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing boolean even when it has four primitive members",
        },
        {
            code: duplicateNullPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing null even when it has four primitive members",
        },
        {
            code: duplicateNumberPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing number even when it has four primitive members",
        },
        {
            code: duplicateStringPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing string even when it has four primitive members",
        },
        {
            code: fiveMemberPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores five-member primitive union even when it contains all json primitive families",
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
