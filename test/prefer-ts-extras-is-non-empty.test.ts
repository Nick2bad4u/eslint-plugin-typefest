import parser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleName = "prefer-ts-extras-is-non-empty";
const messageId = "preferTsExtrasIsNonEmpty";
const filename = typedFixturePath(
    "upstream-latest",
    "prefer-ts-extras-is-non-empty.invalid.ts"
);
const fixture = readTypedFixture(
    "upstream-latest",
    "prefer-ts-extras-is-non-empty.invalid.ts"
);
const prefix =
    'import { isNonEmpty as guard } from "ts-extras";\ndeclare const a: string[] | readonly [number, ...number[]];\n';
const cases = [
    "0 != a.length",
    "0 < a.length",
    "1 <= a.length",
    "a.length !== 0",
    "a.length > 0",
    "a.length >= 1",
] as const;

addTypeFestRuleMetadataSmokeTests(ruleName);

describe(ruleName, () => {
    it("preserves the native length narrowing of optional tuple unions", () => {
        expect.hasAssertions();

        const code = `import {isNonEmpty} from "ts-extras";
type Pair = [string?, number?] | [true, true];
declare const pair: Pair;
if (pair.length !== 0) {
    const length: 1 | 2 = pair.length;
    void length;
} else {
    const length: 0 = pair.length;
    void length;
}
if (!isNonEmpty(pair)) {
    // @ts-expect-error The helper leaves an optional tuple length in this branch.
    const length: 0 = pair.length;
    void length;
}`;
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
            code: 'import { isNonEmpty } from "ts-extras"; declare function next(): string[]; ((next()), (next())).length > 0;',
            errors: [{ messageId }],
            filename,
            output: null,
        },
        {
            code: "declare const a: number[]; a.length /* keep this comment */ > 0;",
            errors: [{ messageId }],
            filename,
            output: null,
        },
        {
            code: 'import { isNonEmpty } from "ts-extras"; function check(isNonEmpty: number, a: string[]) { return a.length > 0; }',
            errors: [{ messageId }],
            filename,
            output: null,
        },
    ],
    valid: [
        {
            code: "function size(pair: [string?, number?] | [true,true]): number { if (pair.length !== 0) { const size: 1 | 2 = pair.length; return size; } const size: 0 = pair.length; return size; }",
            filename,
        },

        {
            code: "declare const pair: [number, number], empty: [], single: [string?]; void (empty.length > 0); void (pair.length > 0); void (single.length >= 2); void (pair.length >= 2);",
            filename,
        },

        {
            code: [
                "declare const a: readonly string[]; declare const count: number;",
                "void (a.length === 0); void (a.length < 3); void (a.length > 0.5);",
                "void (a.length >= 1000); void (a.length > 999); void (a.length !== 1);",
                "void (a.length >= count); void (a.length >= 2);",
                'void (a["length"] > 0);',
            ].join("\n"),
            filename,
        },
        {
            code: [
                "declare const mixed: readonly string[] | string; declare const like: ArrayLike<number>;",
                "declare const maybe: string[] | undefined; declare const dynamic: any;",
                "void (mixed.length > 0); void (like.length > 0);",
                "void (dynamic.length > 0); void (maybe?.length !== 0);",
                "void (([] as ArrayLike<string>).length > 0);",
                'void ("text".length > 0); void (new Uint8Array(4).length > 0);',
            ].join("\n"),
            filename,
        },
    ],
});
