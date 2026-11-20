import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

import plugin from "../src/plugin";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const arrayElement = "typefest/prefer-type-fest-array-element";
const except = "typefest/prefer-type-fest-except";
const readonlyDate = "typefest/prefer-type-fest-readonly-date";

describe("coordination between generic and upstream-specific rules", () => {
    it.each([
        ["parameters", ".ts"],
        ["parameters", ".namespace.ts"],
        ["return-type", ".ts"],
        ["return-type", ".namespace.ts"],
    ])("prefers the complete overload %s expression in %s", (kind, suffix) => {
        expect.hasAssertions();

        const basename = `prefer-type-fest-overload-${kind}`;
        const rule = `typefest/${basename}`;
        const fixture = `${basename}${suffix}`;
        const code = readTypedFixture("upstream-latest", fixture);
        const options = {
            filename: typedFixturePath("upstream-latest", fixture),
        };
        const config = { ...plugin.configs.all, files: ["**/*.ts"] };
        const linter = new Linter();
        const diagnostics = linter.verify(code, config, options);

        expect(diagnostics.map(({ ruleId }) => ruleId)).toStrictEqual([rule]);

        const fixed = linter.verifyAndFix(code, config, options);

        expect(fixed.output).not.toContain("ArrayElement");
        expect(fixed.messages).toStrictEqual([]);

        const standalone = linter.verify(
            code,
            { ...config, rules: { [arrayElement]: "error" } },
            options
        );

        expect(standalone.map(({ ruleId }) => ruleId)).toStrictEqual([
            arrayElement,
        ]);
    });

    it("keeps Date's open setter pattern out of Except's constrained keys", () => {
        expect.hasAssertions();

        const fixture = "prefer-type-fest-readonly-date.invalid.ts";
        const code = readTypedFixture("upstream-latest", fixture);
        const options = {
            filename: typedFixturePath("upstream-latest", fixture),
        };
        const config = { ...plugin.configs.all, files: ["**/*.ts"] };
        const linter = new Linter();

        expect(
            linter.verify(code, config, options).map(({ ruleId }) => ruleId)
        ).toStrictEqual([readonlyDate]);

        const explicitKey = 'export type One = Omit<Date, "setTime">;';
        const messages = linter.verify(
            `${code}\n${explicitKey}`,
            { ...config, rules: { [except]: "error" } },
            options
        );

        expect(messages.map(({ ruleId }) => ruleId)).toStrictEqual([except]);
    });
});
