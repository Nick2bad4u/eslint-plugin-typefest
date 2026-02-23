import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-merge-exclusive.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-merge-exclusive";
const docsDescription =
    "require TypeFest MergeExclusive over `XOR` aliases.";
const preferMergeExclusiveMessage =
    "Prefer `MergeExclusive` from type-fest over `XOR`.";

const validFixtureName = "prefer-type-fest-merge-exclusive.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-merge-exclusive.skip.ts";
const invalidFixtureName = "prefer-type-fest-merge-exclusive.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { MergeExclusive } from "type-fest";\n${invalidFixtureCode.replace(
    "XOR<UserQuery, UserLookup>",
    "MergeExclusive<UserQuery, UserLookup>"
)}`;
const inlineFixableInvalidCode = [
    'import type { XOR } from "type-aliases";',
    'import type { MergeExclusive } from "type-fest";',
    "",
    "type A = { a: string };",
    "type B = { b: string };",
    "",
    "type AB = XOR<A, B>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type AB = XOR<A, B>;",
    "type AB = MergeExclusive<A, B>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferMergeExclusive: preferMergeExclusiveMessage,
    },
    name: ruleId,
});

ruleTester.run(
    ruleId,
    getPluginRule(ruleId),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [{ messageId: "preferMergeExclusive" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture XOR alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferMergeExclusive" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline XOR alias import",
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
                code: readTypedFixture(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                filename: typedFixturePath(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
