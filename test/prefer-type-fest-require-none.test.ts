import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-require-none";
const fixture = "prefer-type-fest-require-none.ts";
const filename = typedFixturePath("upstream-latest", fixture);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription:
        "require TypeFest RequireNone over an optional-never mapped type on a property-key parameter.",
    messages: {
        preferRequireNone:
            "Use `RequireNone` from type-fest for this optional-never mapped type.",
    },
    name: ruleId,
});

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", fixture),
            errors: [
                { messageId: "preferRequireNone", suggestions: [] },
                { messageId: "preferRequireNone", suggestions: [] },
            ],
            filename,
            name: "reports implicit and explicit optional modifiers on the bound key set",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { RequireNone } from "type-fest";',
                "type Forbidden<K extends PropertyKey> = RequireNone<K>;",
            ].join("\n"),
            filename,
            name: "accepts the upstream helper",
        },
        {
            code: [
                "type Required<K extends PropertyKey> = { [P in K]: never };",
                "type Immutable<K extends PropertyKey> = { readonly [P in K]?: never };",
                "type Mutable<K extends PropertyKey> = { -readonly [P in K]?: never };",
                "type Different<K extends PropertyKey> = { [P in K]?: undefined };",
                "type Renamed<K extends PropertyKey> = { [P in K as Extract<P, string>]?: never };",
            ].join("\n"),
            filename,
            name: "preserves different modifiers, value types, and filtered keys",
        },
        {
            code: [
                'type Other = "extension";',
                "type Different<K extends PropertyKey> = { [P in Other]?: never };",
                "type Narrow<K extends string> = { [P in K]?: never };",
                "type Several<K extends PropertyKey, V> = { [P in K]?: never };",
                "type ShadowedKey<K extends PropertyKey> = { [K in K]?: never };",
                "namespace Local { type PropertyKey = string; export type Forbidden<K extends PropertyKey> = { [P in K]?: never }; }",
            ].join("\n"),
            filename,
            name: "checks the builtin constraint and the binding of the mapped keys",
        },
    ],
});
