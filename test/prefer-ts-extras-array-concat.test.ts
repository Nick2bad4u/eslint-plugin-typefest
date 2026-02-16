import preferTsExtrasArrayConcatRule from "../src/rules/prefer-ts-extras-array-concat.js";
import { readTypedFixture, typedRuleTester } from "./_internal/typed-rule-tester.js";

const validFixture = readTypedFixture("prefer-ts-extras-array-concat.valid.ts");
const invalidFixture = readTypedFixture("prefer-ts-extras-array-concat.invalid.ts");

typedRuleTester.run(
    "prefer-ts-extras-array-concat",
    preferTsExtrasArrayConcatRule,
    {
        invalid: [
            {
                code: invalidFixture,
                errors: [
                    {
                        messageId: "preferTsExtrasArrayConcat",
                    },
                    {
                        messageId: "preferTsExtrasArrayConcat",
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
