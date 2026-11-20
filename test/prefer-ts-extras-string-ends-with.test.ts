/**
 * @packageDocumentation
 * RuleTester coverage for `prefer-ts-extras-string-ends-with`.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-string-ends-with";
const validFixtureName = `${ruleId}.valid.ts`;
const invalidFixtureName = `${ruleId}.invalid.ts`;
const filename = typedFixturePath("upstream-latest", "file.ts");
const ruleTester = createTypedRuleTester();

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasStringEndsWith", suggestions: [] },
                { messageId: "preferTsExtrasStringEndsWith", suggestions: [] },
                { messageId: "preferTsExtrasStringEndsWith", suggestions: [] },
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
            code: 'declare const filename: string; filename.endsWith(/x/); filename.endsWith(); filename.endsWith(".json", "wrong"); filename.endsWith<never>(".json");',
            filename,
        },
        {
            code: 'declare const maybe: any; maybe.endsWith(".json");',
            filename,
        },
    ],
});
