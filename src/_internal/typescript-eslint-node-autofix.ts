/**
 * @packageDocumentation
 * Shared type-aware guardrails for skipping risky rule reports/fixes on
 * `@typescript-eslint` AST-node expressions.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { JsonObject, UnknownArray } from "type-fest";
import type ts from "typescript";

import { isDefined } from "ts-extras";

import { safeTypeOperation } from "./safe-type-operation.js";
import { getVariableInScopeChain } from "./scope-variable.js";
import { getTypedRuleServices } from "./typed-rule.js";

const tsEslintNodeTypeTextPattern = /\bTSESTree\.\w*Node\b/v;

const isTypeScriptEslintDeclarationPath = (fileName: string): boolean =>
    fileName.replaceAll("\\", "/").includes("/@typescript-eslint/");

const isNodeLikeSymbolName = (symbolName: string): boolean =>
    symbolName === "Node" || symbolName.endsWith("Node");

type UnknownRecord = JsonObject;

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

const getTypeScriptEslintNamespaceImportNames = (
    sourceCode: Readonly<TSESLint.SourceCode>
): ReadonlySet<string> => {
    const namespaceNames = new Set<string>();
    const sourceAst = (
        sourceCode as Readonly<{
            ast?: Readonly<{
                body?: readonly TSESTree.ProgramStatement[];
            }>;
        }>
    ).ast;

    if (!isDefined(sourceAst) || !Array.isArray(sourceAst.body)) {
        return namespaceNames;
    }

    for (const statement of sourceAst.body) {
        if (
            statement.type !== "ImportDeclaration" ||
            statement.source.value !== "@typescript-eslint/utils"
        ) {
            continue;
        }

        for (const specifier of statement.specifiers) {
            if (specifier.type === "ImportNamespaceSpecifier") {
                namespaceNames.add(specifier.local.name);
                continue;
            }

            if (
                specifier.type === "ImportSpecifier" &&
                specifier.imported.type === "Identifier" &&
                specifier.imported.name === "TSESTree"
            ) {
                namespaceNames.add(specifier.local.name);
            }
        }
    }

    return namespaceNames;
};

const isTypeScriptEslintQualifiedTypeName = (
    typeName: unknown,
    namespaceNames: ReadonlySet<string>
): boolean => {
    if (!isUnknownRecord(typeName) || typeName["type"] !== "TSQualifiedName") {
        return false;
    }

    const left = typeName["left"];
    const right = typeName["right"];

    return (
        isUnknownRecord(left) &&
        left["type"] === "Identifier" &&
        typeof left["name"] === "string" &&
        namespaceNames.has(left["name"]) &&
        isUnknownRecord(right) &&
        right["type"] === "Identifier" &&
        typeof right["name"] === "string"
    );
};

const containsTypeScriptEslintTypeReference = (
    rootNode: unknown,
    namespaceNames: ReadonlySet<string>
): boolean => {
    if (namespaceNames.size === 0) {
        return false;
    }

    const visitedNodes = new Set<UnknownRecord>();
    const pendingNodes: unknown[] = [rootNode];

    while (pendingNodes.length > 0) {
        const currentNode = pendingNodes.pop();

        if (!isUnknownRecord(currentNode) || visitedNodes.has(currentNode)) {
            continue;
        }

        visitedNodes.add(currentNode);

        if (
            currentNode["type"] === "TSTypeReference" &&
            isTypeScriptEslintQualifiedTypeName(
                currentNode["typeName"],
                namespaceNames
            )
        ) {
            return true;
        }

        if (isTypeScriptEslintQualifiedTypeName(currentNode, namespaceNames)) {
            return true;
        }

        for (const value of Object.values(currentNode)) {
            if (Array.isArray(value)) {
                pendingNodes.push(...value);
                continue;
            }

            if (isUnknownRecord(value)) {
                pendingNodes.push(value);
            }
        }
    }

    return false;
};

const isTypeScriptEslintNodeLikeExpressionByDefinition = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    expression: Readonly<TSESTree.Expression>
): boolean => {
    if (expression.type !== "Identifier") {
        return false;
    }

    const namespaceNames = getTypeScriptEslintNamespaceImportNames(
        context.sourceCode
    );

    const resolutionResult = safeTypeOperation({
        operation: () => {
            const currentScope = context.sourceCode.getScope(expression);
            const variable = getVariableInScopeChain(
                currentScope,
                expression.name
            );

            if (variable === null) {
                return false;
            }

            const visitedDefinitionNodes = new Set<TSESTree.Node>();
            const pendingDefinitionNodes: TSESTree.Node[] = [];

            const enqueueDefinitionNode = (
                node: null | Readonly<TSESTree.Node> | undefined
            ): void => {
                if (node === null || !isDefined(node)) {
                    return;
                }

                if (visitedDefinitionNodes.has(node)) {
                    return;
                }

                pendingDefinitionNodes.push(node);
            };

            for (const definition of variable.defs) {
                enqueueDefinitionNode(definition.node);
            }

            while (pendingDefinitionNodes.length > 0) {
                const definitionNode = pendingDefinitionNodes.pop();

                if (!isDefined(definitionNode)) {
                    continue;
                }

                visitedDefinitionNodes.add(definitionNode);

                if (
                    containsTypeScriptEslintTypeReference(
                        definitionNode,
                        namespaceNames
                    )
                ) {
                    return true;
                }

                if (
                    definitionNode.type === "VariableDeclarator" &&
                    definitionNode.init !== null &&
                    definitionNode.init.type === "MemberExpression" &&
                    definitionNode.init.object.type === "Identifier"
                ) {
                    const { object } = definitionNode.init;
                    const objectVariable = getVariableInScopeChain(
                        currentScope,
                        object.name
                    );

                    if (objectVariable === null) {
                        continue;
                    }

                    for (const objectDefinition of objectVariable.defs) {
                        enqueueDefinitionNode(objectDefinition.node);
                    }
                }
            }

            return false;
        },
        reason: "ts-eslint-node-autofix-definition-fallback-failed",
    });

    if (!resolutionResult.ok) {
        return false;
    }

    return resolutionResult.value;
};

const collectNestedTypeArguments = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): readonly ts.Type[] => {
    const collectedTypes: ts.Type[] = [];

    const aliasTypeArguments = (
        type as Readonly<{
            aliasTypeArguments?: readonly ts.Type[];
        }>
    ).aliasTypeArguments;

    if (isDefined(aliasTypeArguments)) {
        collectedTypes.push(...aliasTypeArguments);
    }

    const checkerTypeArgumentsResult = safeTypeOperation({
        operation: () => checker.getTypeArguments(type as ts.TypeReference),
        reason: "ts-eslint-node-autofix-get-type-arguments-failed",
    });

    if (checkerTypeArgumentsResult.ok) {
        collectedTypes.push(...checkerTypeArgumentsResult.value);
    }

    return collectedTypes;
};

/**
 * Determine whether a TypeScript type resolves to an `@typescript-eslint` AST
 * node type.
 *
 * @param checker - Type checker for symbol and declaration inspection.
 * @param type - Candidate type to inspect.
 *
 * @returns `true` when the candidate resolves to a `TSESTree` node type.
 */
export const isTypeScriptEslintNodeType = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): boolean => {
    const visitedTypes = new Set<ts.Type>();
    const pendingTypes: ts.Type[] = [type as ts.Type];

    while (pendingTypes.length > 0) {
        const currentType = pendingTypes.pop();

        if (!isDefined(currentType) || visitedTypes.has(currentType)) {
            continue;
        }

        visitedTypes.add(currentType);

        const renderedTypeText = checker.typeToString(currentType);
        if (tsEslintNodeTypeTextPattern.test(renderedTypeText)) {
            return true;
        }

        const symbol = currentType.aliasSymbol ?? currentType.getSymbol();

        if (isDefined(symbol)) {
            const symbolName = checker.symbolToString(symbol);
            const declarations = symbol.getDeclarations() ?? [];

            const hasTypeScriptEslintDeclaration = declarations.some(
                (declaration) =>
                    isTypeScriptEslintDeclarationPath(
                        declaration.getSourceFile().fileName
                    )
            );

            if (
                hasTypeScriptEslintDeclaration &&
                isNodeLikeSymbolName(symbolName)
            ) {
                return true;
            }
        }

        if (currentType.isUnionOrIntersection()) {
            pendingTypes.push(...currentType.types);
        }

        const nestedTypeArguments = collectNestedTypeArguments(
            checker,
            currentType
        );
        if (nestedTypeArguments.length > 0) {
            pendingTypes.push(...nestedTypeArguments);
        }

        const apparentType = checker.getApparentType(currentType);
        if (apparentType !== currentType) {
            pendingTypes.push(apparentType);
        }

        const baseConstraintType = checker.getBaseConstraintOfType(currentType);
        if (
            isDefined(baseConstraintType) &&
            baseConstraintType !== currentType
        ) {
            pendingTypes.push(baseConstraintType);
        }
    }

    return false;
};

/**
 * Build a predicate that skips rule reporting/fixing when the compared
 * expression resolves to an `@typescript-eslint` AST node.
 *
 * @param context - Rule context for typed parser services.
 *
 * @returns Expression predicate that returns `true` when the current rule
 *   should skip reporting/fixing for the expression.
 */
export const createTypeScriptEslintNodeExpressionSkipChecker = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>
): ((expression: Readonly<TSESTree.Expression>) => boolean) => {
    const typedServicesResult = safeTypeOperation({
        operation: () => getTypedRuleServices(context),
        reason: "ts-eslint-node-autofix-typed-services-unavailable",
    });

    if (!typedServicesResult.ok) {
        return (expression) =>
            isTypeScriptEslintNodeLikeExpressionByDefinition(
                context,
                expression
            );
    }

    const { checker, parserServices } = typedServicesResult.value;

    return (expression) => {
        const isNodeTypedExpressionResult = safeTypeOperation({
            operation: () => {
                const tsNode =
                    parserServices.esTreeNodeToTSNodeMap.get(expression);

                if (!isDefined(tsNode)) {
                    return false;
                }

                const expressionType = checker.getTypeAtLocation(tsNode);

                return isTypeScriptEslintNodeType(checker, expressionType);
            },
            reason: "ts-eslint-node-autofix-expression-check-failed",
        });

        if (
            isNodeTypedExpressionResult.ok &&
            isNodeTypedExpressionResult.value
        ) {
            return true;
        }

        return isTypeScriptEslintNodeLikeExpressionByDefinition(
            context,
            expression
        );
    };
};

/**
 * Backward-compatible alias kept temporarily while callsites migrate.
 */
export const createTypeScriptEslintNodeAutofixSuppressionChecker =
    createTypeScriptEslintNodeExpressionSkipChecker as <
        MessageIds extends string,
        Options extends Readonly<UnknownArray>,
    >(
        context: Readonly<TSESLint.RuleContext<MessageIds, Options>>
    ) => (expression: Readonly<TSESTree.Expression>) => boolean;
