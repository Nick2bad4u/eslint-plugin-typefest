import preferTsExtrasIsSafeIntegerRule from "../src/rules/prefer-ts-extras-is-safe-integer.js";
import { readTypedFixture, typedRuleTester } from "./_internal/typed-rule-tester.js";

const validFixture = readTypedFixture("prefer-ts-extras-is-safe-integer.valid.ts");
const invalidFixture = readTypedFixture(
    "prefer-ts-extras-is-safe-integer.invalid.ts"
);

typedRuleTester.run(
    "prefer-ts-extras-is-safe-integer",
    preferTsExtrasIsSafeIntegerRule,
    {
        invalid: [
            {
                code: invalidFixture,
                errors: [
                    {
                        messageId: "preferTsExtrasIsSafeInteger",
                    },
                    {
                        messageId: "preferTsExtrasIsSafeInteger",
                    },
                ],
            },
        ],
        valid: [
            {
                code: validFixture,
            },
        ],
    }
);
