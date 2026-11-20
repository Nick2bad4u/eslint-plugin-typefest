import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-empty-array";
const fixture = "prefer-type-fest-empty-array.ts";
const filename = typedFixturePath("upstream-latest", fixture);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription:
        "require TypeFest EmptyArray for aliases of readonly empty tuples.",
    messages: {
        preferEmptyArray:
            "Use `EmptyArray` from type-fest for this readonly empty tuple alias.",
    },
    name: ruleId,
});

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", fixture),
            errors: [{ messageId: "preferEmptyArray", suggestions: [] }],
            filename,
            name: "reports an exported readonly empty tuple alias",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { EmptyArray } from "type-fest"; type NoArguments = EmptyArray;',
            filename,
            name: "accepts the upstream helper",
        },
        {
            code: [
                "type Mutable = [];",
                "type NeverArray = readonly never[];",
                "type Optional = readonly [value?: string];",
                "type Variadic = readonly [...never[]];",
                "type Union = string | readonly [];",
                "type Container = { args: readonly [] };",
                "type Callback = () => readonly [];",
                "declare const args: readonly [];",
            ].join("\n"),
            filename,
            name: "ignores mutable tuples, other array types and nested uses",
        },
        {
            code: readTypedFixture("upstream-latest", fixture),
            filename: typedFixturePath("prefer-ts-extras-array-at.valid.ts"),
            name: "accepts the alias in the TypeFest 5 workspace",
        },
    ],
});
