import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-defined");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-defined.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-defined.invalid.ts";

ruleTester.run("prefer-ts-extras-assert-defined", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
                {
                    messageId: "preferTsExtrasAssertDefined",
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
});
