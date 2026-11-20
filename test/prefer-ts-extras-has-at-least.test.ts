import parser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

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

describe(ruleName, () => {
    it("checks the upstream narrowing overload and its upper limit", () => {
        expect.hasAssertions();

        const code = `import {hasAtLeast} from "ts-extras";
declare const items: readonly string[];
export const within: string = hasAtLeast(items, 2) ? items[1] : "";
export const beyond: string | undefined = hasAtLeast(items, 1000) ? items[999] : undefined;
// @ts-expect-error A minimum of 1000 returns boolean and leaves unchecked indices optional.
export const absentNarrowing: string = beyond;`;
        const { ast, services } = parser.parseForESLint(code, {
            filePath: filename,
            projectService: true,
        });
        const sourceFile = services.esTreeNodeToTSNodeMap.get(ast);

        expect(
            services.program?.getSemanticDiagnostics(sourceFile)
        ).toStrictEqual([]);
    });
});

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
