import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-entries");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-entries.invalid.ts";

ruleTester.run("prefer-ts-extras-object-entries", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectEntries",
                },
                {
                    messageId: "preferTsExtrasObjectEntries",
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
