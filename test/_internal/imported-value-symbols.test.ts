import type { TSESLint } from "@typescript-eslint/utils";

import { describe, expect, it } from "vitest";

import {
    collectDirectNamedValueImportsFromSource,
    createMemberToFunctionCallFix,
    createMethodToFunctionCallFix,
    createSafeValueArgumentFunctionCallFix,
    getSafeLocalNameForImportedValue,
} from "../../src/_internal/imported-value-symbols";

type RuleContext = Parameters<
    typeof createMethodToFunctionCallFix
>[0]["context"];

const createSourceCode = (
    body: unknown[]
): Parameters<typeof collectDirectNamedValueImportsFromSource>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<
        typeof collectDirectNamedValueImportsFromSource
    >[0];

const createImportSpecifier = (
    importedName: string,
    localName: string,
    importKind: "type" | "value" = "value"
): unknown => ({
    imported: {
        name: importedName,
        type: "Identifier",
    },
    importKind,
    local: {
        name: localName,
        type: "Identifier",
    },
    type: "ImportSpecifier",
});

const createImportDeclaration = (
    sourceValue: string,
    specifiers: unknown[],
    importKind: "type" | "value" = "value"
): unknown => ({
    importKind,
    source: {
        value: sourceValue,
    },
    specifiers,
    type: "ImportDeclaration",
});

const createImportBindingDefinition = (
    importedName: string,
    localName: string,
    sourceModuleName: string
): unknown => ({
    node: {
        imported: {
            name: importedName,
            type: "Identifier",
        },
        local: {
            name: localName,
            type: "Identifier",
        },
        parent: {
            source: {
                value: sourceModuleName,
            },
            type: "ImportDeclaration",
        },
        type: "ImportSpecifier",
    },
    type: "ImportBinding",
});

const createRuleContextWithVariables = (
    variablesByName: ReadonlyMap<string, unknown>
): RuleContext => {
    const getNodeText = (node: unknown): string => {
        if (
            typeof node === "object" &&
            node !== null &&
            "_text" in node &&
            typeof (node as { _text: unknown })._text === "string"
        ) {
            return (node as { _text: string })._text;
        }

        return "";
    };

    const scope = {
        set: new Map(variablesByName),
        upper: null,
    };

    return {
        sourceCode: {
            getScope: () => scope as unknown as Readonly<TSESLint.Scope.Scope>,
            getText: getNodeText,
        },
    } as unknown as RuleContext;
};

const createRuleContext = (
    importedName: string,
    sourceModuleName: string
): RuleContext => {
    const variable = {
        defs: [
            createImportBindingDefinition(
                importedName,
                importedName,
                sourceModuleName
            ),
        ],
    };

    return createRuleContextWithVariables(new Map([[importedName, variable]]));
};

const createImportsMap = (
    importedName: string,
    ...localNames: string[]
): ReadonlyMap<string, ReadonlySet<string>> =>
    new Map([[importedName, new Set(localNames)]]);

const invokeFix = (
    fix: null | TSESLint.ReportFixFunction
): readonly string[] => {
    const replacements: string[] = [];
    fix?.({
        replaceText: (_node: unknown, text: string) => {
            replacements.push(text);
            return text;
        },
    } as unknown as TSESLint.RuleFixer);

    return replacements;
};

describe(collectDirectNamedValueImportsFromSource, () => {
    it("ignores type-only import declarations and type-only import specifiers", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration(
                    "ts-extras",
                    [createImportSpecifier("arrayAt", "arrayAt")],
                    "type"
                ),
                createImportDeclaration("ts-extras", [
                    createImportSpecifier("arrayAt", "arrayAt", "type"),
                    createImportSpecifier("arrayIncludes", "arrayIncludes"),
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(1);
        expect(collected.has("arrayAt")).toBeFalsy();

        const includesAliases = collected.get("arrayIncludes");

        expect(includesAliases).toBeDefined();
        expect(includesAliases?.has("arrayIncludes")).toBeTruthy();
    });

    it("ignores imports from different source modules", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("other-lib", [
                    createImportSpecifier("arrayAt", "arrayAt"),
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(0);
    });

    it("collects multiple local aliases for a single imported symbol", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("ts-extras", [
                    createImportSpecifier("arrayAt", "arrayAt"),
                ]),
                createImportDeclaration("ts-extras", [
                    createImportSpecifier("arrayAt", "arrayAtAlias"),
                ]),
            ]),
            "ts-extras"
        );

        const aliases = collected.get("arrayAt");

        expect(aliases?.size).toBe(2);
        expect(aliases?.has("arrayAt")).toBeTruthy();
        expect(aliases?.has("arrayAtAlias")).toBeTruthy();
    });
});

describe(getSafeLocalNameForImportedValue, () => {
    it("returns a candidate name when scope binding points to the expected import", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBe("arrayIncludes");
    });

    it("returns null when no alias candidates are registered for the imported name", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: new Map([["arrayIncludes", new Set<string>()]]),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("returns null when candidate local name is not bound in the scope chain", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(new Map());
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("returns null when candidate variable has no import-binding definitions", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            {
                                type: "Variable",
                            },
                        ],
                    },
                ],
            ])
        );

        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("returns null when import-binding definition node is not an import specifier", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            {
                                node: {
                                    type: "Identifier",
                                },
                                type: "ImportBinding",
                            },
                        ],
                    },
                ],
            ])
        );

        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("returns null when import binding resolves to a different source module", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "other-library");
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });
});

describe(createMethodToFunctionCallFix, () => {
    it("returns null for optional member access calls", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [],
                callee: {
                    object: {
                        _text: "values",
                        type: "Identifier",
                    },
                    optional: true,
                    property: {
                        name: "includes",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                optional: false,
                type: "CallExpression",
            } as unknown as Parameters<
                typeof createMethodToFunctionCallFix
            >[0]["callNode"],
            context,
            importedName: "arrayIncludes",
            imports: new Map([["arrayIncludes", new Set(["arrayIncludes"])]]),
            sourceModuleName: "ts-extras",
        });

        expect(fix).toBeNull();
    });

    it("builds replacement text with comma-separated receiver and arguments", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const callNode = {
            arguments: [
                {
                    _text: "needle",
                    type: "Identifier",
                },
                {
                    _text: "fromIndex",
                    type: "Identifier",
                },
            ],
            callee: {
                object: {
                    _text: "values",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    name: "includes",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as Parameters<
            typeof createMethodToFunctionCallFix
        >[0]["callNode"];

        const fix = createMethodToFunctionCallFix({
            callNode,
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            sourceModuleName: "ts-extras",
        });

        expect(invokeFix(fix)).toStrictEqual([
            "arrayIncludes(values, needle, fromIndex)",
        ]);
    });

    it("builds replacement text without a trailing comma when there are no arguments", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [],
                callee: {
                    object: {
                        _text: "values",
                        type: "Identifier",
                    },
                    optional: false,
                    property: {
                        name: "includes",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                optional: false,
                type: "CallExpression",
            } as unknown as Parameters<
                typeof createMethodToFunctionCallFix
            >[0]["callNode"],
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            sourceModuleName: "ts-extras",
        });

        expect(invokeFix(fix)).toStrictEqual(["arrayIncludes(values)"]);
    });
});

describe(createMemberToFunctionCallFix, () => {
    it("returns null for optional member expressions", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayFirst", "ts-extras");
        const fix = createMemberToFunctionCallFix({
            context,
            importedName: "arrayFirst",
            imports: createImportsMap("arrayFirst", "arrayFirst"),
            memberNode: {
                object: {
                    _text: "values",
                    type: "Identifier",
                },
                optional: true,
                property: {
                    name: "0",
                    type: "Literal",
                    value: 0,
                },
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createMemberToFunctionCallFix
            >[0]["memberNode"],
            sourceModuleName: "ts-extras",
        });

        expect(fix).toBeNull();
    });
});

describe(createSafeValueArgumentFunctionCallFix, () => {
    it("returns null when argument text is whitespace-only after trimming", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "   ",
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "candidate",
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("emits negated helper call text when negated is true", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "candidate",
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            negated: true,
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "!candidate",
                type: "UnaryExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["!isPresent(candidate)"]);
    });
});
