import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-arrayable");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-arrayable.valid.ts";
const invalidFixtureName = "prefer-type-fest-arrayable.invalid.ts";

ruleTester.run("prefer-type-fest-arrayable", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferArrayable",
                },
                {
                    messageId: "preferArrayable",
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
