import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-literal-union.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-literal-union.valid.ts";
const invalidFixtureName = "prefer-type-fest-literal-union.invalid.ts";
const skipFixtureName = "tests/prefer-type-fest-literal-union.skip.ts";
const inlineInvalidBigIntLiteralUnionCode = "type SessionNonce = bigint | 1n;";
const inlineInvalidBooleanLiteralUnionCode =
    "type FeatureFlag = true | false | boolean;";
const inlineInvalidNumberLiteralUnionCode =
    "type HttpCode = 200 | 404 | number;";
const inlineInvalidWithoutFixCode =
    "type EnvironmentName = 'dev' | 'prod' | string;";
const inlineInvalidBigIntLiteralUnionOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type SessionNonce = LiteralUnion<1n, bigint>;",
].join("\n");
const inlineInvalidBooleanLiteralUnionOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type FeatureFlag = LiteralUnion<true | false, boolean>;",
].join("\n");
const inlineInvalidNumberLiteralUnionOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type HttpCode = LiteralUnion<200 | 404, number>;",
].join("\n");
const inlineInvalidWithoutFixOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type EnvironmentName = LiteralUnion<'dev' | 'prod', string>;",
].join("\n");
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { LiteralUnion } from "type-fest";\n${invalidFixtureCode.replace(
    '"dev" | "prod" | string',
    'LiteralUnion<"dev" | "prod", string>'
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "200 | 404 | number",
    "LiteralUnion<200 | 404, number>"
);
const inlineFixableCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = 'dev' | 'prod' | string;",
].join("\n");
const inlineFixableOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = LiteralUnion<'dev' | 'prod', string>;",
].join("\n");
const inlineFixableBooleanCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = true | false | boolean;",
].join("\n");
const inlineFixableBooleanOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = LiteralUnion<true | false, boolean>;",
].join("\n");
const inlineFixableNumberCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = 200 | 404 | number;",
].join("\n");
const inlineFixableNumberOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = LiteralUnion<200 | 404, number>;",
].join("\n");
const inlineFixableSingleLiteralStringCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = 'dev' | string;",
].join("\n");
const inlineFixableSingleLiteralStringOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = LiteralUnion<'dev', string>;",
].join("\n");
const inlineFixableBigIntCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type SessionNonce = bigint | 1n;",
].join("\n");
const inlineFixableBigIntOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type SessionNonce = LiteralUnion<1n, bigint>;",
].join("\n");
const inlineFixableSingleLiteralBooleanCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = true | boolean;",
].join("\n");
const inlineFixableSingleLiteralBooleanOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = LiteralUnion<true, boolean>;",
].join("\n");
const inlineFixableSingleLiteralNumberCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = 200 | number;",
].join("\n");
const inlineFixableSingleLiteralNumberOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = LiteralUnion<200, number>;",
].join("\n");
const mixedFamilyUnionValidCode =
    "type EnvironmentName = 'dev' | number | string;";
const literalOnlyUnionValidCode = "type EnvironmentName = 'dev' | 'prod';";
const literalOnlyBooleanUnionValidCode = "type FeatureFlag = true | false;";
const literalOnlyBigIntUnionValidCode = "type SessionNonce = 1n | 2n;";
const mixedLiteralFamiliesValidCode = "type Marker = true | 'dev' | string;";
const keywordOnlyStringUnionValidCode =
    "type EnvironmentName = string | string;";
const keywordOnlyNumberUnionValidCode = "type HttpCode = number | number;";
const keywordOnlyBooleanUnionValidCode =
    "type FeatureFlag = boolean | boolean;";
const keywordOnlyBigIntUnionValidCode = "type SessionNonce = bigint | bigint;";
const literalAndTypeReferenceUnionValidCode =
    "type EnvironmentName = 'dev' | CustomAlias | string;";
const mismatchedBigIntLiteralFamilyValidCode =
    "type SessionNonce = bigint | 1 | 2;";
const templateLiteralAndStringKeywordValidCode =
    "type EnvironmentName = `dev` | string;";

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-literal-union",
    {
        docsDescription:
            "require TypeFest LiteralUnion over unions that combine primitive keywords with same-family literal members.",
        enforceRuleShape: true,
        messages: {
            preferLiteralUnion:
                "Prefer `LiteralUnion<...>` from type-fest over unions that mix primitive keywords and same-family literal members.",
        },
    }
);

ruleTester.run(
    "prefer-type-fest-literal-union",
    getPluginRule("prefer-type-fest-literal-union"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferLiteralUnion",
                    },
                    {
                        messageId: "preferLiteralUnion",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture literal plus base type unions",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineInvalidBigIntLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports bigint base plus bigint literal union",
                output: inlineInvalidBigIntLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidBooleanLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports boolean base plus boolean literal union",
                output: inlineInvalidBooleanLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidNumberLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports number base plus numeric literal union",
                output: inlineInvalidNumberLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports primitive+literal union without fix when LiteralUnion import is missing",
                output: inlineInvalidWithoutFixOutputCode,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes primitive+literal union when LiteralUnion import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineFixableBooleanCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes boolean literal unions when LiteralUnion import is in scope",
                output: inlineFixableBooleanOutput,
            },
            {
                code: inlineFixableNumberCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes number literal unions when LiteralUnion import is in scope",
                output: inlineFixableNumberOutput,
            },
            {
                code: inlineFixableSingleLiteralStringCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal string unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralStringOutput,
            },
            {
                code: inlineFixableBigIntCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes bigint literal unions when LiteralUnion import is in scope",
                output: inlineFixableBigIntOutput,
            },
            {
                code: inlineFixableSingleLiteralBooleanCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal boolean unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralBooleanOutput,
            },
            {
                code: inlineFixableSingleLiteralNumberCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal number unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralNumberOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: mixedFamilyUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that mix multiple primitive families",
            },
            {
                code: literalOnlyUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that contain only literal members",
            },
            {
                code: literalOnlyBooleanUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only boolean literal members",
            },
            {
                code: literalOnlyBigIntUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only bigint literal members",
            },
            {
                code: mixedLiteralFamiliesValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include literals from different families",
            },
            {
                code: keywordOnlyStringUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only string keyword members",
            },
            {
                code: keywordOnlyNumberUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only number keyword members",
            },
            {
                code: keywordOnlyBooleanUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only boolean keyword members",
            },
            {
                code: keywordOnlyBigIntUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only bigint keyword members",
            },
            {
                code: literalAndTypeReferenceUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include non-literal type references",
            },
            {
                code: mismatchedBigIntLiteralFamilyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores bigint unions with numeric (non-bigint) literals",
            },
            {
                code: templateLiteralAndStringKeywordValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include template literal types",
            },
            {
                code: readTypedFixture(skipFixtureName),
                filename: typedFixturePath(skipFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
