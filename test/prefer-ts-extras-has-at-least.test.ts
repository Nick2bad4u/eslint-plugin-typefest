import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleName = "prefer-ts-extras-has-at-least";
const messageId = "preferTsExtrasHasAtLeast";
const filename = typedFixturePath(
    "upstream-latest",
    "prefer-ts-extras-has-at-least.invalid.ts"
);
const fixture = readTypedFixture(
    "upstream-latest",
    "prefer-ts-extras-has-at-least.invalid.ts"
);
const prefix =
    'import { hasAtLeast as guard } from "ts-extras";\ndeclare const a: string[] | readonly [number, ...number[]];\n';
const cases = [
    "1 < a.length",
    "2 <= a.length",
    "999 <= a.length",
    "a.length > 1",
    "a.length > 998",
    "a.length >= 2",
] as const;

addTypeFestRuleMetadataSmokeTests(ruleName);

createTypedRuleTester().run(ruleName, getPluginRule(ruleName), {
    invalid: [
        {
            code: fixture,
            errors: [{ messageId }],
            filename,
            output: null,
        },
        ...cases.map((expression) => ({
            code: prefix + expression,
            errors: [{ messageId }],
            filename,
            output: null,
        })),
        {
            code: 'import { hasAtLeast } from "ts-extras"; declare function next(): string[]; ((next()), (next())).length >= 2;',
            errors: [{ messageId }],
            filename,
            output: null,
        },
        {
            code: "declare const a: number[]; a.length /* keep this comment */ >= 2;",
            errors: [{ messageId }],
            filename,
            output: null,
        },
        {
            code: 'import { hasAtLeast } from "ts-extras"; function check(hasAtLeast: number, a: string[]) { return a.length >= 2; }',
            errors: [{ messageId }],
            filename,
            output: null,
        },
    ],
    valid: [
        {
            code: "declare const pair: [number, number], empty: [], single: [string?]; void (empty.length > 0); void (pair.length > 0); void (single.length >= 2); void (pair.length >= 2);",
            filename,
        },

        {
            code: [
                "declare const a: readonly string[]; declare const count: number;",
                "void (a.length === 0); void (a.length < 3); void (a.length > 0.5);",
                "void (a.length >= 1000); void (a.length > 999); void (a.length !== 1);",
                "void (a.length >= count); void (a.length > 0);",
                'void (a["length"] >= 2);',
            ].join("\n"),
            filename,
        },
        {
            code: [
                "declare const mixed: readonly string[] | string; declare const like: ArrayLike<number>;",
                "declare const maybe: string[] | undefined; declare const dynamic: any;",
                "void (mixed.length >= 2); void (like.length >= 2);",
                "void (dynamic.length >= 2); void (maybe?.length !== 0);",
                "void (([] as ArrayLike<string>).length >= 2);",
                'void ("text".length >= 2); void (new Uint8Array(4).length >= 2);',
            ].join("\n"),
            filename,
        },
    ],
});
