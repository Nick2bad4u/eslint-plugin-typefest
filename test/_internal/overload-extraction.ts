import { addTypeFestRuleMetadataSmokeTests } from "./rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./ruleTester";
import { readTypedFixture, typedFixturePath } from "./typed-rule-tester";

type OverloadRuleCase = Readonly<{
    fixtureAliases: readonly [string, string];
    helper: string;
    imports: string;
    ruleName:
        | "prefer-type-fest-overload-parameters"
        | "prefer-type-fest-overload-return-type";
    wrapper: string;
}>;

const messageId = "preferUpstreamType";

/** Read the alias and namespace uses from separate, compilable import contexts. */
const getFixtureCases = ({
    fixtureAliases,
    helper,
    ruleName,
}: OverloadRuleCase) => {
    const namedFile = `${ruleName}.ts`;
    const namespaceFile = `${ruleName}.namespace.ts`;
    const namedCode = readTypedFixture("upstream-latest", namedFile);
    const namespaceCode = readTypedFixture("upstream-latest", namespaceFile);
    const [namedUse, namespaceUse] = fixtureAliases;
    const replacement = `${helper}<typeof convert>`;
    const namespaceImport = 'import type * as TF from "type-fest";';
    return [
        {
            code: namedCode,
            errors: [{ messageId }],
            filename: typedFixturePath("upstream-latest", namedFile),
            name: "resolves named aliases and reuses the available canonical helper",
            output: namedCode.replace(namedUse, replacement),
        },
        {
            code: namespaceCode,
            errors: [{ messageId }],
            filename: typedFixturePath("upstream-latest", namespaceFile),
            name: "resolves a namespaced overload import in its own module",
            output: namespaceCode
                .replace(
                    namespaceImport,
                    `${namespaceImport}\nimport type { ${helper} } from "type-fest";`
                )
                .replace(namespaceUse, replacement),
        },
    ];
};

/** Cases where provenance, index selection, or the consumer version differs. */
const getValidCases = (
    { helper, wrapper }: OverloadRuleCase,
    imported: string,
    alias: string,
    filename: string
) => [
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
];

/** Test named, qualified and shadowed bindings for an overload rule. */
export const testOverloadExtraction = (options: OverloadRuleCase): void => {
    const { helper, imports, ruleName, wrapper } = options;
    const filename = typedFixturePath("upstream-latest", `${ruleName}.ts`);
    const imported = `import type { ${imports} } from "type-fest"; `;
    const expression = `${wrapper}<Overloads<F>[number]>`;
    const alias = `type Result<F extends (...args: never[]) => unknown> = ${expression};`;

    addTypeFestRuleMetadataSmokeTests(ruleName);
    createRuleTester().run(ruleName, getPluginRule(ruleName), {
        invalid: [
            ...getFixtureCases(options),
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
        valid: getValidCases(options, imported, alias, filename),
    });
};
