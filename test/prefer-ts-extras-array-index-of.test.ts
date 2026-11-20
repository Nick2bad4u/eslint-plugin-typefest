/**
 * @packageDocumentation
 * RuleTester coverage for `prefer-ts-extras-array-index-of`.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-array-index-of";
const validFixtureName = `${ruleId}.valid.ts`;
const invalidFixtureName = `${ruleId}.invalid.ts`;
const filename = typedFixturePath("upstream-latest", "file.ts");
const ruleTester = createTypedRuleTester();

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasArrayIndexOf", suggestions: [] },
                { messageId: "preferTsExtrasArrayIndexOf", suggestions: [] },
                { messageId: "preferTsExtrasArrayIndexOf", suggestions: [] },
            ],
            filename,
            output: null,
        },
        {
            code: 'declare const value: unknown; declare const items: readonly ("red" | "blue")[]; items.indexOf(value);',
            errors: [
                { messageId: "preferTsExtrasArrayIndexOf", suggestions: [] },
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
            code: 'declare const statuses: readonly ["ready", "idle"]; statuses.indexOf(true); statuses.indexOf(); statuses.indexOf("ready", "wrong"); statuses.indexOf<never>("ready");',
            filename,
        },
        {
            code: 'declare const maybe: any; maybe.indexOf("ready");',
            filename,
        },
    ],
});
