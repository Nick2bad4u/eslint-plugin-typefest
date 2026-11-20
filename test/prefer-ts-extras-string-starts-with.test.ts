/**
 * @packageDocumentation
 * RuleTester coverage for `prefer-ts-extras-string-starts-with`.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-string-starts-with";
const validFixtureName = `${ruleId}.valid.ts`;
const invalidFixtureName = `${ruleId}.invalid.ts`;
const filename = typedFixturePath("upstream-latest", "file.ts");
const ruleTester = createTypedRuleTester();

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasStringStartsWith",
                    suggestions: [],
                },
                {
                    messageId: "preferTsExtrasStringStartsWith",
                    suggestions: [],
                },
                {
                    messageId: "preferTsExtrasStringStartsWith",
                    suggestions: [],
                },
            ],
            filename,
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture("upstream-latest", validFixtureName),
            filename,
        },
        {
            code: 'declare const filename: string; filename.startsWith(/x/); filename.startsWith(); filename.startsWith("config-", "wrong"); filename.startsWith<never>("config-");',
            filename,
        },
        {
            code: 'declare const maybe: any; maybe.startsWith("config-");',
            filename,
        },
    ],
});
