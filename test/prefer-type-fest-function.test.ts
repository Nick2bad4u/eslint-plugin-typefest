import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";
import { applyUpstreamRuleFix } from "./_internal/upstream-fix-output";

const ruleId = "prefer-type-fest-function";
const fixture = "prefer-type-fest-function.ts";
const filename = typedFixturePath("upstream-latest", fixture);
const code = readTypedFixture("upstream-latest", fixture);

describe(ruleId, () => {
    it("produces parseable TypeScript for generated matching expressions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(fc.nat({ max: 500 }), (index) => {
                const args = `Args${index}`;
                const input = `type Load<${args} extends string[]> = (...values: ${args}) => Promise<number>;`;
                const output = applyUpstreamRuleFix(ruleId, input, filename);

                expect(output).toContain(`AsyncFunction<${args}, number>`);
                expect(() =>
                    parser.parseForESLint(output, { sourceType: "module" })
                ).not.toThrow();
            }),
            fastCheckRunConfig.default
        );
    });
});

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        ...[
            {
                expression: "(...args: readonly any[]) => unknown",
                replacement: "AnyFunction",
            },
            {
                expression: "(...args: any[]) => Promise<unknown>",
                replacement: "AnyAsyncFunction",
            },
        ].map(({ expression, replacement }) => {
            const start = `import type { ${
                replacement
            } } from "type-fest"; type Callable = `;
            return {
                code: `${start + expression};`,
                errors: [
                    {
                        data: { replacement },
                        messageId: "preferUpstreamType" as const,
                    },
                ],
                filename,
                output: `${start + replacement};`,
            };
        }),

        {
            code,
            errors: [
                {
                    data: { replacement: "AsyncFunction<Args, Result>" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: code.replace(
                "type Loader<Args extends readonly unknown[], Result> = (...args: Args) => Promise<Result>;",
                "type Loader<Args extends readonly unknown[], Result> = AsyncFunction<Args, Result>;"
            ),
        },
    ],
    valid: [
        {
            code: code.replace(
                "type Loader<Args extends readonly unknown[], Result> = (...args: Args) => Promise<Result>;",
                "type Loader<Args extends readonly unknown[], Result> = AsyncFunction<Args, Result>;"
            ),
            filename,
        },
        {
            code: [
                'import type { AsyncFunction } from "type-fest";',
                "type Named = (id: string) => Promise<number>;",
                "type Generic = <T>(...args: T[]) => Promise<T>;",
                "type Local<Promise, Args extends unknown[]> = (...args: Args) => Promise;",
                "type Capture = (...args: string[]) => Promise<typeof args>;",
            ].join("\n"),
            filename,
        },
        { code, filename: typedFixturePath("file.ts") },
    ],
});
