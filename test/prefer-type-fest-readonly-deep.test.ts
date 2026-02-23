import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-readonly-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-readonly-deep.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-readonly-deep.skip.ts";
const invalidFixtureName = "prefer-type-fest-readonly-deep.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { ReadonlyDeep } from "type-fest";\n${invalidFixtureCode.replace(
    "DeepReadonly<TeamConfig>",
    "ReadonlyDeep<TeamConfig>"
)}`;
const inlineFixableInvalidCode = [
    'import type { DeepReadonly } from "type-aliases";',
    'import type { ReadonlyDeep } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type FrozenUser = DeepReadonly<User>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type FrozenUser = DeepReadonly<User>;",
    "type FrozenUser = ReadonlyDeep<User>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-readonly-deep"
);

ruleTester.run(
    "prefer-type-fest-readonly-deep",
    getPluginRule("prefer-type-fest-readonly-deep"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [{ messageId: "preferReadonlyDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture DeepReadonly alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferReadonlyDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline DeepReadonly alias import",
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
