import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-partial-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-partial-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-partial-deep.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { PartialDeep } from "type-fest";\n${invalidFixtureCode.replace(
    "DeepPartial<TeamConfig>",
    "PartialDeep<TeamConfig>"
)}`;
const inlineFixableInvalidCode = [
    'import type { DeepPartial } from "type-aliases";',
    'import type { PartialDeep } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type PartialUser = DeepPartial<User>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type PartialUser = DeepPartial<User>;",
    "type PartialUser = PartialDeep<User>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-partial-deep",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest PartialDeep over `DeepPartial` aliases.",
        enforceRuleShape: true,
        messages: {
            preferPartialDeep:
                "Prefer `PartialDeep` from type-fest over `DeepPartial`.",
        },
        name: "prefer-type-fest-partial-deep",
    }
);

ruleTester.run(
    "prefer-type-fest-partial-deep",
    getPluginRule("prefer-type-fest-partial-deep"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [{ messageId: "preferPartialDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture DeepPartial alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPartialDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline DeepPartial alias import",
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
    }
);
