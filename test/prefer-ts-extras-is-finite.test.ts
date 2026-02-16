import preferTsExtrasIsFiniteRule from "../src/rules/prefer-ts-extras-is-finite.js";
import { readTypedFixture, typedRuleTester } from "./_internal/typed-rule-tester.js";

const validFixture = readTypedFixture("prefer-ts-extras-is-finite.valid.ts");
const invalidFixture = readTypedFixture("prefer-ts-extras-is-finite.invalid.ts");

typedRuleTester.run("prefer-ts-extras-is-finite", preferTsExtrasIsFiniteRule, {
    invalid: [
        {
            code: invalidFixture,
            errors: [
                {
                    messageId: "preferTsExtrasIsFinite",
                },
                {
                    messageId: "preferTsExtrasIsFinite",
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
