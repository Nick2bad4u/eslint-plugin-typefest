import preferTsExtrasIsIntegerRule from "../src/rules/prefer-ts-extras-is-integer.js";
import { readTypedFixture, typedRuleTester } from "./_internal/typed-rule-tester.js";

const validFixture = readTypedFixture("prefer-ts-extras-is-integer.valid.ts");
const invalidFixture = readTypedFixture("prefer-ts-extras-is-integer.invalid.ts");

typedRuleTester.run("prefer-ts-extras-is-integer", preferTsExtrasIsIntegerRule, {
    invalid: [
        {
            code: invalidFixture,
            errors: [
                {
                    messageId: "preferTsExtrasIsInteger",
                },
                {
                    messageId: "preferTsExtrasIsInteger",
                },
            ],
        },
    ],
    valid: [
        {
            code: validFixture,
        },
    ],
});
