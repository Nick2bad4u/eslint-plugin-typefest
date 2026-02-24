import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-required-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-required-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-required-deep.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { RequiredDeep } from "type-fest";\n${invalidFixtureCode.replace(
    "DeepRequired<TeamConfig>",
    "RequiredDeep<TeamConfig>"
)}`;
const inlineFixableInvalidCode = [
    'import type { DeepRequired } from "type-aliases";',
    'import type { RequiredDeep } from "type-fest";',
    "",
    "type User = {",
    "    id?: string;",
    "};",
    "",
    "type StrictUser = DeepRequired<User>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type StrictUser = DeepRequired<User>;",
    "type StrictUser = RequiredDeep<User>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-required-deep",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest RequiredDeep over `DeepRequired` aliases.",
        enforceRuleShape: true,
        messages: {
            preferRequiredDeep:
                "Prefer `RequiredDeep` from type-fest over `DeepRequired`.",
        },
        name: "prefer-type-fest-required-deep",
    }
);

ruleTester.run(
    "prefer-type-fest-required-deep",
    getPluginRule("prefer-type-fest-required-deep"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [{ messageId: "preferRequiredDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture DeepRequired alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferRequiredDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline DeepRequired alias import",
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
