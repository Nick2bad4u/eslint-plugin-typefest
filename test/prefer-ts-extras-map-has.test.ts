/**
 * @packageDocumentation
 * RuleTester coverage for `prefer-ts-extras-map-has`.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-map-has";
const validFixtureName = `${ruleId}.valid.ts`;
const invalidFixtureName = `${ruleId}.invalid.ts`;
const filename = typedFixturePath("upstream-latest", "file.ts");
const ruleTester = createTypedRuleTester();

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasMapHas", suggestions: [] },
                { messageId: "preferTsExtrasMapHas", suggestions: [] },
            ],
            filename,
            output: null,
        },
        {
            code: 'declare const value: unknown; declare const items: ReadonlyMap<"red" | "blue", number>; items.has(value);',
            errors: [{ messageId: "preferTsExtrasMapHas", suggestions: [] }],
            filename,
            output: null,
        },
    ],
    valid: [
        {
            code: 'declare const items: ReadonlyMap<"red", number>; declare const key: "blue" | "red"; if (!items.has(key)) { key; }',
            filename,
            name: "preserves a wider union when a missing key could still have the map key type",
        },
        {
            code: readTypedFixture("upstream-latest", validFixtureName),
            filename,
        },
        {
            code: 'declare const statusLabels: ReadonlyMap<string, number>; statusLabels.has(true); statusLabels.has(); statusLabels.has("ready", 1); statusLabels.has<never>("ready");',
            filename,
        },
        {
            code: 'declare const maybe: any; maybe.has("ready");',
            filename,
        },
    ],
});
