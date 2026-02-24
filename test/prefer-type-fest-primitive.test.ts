import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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

const ruleId = "prefer-type-fest-primitive";
const docsDescription =
    "require TypeFest Primitive over explicit primitive keyword unions.";
const preferPrimitiveMessage =
    "Prefer `Primitive` from type-fest over explicit primitive keyword unions.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-primitive.valid.ts";
const partialValidFixtureName = "prefer-type-fest-primitive.partial.valid.ts";
const invalidFixtureName = "prefer-type-fest-primitive.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { Primitive } from "type-fest";\n${invalidFixtureCode.replace(
    "    | bigint\r\n    | boolean\r\n    | null\r\n    | number\r\n    | string\r\n    | symbol\r\n    | undefined",
    "    Primitive"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "    | bigint\r\n    | boolean\r\n    | null\r\n    | number\r\n    | string\r\n    | symbol\r\n    | undefined",
    "    Primitive"
);
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
const missingBigIntWithDuplicateBooleanValidCode =
    "type PrimitiveLike = boolean | null | number | string | symbol | undefined | boolean;";
const missingBooleanWithDuplicateBigIntValidCode =
    "type PrimitiveLike = bigint | null | number | string | symbol | undefined | bigint;";
const missingNullWithDuplicateNumberValidCode =
    "type PrimitiveLike = bigint | boolean | number | string | symbol | undefined | number;";
const missingNumberWithDuplicateStringValidCode =
    "type PrimitiveLike = bigint | boolean | null | string | symbol | undefined | string;";
const missingStringWithDuplicateSymbolValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | symbol | undefined | symbol;";
const missingSymbolWithDuplicateUndefinedValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | undefined | undefined;";
const missingUndefinedWithDuplicateNullValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | null;";
const inlineInvalidWithoutFixCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | undefined;";
const inlineInvalidWithoutFixOutputCode = [
    'import type { Primitive } from "type-fest";',
    "type PrimitiveLike = Primitive;",
].join("\n");
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

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferPrimitive: preferPrimitiveMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
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
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports primitive keyword union without fix when Primitive import is missing",
            output: inlineInvalidWithoutFixOutputCode,
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
            code: missingBigIntWithDuplicateBooleanValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing bigint with duplicate boolean",
        },
        {
            code: missingBooleanWithDuplicateBigIntValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing boolean with duplicate bigint",
        },
        {
            code: missingNullWithDuplicateNumberValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing null with duplicate number",
        },
        {
            code: missingNumberWithDuplicateStringValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing number with duplicate string",
        },
        {
            code: missingStringWithDuplicateSymbolValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing string with duplicate symbol",
        },
        {
            code: missingSymbolWithDuplicateUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing symbol with duplicate undefined",
        },
        {
            code: missingUndefinedWithDuplicateNullValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing undefined with duplicate null",
        },
    ],
});
