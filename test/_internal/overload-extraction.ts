import { addTypeFestRuleMetadataSmokeTests } from "./rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./ruleTester";
import { readTypedFixture, typedFixturePath } from "./typed-rule-tester";

/** Test named, qualified and shadowed bindings for an overload rule. */
export const testOverloadExtraction = ({
    fixtureAliases,
    helper,
    imports,
    ruleName,
    wrapper,
}: Readonly<{
    fixtureAliases: readonly [string, string];
    helper: string;
    imports: string;
    ruleName:
        | "prefer-type-fest-overload-parameters"
        | "prefer-type-fest-overload-return-type";
    wrapper: string;
}>): void => {
    const fixtureName = `${ruleName}.ts`;
    const filename = typedFixturePath("upstream-latest", fixtureName);
    const fixture = readTypedFixture("upstream-latest", fixtureName);
    const [namedUse, namespaceUse] = fixtureAliases;
    const expectedType = `${helper}<typeof convert>`;
    const messageId = "preferUpstreamType";
    const imported = `import type { ${imports} } from "type-fest"; `;
    const expression = `${wrapper}<Overloads<F>[number]>`;
    const alias = `type Result<F extends (...args: never[]) => unknown> = ${expression};`;

    addTypeFestRuleMetadataSmokeTests(ruleName);
    createRuleTester().run(ruleName, getPluginRule(ruleName), {
        invalid: [
            {
                code: fixture,
                errors: [{ messageId }, { messageId }],
                filename,
                name: "recognizes aliased and namespace imports and reuses the available helper",
                output: fixture
                    .replace(namedUse, expectedType)
                    .replace(namespaceUse, expectedType),
            },
            {
                code:
                    imported +
                    alias.replace("[number]", "[/* all signatures */ number]"),
                errors: [{ messageId }],
                filename,
                name: "preserves a comment inside the expression",
                output: null,
            },
            {
                code: `${imported}namespace Nested { type ${helper}<T> = T; ${alias} }`,
                errors: [{ messageId }],
                filename,
                name: "keeps a shadowed replacement name out of autofixes",
                output: null,
            },
        ],
        valid: [
            {
                code: `${imported}type Results<F extends (...args: never[]) => unknown> = [${helper}<F>, ${wrapper}<F>, ${wrapper}<Overloads<F>[0]>, ${wrapper}<Overloads<F>["length"]>];`,
                filename,
                name: "keeps single overloads, plain functions, and unrelated indices",
            },
            {
                code: `${imported}namespace Nested { type Overloads<T> = [T]; ${alias} }`,
                filename,
                name: "ignores a shadowed inner Overloads alias",
            },
            {
                code: `${imported}namespace Nested { type ${wrapper}<T> = T; ${alias} }`,
                filename,
                name: "ignores a shadowed outer utility",
            },
            {
                code: imported.replace("type-fest", "other") + alias,
                filename,
                name: "requires helpers imported from type-fest",
            },
            {
                code: imported + alias,
                filename: typedFixturePath("file.ts"),
                name: "skips a consumer resolving the legacy release",
            },
        ],
    });
};
