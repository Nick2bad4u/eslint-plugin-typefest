import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-from-entries");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-from-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-from-entries.invalid.ts";

ruleTester.run("prefer-ts-extras-object-from-entries", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectFromEntries",
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
