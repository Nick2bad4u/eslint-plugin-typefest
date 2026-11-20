/** @packageDocumentation RuleTester coverage for GuardedType. */
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

const ruleId = "prefer-type-fest-guarded-type";
const fixtureName = `${ruleId}.invalid.ts`;
const filename = typedFixturePath("upstream-latest", fixtureName);
const code = readTypedFixture("upstream-latest", fixtureName);
const start = code.indexOf("F extends");
const end = code.indexOf(";", start);
const expected = `${code.slice(0, start)}GuardedType<F>${code.slice(end)}`;

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code,
            errors: [
                {
                    data: { replacement: "GuardedType<F>" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: expected,
        },
        {
            code: "type ExtractGuard<F> = F extends (v: any, ...rest: any[]) => v is infer G ? /* retained */ G : never;",
            errors: [{ messageId: "preferUpstreamType" }],
            filename,
            output: null,
        },
        {
            code: "type View<F, GuardedType> = F extends (v: any, ...rest: any[]) => v is infer G ? G : never;",
            errors: [{ messageId: "preferUpstreamType" }],
            filename,
            output: null,
        },
    ],
    valid: [
        { code: expected, filename },
        { code, filename: typedFixturePath("file.ts") },
        {
            code: "type View<F> = F extends (v: any) => v is infer G ? G : never;",
            filename,
            name: "A single parameter guard omits the variadic inputs",
        },
        {
            code: "type View<F> = F extends (v: unknown, ...rest: any[]) => v is infer G ? G : never;",
            filename,
            name: "Unknown fixes the input domain",
        },
        {
            code: "type View<F> = F extends (v: any, ...rest: string[]) => v is infer G ? G : never;",
            filename,
            name: "A typed rest narrows the callable domain",
        },
        {
            code: "type View<F> = F extends (v: any, ...args: any[]) => v is (infer G extends string) ? G : never;",
            filename,
            name: "A constrained inferred type",
        },
        {
            code: "type View<F> = F extends (v: any, ...args: any[]) => args is infer G ? G : never;",
            filename,
            name: "The predicate target must be the first parameter",
        },
        {
            code: "type View<F, Other> = F extends (v: any, ...args: any[]) => v is infer G ? Other : never;",
            filename,
            name: "The true branch refers to a different type parameter",
        },
        {
            code: "type View<F> = F extends (v: any, ...args: any[]) => asserts v is infer G ? G : never;",
            filename,
            name: "An assertion signature",
        },
        {
            code: "type Candidate = (() => boolean) | ((v: any) => v is string); type View = Candidate extends (v: any, ...args: any[]) => v is infer G ? G : never;",
            filename,
            name: "A concrete check type is non-distributive",
        },
        {
            code: "type View<F> = [F] extends [(v: any, ...args: any[]) => v is infer G] ? G : never;",
            filename,
            name: "A wrapped type parameter is non-distributive",
        },
        {
            code: "type View<F> = F extends (v?: any, ...args: any[]) => v is infer G ? G : never;",
            filename,
            name: "An optional first argument",
        },
        {
            code: "type View<F> = F extends (this: any, ...args: any[]) => this is infer G ? G : never;",
            filename,
            name: "A method with a this receiver",
        },
    ],
});

describe(ruleId, () => {
    it("parses the applied GuardedType fix for generated declarations", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.nat({ max: 4096 }),
                fc.boolean(),
                (suffix, constrained) => {
                    const parameter = `Input${suffix}`;
                    const value = `item${suffix}`;
                    const result = `Result${suffix}`;
                    const head = `export type Target<${parameter}${constrained ? " extends (...args: any[]) => unknown" : ""}> = `;
                    const handWritten = `${parameter} extends (${value}: any, ...rest: any[]) => ${value} is infer ${result} ? ${result} : never`;
                    const imports =
                        'import type { GuardedType } from "type-fest";\n';
                    const fixed = applyUpstreamRuleFix(
                        ruleId,
                        `${imports}${head}${handWritten};`,
                        filename
                    );

                    expect(fixed).toBe(
                        `${imports}${head}GuardedType<${parameter}>;`
                    );
                    expect(
                        parser.parseForESLint(fixed, { sourceType: "module" })
                            .ast.body
                    ).toHaveLength(2);
                }
            ),
            fastCheckRunConfig.default
        );
    });
});
