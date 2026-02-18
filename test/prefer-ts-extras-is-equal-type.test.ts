/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-equal-type.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-equal-type.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-equal-type.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

ruleTester.run(
    "prefer-ts-extras-is-equal-type",
    getPluginRule("prefer-ts-extras-is-equal-type"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureCode.replace(
                                    "const directEqualCheck: IsEqual<string, string> = true;",
                                    "const directEqualCheck = isEqualType<string, string>();"
                                ),
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureCode.replace(
                                    "const directUnequalCheck: IsEqual<number, string> = false;",
                                    "const directUnequalCheck = isEqualType<number, string>();"
                                ),
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureCode.replace(
                                    'const namespaceEqualCheck: TypeFest.IsEqual<"a", "a"> = true;',
                                    'const namespaceEqualCheck = isEqualType<"a", "a">();'
                                ),
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
        ],
    }
);
