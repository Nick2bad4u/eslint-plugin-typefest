/** @packageDocumentation RuleTester coverage for ReadonlyDate. */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";
import { applyUpstreamRuleFix } from "./_internal/upstream-fix-output";

const ruleId = "prefer-type-fest-readonly-date";
const fixtureName = `${ruleId}.invalid.ts`;
const filename = typedFixturePath("upstream-latest", fixtureName);
const code = readTypedFixture("upstream-latest", fixtureName);
const expected = code.replace(
    `Readonly<Omit<Date, \`set\${string}\`>>`,
    "ReadonlyDate"
);

createTypedRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code,
            errors: [
                {
                    data: { replacement: "ReadonlyDate" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: expected,
        },
        {
            code: `type View = Readonly<Omit<Date, /* retained */ \`set\${string}\`>>;`,
            errors: [{ messageId: "preferUpstreamType" }],
            filename,
            output: null,
        },
        {
            code: `type View<ReadonlyDate> = Readonly<Omit<Date, \`set\${string}\`>>;`,
            errors: [{ messageId: "preferUpstreamType" }],
            filename,
            output: null,
        },
    ],
    valid: [
        { code: expected, filename },
        { code, filename: typedFixturePath("file.ts") },
        {
            code: 'type View = Readonly<Omit<Date, "setTime" | "setDate">>;',
            filename,
            name: "A concrete list of setters",
        },
        {
            code: `type View = Readonly<Omit<Date, \`get\${string}\`>>;`,
            filename,
            name: "A different key prefix",
        },
        {
            code: `type View = Readonly<Omit<Date, \`setUTC\${string}\`>>;`,
            filename,
            name: "A partial setter wildcard",
        },
        {
            code: `interface Local { setLabel(s: string): void } type View = Readonly<Omit<Local, \`set\${string}\`>>;`,
            filename,
            name: "A different global or local receiver",
        },
        {
            code: `export {}; interface Date { custom: boolean } type View = Readonly<Omit<Date, \`set\${string}\`>>;`,
            filename,
            name: "A local Date declaration",
        },
        {
            code: `export {}; type Omit<T, Keys> = T; type View = Readonly<Omit<Date, \`set\${string}\`>>;`,
            filename,
            name: "A local Omit declaration",
        },
        {
            code: `export {}; type Readonly<T> = T; type View = Readonly<Omit<Date, \`set\${string}\`>>;`,
            filename,
            name: "A local Readonly declaration",
        },
        {
            code: `export {}; declare global { interface Date { [name: string]: unknown } } type View = Readonly<Omit<Date, \`set\${string}\`>>;`,
            filename,
            name: "An augmented index signature changes the Omit projection",
        },
    ],
});

describe(ruleId, () => {
    it("parses the applied ReadonlyDate fix for generated declarations", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    "readonly [TARGET]",
                    "Promise<TARGET>",
                    "TARGET | null",
                    "{ readonly value: TARGET }"
                ),
                fc.nat({ max: 4096 }),
                (wrapper, suffix) => {
                    const imports =
                        'import type { ReadonlyDate } from "type-fest";\n';
                    const prefix = `${imports}export type DateView${suffix} = `;
                    const original = wrapper.replace(
                        "TARGET",
                        `Readonly<Omit<Date, \`set\${string}\`>>`
                    );
                    const fixed = applyUpstreamRuleFix(
                        ruleId,
                        `${prefix}${original};`,
                        filename
                    );

                    expect(fixed).toBe(
                        `${prefix}${wrapper.replace("TARGET", "ReadonlyDate")};`
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
