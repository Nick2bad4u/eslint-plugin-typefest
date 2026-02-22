/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-primitive.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";

const rule = getPluginRule("prefer-type-fest-primitive");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-primitive.valid.ts";
const partialValidFixtureName = "prefer-type-fest-primitive.partial.valid.ts";
const invalidFixtureName = "prefer-type-fest-primitive.invalid.ts";
const skipFixtureName = "tests/prefer-type-fest-primitive.skip.ts";
const nonPrimitiveKeywordUnionValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | object;";
const duplicatePrimitiveMemberValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | undefined | string;";
const missingBigIntValidCode =
    "type PrimitiveLike = boolean | null | number | string | symbol | undefined;";
const missingBooleanValidCode =
    "type PrimitiveLike = bigint | null | number | string | symbol | undefined;";
const missingNullValidCode =
    "type PrimitiveLike = bigint | boolean | number | string | symbol | undefined;";
const missingNumberValidCode =
    "type PrimitiveLike = bigint | boolean | null | string | symbol | undefined;";
const missingStringValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | symbol | undefined;";
const missingSymbolValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | undefined;";
const missingUndefinedValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol;";
const inlineFixableCode = [
    'import type { Primitive } from "type-fest";',
    "",
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | undefined;",
].join("\n");
const inlineFixableOutput = [
    'import type { Primitive } from "type-fest";',
    "",
    "type PrimitiveLike = Primitive;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-primitive", {
    docsDescription:
        "require TypeFest Primitive over explicit primitive keyword unions.",
    enforceRuleShape: true,
    messages: {
        preferPrimitive:
            "Prefer `Primitive` from type-fest over explicit primitive keyword unions.",
    },
});

ruleTester.run("prefer-type-fest-primitive", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferPrimitive",
                },
                {
                    messageId: "preferPrimitive",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture primitive alias unions",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes primitive keyword union when Primitive import is in scope",
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
            code: nonPrimitiveKeywordUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union containing non-primitive object keyword",
        },
        {
            code: duplicatePrimitiveMemberValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union with duplicate members",
        },
        {
            code: missingBigIntValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing bigint",
        },
        {
            code: missingBooleanValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing boolean",
        },
        {
            code: missingNullValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing null",
        },
        {
            code: missingNumberValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing number",
        },
        {
            code: missingStringValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing string",
        },
        {
            code: missingSymbolValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing symbol",
        },
        {
            code: missingUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing undefined",
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
