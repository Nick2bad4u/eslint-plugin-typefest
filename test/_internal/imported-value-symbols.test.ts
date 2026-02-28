/**
 * @packageDocumentation
 * Unit tests for imported-value helper discovery and import-aware replacement
 * fixers.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { describe, expect, it } from "vitest";

import {
    collectDirectNamedValueImportsFromSource,
    createMemberToFunctionCallFix,
    createMethodToFunctionCallFix,
    createSafeValueArgumentFunctionCallFix,
    createSafeValueReferenceReplacementFix,
    getSafeLocalNameForImportedValue,
} from "../../src/_internal/imported-value-symbols";

/** Rule context shape required by value-fixer helper tests. */
type RuleContext = Parameters<
    typeof createMethodToFunctionCallFix
>[0]["context"];

/** Build a minimal SourceCode-like fixture from an AST body list. */
const createSourceCode = (
    body: Readonly<UnknownArray>
): Parameters<typeof collectDirectNamedValueImportsFromSource>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<
        typeof collectDirectNamedValueImportsFromSource
    >[0];

/** Create an import specifier test node with configurable import kind. */
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

/** Create an import declaration test node for a given module source. */
const createImportDeclaration = (
    sourceValue: string,
    specifiers: Readonly<UnknownArray>,
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
    sourceModuleName: string,
    options: Readonly<{
        parentImportKind?: "type" | "value";
        specifierImportKind?: "type" | "value";
        specifierType?: string;
    }> = {}
): unknown => ({
    node: {
        imported: {
            name: importedName,
            type: "Identifier",
        },
        importKind: options.specifierImportKind ?? "value",
        local: {
            name: localName,
            type: "Identifier",
        },
        parent: {
            importKind: options.parentImportKind ?? "value",
            source: {
                value: sourceModuleName,
            },
            type: "ImportDeclaration",
        },
        type: options.specifierType ?? "ImportSpecifier",
    },
    type: "ImportBinding",
});

const getNodeTextFromSyntheticNode = (node: unknown): string => {
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

/** Create a single-scope rule context fixture with supplied bindings. */
const createRuleContextWithVariables = (
    variablesByName: Readonly<ReadonlyMap<string, unknown>>
): RuleContext => {
    const scope = {
        set: new Map(variablesByName),
        upper: null,
    };

    return {
        sourceCode: {
            getScope: () => scope as unknown as Readonly<TSESLint.Scope.Scope>,
            getText: getNodeTextFromSyntheticNode,
        },
    } as unknown as RuleContext;
};

/** Create a nested-scope context fixture for shadowing tests. */
const createRuleContextWithNestedScopes = (
    innerVariablesByName: Readonly<ReadonlyMap<string, unknown>>,
    outerVariablesByName: Readonly<ReadonlyMap<string, unknown>>
): RuleContext => {
    const outerScope = {
        set: new Map(outerVariablesByName),
        upper: null,
    };

    const innerScope = {
        set: new Map(innerVariablesByName),
        upper: outerScope,
    };

    return {
        sourceCode: {
            getScope: () =>
                innerScope as unknown as Readonly<TSESLint.Scope.Scope>,
            getText: getNodeTextFromSyntheticNode,
        },
    } as unknown as RuleContext;
};

/** Create a context fixture that declares one imported value binding. */
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

/** Build a map of imported symbol to local alias set. */
const createImportsMap = (
    importedName: string,
    ...localNames: readonly string[]
): ReadonlyMap<string, ReadonlySet<string>> =>
    new Map([[importedName, new Set(localNames)]]);

/** Execute a report-fix callback and collect emitted replacement text values. */
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

    it("ignores specifiers whose imported or local nodes are not identifiers", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("ts-extras", [
                    {
                        imported: {
                            type: "Literal",
                            value: "arrayAt",
                        },
                        importKind: "value",
                        local: {
                            name: "arrayAt",
                            type: "Identifier",
                        },
                        type: "ImportSpecifier",
                    },
                    {
                        imported: {
                            name: "arrayAt",
                            type: "Identifier",
                        },
                        importKind: "value",
                        local: {
                            name: "arrayAtAlias",
                            type: "Literal",
                        },
                        type: "ImportSpecifier",
                    },
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(0);
    });

    it("ignores non-ImportSpecifier entries in import declarations", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("ts-extras", [
                    {
                        local: {
                            name: "arrayAt",
                            type: "Identifier",
                        },
                        type: "ImportDefaultSpecifier",
                    },
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(0);
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

    it("resolves candidate aliases from parent scope when not found in current scope", () => {
        expect.hasAssertions();

        const outerVariable = {
            defs: [
                createImportBindingDefinition(
                    "arrayIncludes",
                    "arrayIncludes",
                    "ts-extras"
                ),
            ],
        };

        const context = createRuleContextWithNestedScopes(
            new Map(),
            new Map([["arrayIncludes", outerVariable]])
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

        expect(safeName).toBe("arrayIncludes");
    });
});

describe(createMethodToFunctionCallFix, () => {
    it("returns null for non-member call expressions", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [],
                callee: {
                    name: "includes",
                    type: "Identifier",
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

        expect(fix).toBeNull();
    });

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

    it("wraps sequence-expression arguments to preserve single-argument semantics", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "left, right",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "left, right",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["isPresent((left, right))"]);
    });

    it("keeps already-parenthesized sequence-expression arguments unchanged", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "(left, right)",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "(left, right)",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["isPresent((left, right))"]);
    });

    it("preserves unicode, emoji, and nerd-font glyphs in argument text", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: '候補?.["emoji_🧪___値"]',
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: '候補?.["emoji_🧪___値"]',
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual([
            'isPresent(候補?.["emoji_🧪___値"])',
        ]);
    });

    it("trims unicode spacing around argument text before replacement", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "\u00A0\u2003候補?.name\u00A0",
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "候補?.name",
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["isPresent(候補?.name)"]);
    });
});

describe(createSafeValueReferenceReplacementFix, () => {
    it("returns null when the imported identifier is shadowed by a non-import binding", () => {
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

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when the in-scope import binding is type-only", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludes",
                                "ts-extras",
                                {
                                    parentImportKind: "type",
                                    specifierImportKind: "type",
                                }
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when import specifier importKind is type even with value import declaration", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludes",
                                "ts-extras",
                                {
                                    parentImportKind: "value",
                                    specifierImportKind: "type",
                                }
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when import binding node is not an import specifier", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludes",
                                "ts-extras",
                                {
                                    specifierType: "ImportDefaultSpecifier",
                                }
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when in-scope import local name does not match the imported name", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludesAlias",
                                "ts-extras"
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("inserts missing value import after directive prologue", () => {
        expect.hasAssertions();

        const directiveStatement = {
            directive: "use client",
            expression: {
                type: "Literal",
                value: "use client",
            },
            range: [0, 12],
            type: "ExpressionStatement",
        };
        const firstStatement = {
            range: [13, 30],
            type: "VariableDeclaration",
        };
        const programNode = {
            body: [directiveStatement, firstStatement],
            range: [0, 30],
            type: "Program",
        };

        const targetNode = {
            parent: programNode,
            type: "Identifier",
        } as unknown as Parameters<
            typeof createSafeValueReferenceReplacementFix
        >[0]["targetNode"];

        const context = createRuleContextWithVariables(new Map());
        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode,
        });

        expect(fix).toBeTypeOf("function");

        const insertAfterCalls: { target: unknown; text: string }[] = [];
        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fakeFixer = {
            insertTextAfter(target: unknown, text: string): string {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange(
                range: readonly [number, number],
                text: string
            ): string {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
            replaceText: (): string => "arrayIncludes",
        } as unknown as TSESLint.RuleFixer;

        fix?.(fakeFixer);

        expect(insertAfterCalls).toStrictEqual([
            {
                target: directiveStatement,
                text: '\nimport { arrayIncludes } from "ts-extras";',
            },
        ]);
        expect(insertBeforeRangeCalls).toStrictEqual([]);
    });
});
