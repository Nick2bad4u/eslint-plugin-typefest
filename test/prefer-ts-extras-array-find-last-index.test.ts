import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-find-last-index");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-find-last-index.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-find-last-index.invalid.ts";

ruleTester.run("prefer-ts-extras-array-find-last-index", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayFindLastIndex",
                },
                {
                    messageId: "preferTsExtrasArrayFindLastIndex",
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
