/**
 * @packageDocumentation
 * Shared type-aware guardrails for skipping risky rule reports/fixes on
 * `@typescript-eslint` AST-node expressions.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray, UnknownRecord } from "type-fest";
import type ts from "typescript";

import { isDefined, objectHasOwn, safeCastTo } from "ts-extras";

import { safeTypeOperation } from "./safe-type-operation.js";
import { getVariableInScopeChain } from "./scope-variable.js";
import { setContainsValue } from "./set-membership.js";
import { isAsciiIdentifierPartCharacter } from "./text-character.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerBaseConstraintType,
    getTypeCheckerTypeArguments,
} from "./type-checker-compat.js";
import { getTypedRuleServices } from "./typed-rule.js";

const TYPESCRIPT_ESLINT_UTILS_MODULE_NAME = "@typescript-eslint/utils" as const;
const TYPESCRIPT_ESLINT_PACKAGE_SEGMENT = "@typescript-eslint" as const;
const TSESTREE_NAMESPACE_NAME = "TSESTree" as const;
const PATH_SEPARATOR = "/" as const;

const TYPESCRIPT_ESLINT_PACKAGE_PATH_SEGMENT =
    `${PATH_SEPARATOR}${TYPESCRIPT_ESLINT_PACKAGE_SEGMENT}${PATH_SEPARATOR}` as const;

/**
 * ESTree metadata keys that never contribute to semantic type-reference
 * detection during fallback node traversal.
 */
const IGNORED_TRAVERSAL_KEYS = new Set<string>([
    "comments",
    "end",
    "loc",
    "parent",
    "range",
    "start",
    "tokens",
]);

const tsEslintAstNamespaceNames = new Set<string>([TSESTREE_NAMESPACE_NAME]);
const namespaceImportNamesBySourceCode = new WeakMap<
    Readonly<TSESLint.SourceCode>,
    ReadonlySet<string>
>();

const isTypeScriptEslintDeclarationPath = (fileName: string): boolean => {
    const normalizedFileName = fileName.replaceAll("\\", PATH_SEPARATOR);

    return (
        normalizedFileName === TYPESCRIPT_ESLINT_PACKAGE_SEGMENT ||
        normalizedFileName.startsWith(
            `${TYPESCRIPT_ESLINT_PACKAGE_SEGMENT}${PATH_SEPARATOR}`
        ) ||
        normalizedFileName.endsWith(
            `${PATH_SEPARATOR}${TYPESCRIPT_ESLINT_PACKAGE_SEGMENT}`
        ) ||
        normalizedFileName.includes(TYPESCRIPT_ESLINT_PACKAGE_PATH_SEGMENT)
    );
};

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

/**
 * Return `true` when a record key should be excluded from semantic traversal.
 */
const shouldSkipTraversalKey = (key: string): boolean =>
    setContainsValue(IGNORED_TRAVERSAL_KEYS, key);

const containsNamespaceQualifiedReferenceText = (
    text: string,
    namespaceNames: ReadonlySet<string>
): boolean => {
    if (namespaceNames.size === 0) {
        return false;
    }

    for (const namespaceName of namespaceNames) {
        if (namespaceName.length === 0) {
            continue;
        }

        let index = text.indexOf(namespaceName);

        while (index !== -1) {
            const previousCharacter = text[index - 1] ?? "";
            const dotCharacter = text[index + namespaceName.length] ?? "";
            const nextCharacter = text[index + namespaceName.length + 1] ?? "";

            const hasIdentifierBoundaryBefore =
                index === 0 ||
                !isAsciiIdentifierPartCharacter(previousCharacter);

            if (
                hasIdentifierBoundaryBefore &&
                dotCharacter === "." &&
                isAsciiIdentifierPartCharacter(nextCharacter)
            ) {
                return true;
            }

            index = text.indexOf(namespaceName, index + namespaceName.length);
        }
    }

    return false;
};

const getTypeScriptEslintNamespaceImportNames = (
    sourceCode: Readonly<TSESLint.SourceCode>
): ReadonlySet<string> => {
    const cachedNamespaceNames =
        namespaceImportNamesBySourceCode.get(sourceCode);
    if (isDefined(cachedNamespaceNames)) {
        return cachedNamespaceNames;
    }

    const namespaceNames = new Set<string>();
    const programStatements = sourceCode.ast?.body;

    if (!Array.isArray(programStatements)) {
        namespaceImportNamesBySourceCode.set(sourceCode, namespaceNames);

        return namespaceNames;
    }

    for (const statement of programStatements) {
        if (
            statement.type !== "ImportDeclaration" ||
            statement.source.value !== TYPESCRIPT_ESLINT_UTILS_MODULE_NAME
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
                specifier.imported.name === TSESTREE_NAMESPACE_NAME
            ) {
                namespaceNames.add(specifier.local.name);
            }
        }
    }

    const readonlyNamespaceNames: ReadonlySet<string> = new Set(namespaceNames);

    namespaceImportNamesBySourceCode.set(sourceCode, readonlyNamespaceNames);

    return readonlyNamespaceNames;
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
        setContainsValue(namespaceNames, left["name"]) &&
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

        if (
            !isUnknownRecord(currentNode) ||
            setContainsValue(visitedNodes, currentNode)
        ) {
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

        for (const key in currentNode) {
            if (
                !objectHasOwn(currentNode, key) ||
                shouldSkipTraversalKey(key)
            ) {
                continue;
            }

            const value = currentNode[key];

            if (Array.isArray(value)) {
                for (const entry of value) {
                    pendingNodes.push(entry);
                }
                continue;
            }

            if (isUnknownRecord(value)) {
                pendingNodes.push(value);
            }
        }
    }

    return false;
};

const containsTypeScriptEslintTypeReferenceText = (
    text: string,
    namespaceNames: ReadonlySet<string>
): boolean => containsNamespaceQualifiedReferenceText(text, namespaceNames);

const isTypeScriptEslintNodeLikeExpressionByDefinition = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    expression: Readonly<TSESTree.Expression>,
    namespaceNames: ReadonlySet<string>
): boolean => {
    if (namespaceNames.size === 0) {
        return false;
    }

    if (expression.type !== "Identifier") {
        return false;
    }

    const definitionNodeTextByNode = new WeakMap<
        Readonly<TSESTree.Node>,
        string
    >();

    const getDefinitionNodeText = (
        definitionNode: Readonly<TSESTree.Node>,
        sourceCode: Readonly<TSESLint.SourceCode>
    ): string => {
        const cachedText = definitionNodeTextByNode.get(definitionNode);
        if (isDefined(cachedText)) {
            return cachedText;
        }

        const definitionNodeText = sourceCode.getText(definitionNode);

        definitionNodeTextByNode.set(definitionNode, definitionNodeText);

        return definitionNodeText;
    };

    const resolutionResult = safeTypeOperation({
        operation: () => {
            const { sourceCode } = context;
            const currentScope = sourceCode.getScope(expression);
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

                if (setContainsValue(visitedDefinitionNodes, node)) {
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

                const definitionNodeText = getDefinitionNodeText(
                    definitionNode,
                    sourceCode
                );
                if (
                    containsTypeScriptEslintTypeReferenceText(
                        definitionNodeText,
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

    const aliasTypeArguments = safeCastTo<
        Readonly<{
            aliasTypeArguments?: readonly ts.Type[];
        }>
    >(type).aliasTypeArguments;

    if (isDefined(aliasTypeArguments)) {
        for (const aliasTypeArgument of aliasTypeArguments) {
            collectedTypes.push(aliasTypeArgument);
        }
    }

    const checkerTypeArgumentsResult = safeTypeOperation({
        operation: () => getTypeCheckerTypeArguments(checker, type) ?? [],
        reason: "ts-eslint-node-autofix-get-type-arguments-failed",
    });

    if (checkerTypeArgumentsResult.ok) {
        for (const checkerTypeArgument of checkerTypeArgumentsResult.value) {
            collectedTypes.push(checkerTypeArgument);
        }
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
 * @returns `true` when the candidate resolves to a `TSESTree` AST type.
 */
export const isTypeScriptEslintAstType = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): boolean => {
    const visitedTypes = new Set<ts.Type>();
    const pendingTypes: ts.Type[] = [safeCastTo<ts.Type>(type)];

    while (pendingTypes.length > 0) {
        const currentType = pendingTypes.pop();

        if (
            !isDefined(currentType) ||
            setContainsValue(visitedTypes, currentType)
        ) {
            continue;
        }

        visitedTypes.add(currentType);

        const renderedTypeText = checker.typeToString(currentType);
        if (
            containsNamespaceQualifiedReferenceText(
                renderedTypeText,
                tsEslintAstNamespaceNames
            )
        ) {
            return true;
        }

        const symbol = currentType.aliasSymbol ?? currentType.getSymbol();

        if (isDefined(symbol)) {
            const declarations = symbol.getDeclarations() ?? [];

            const hasTypeScriptEslintDeclaration = declarations.some(
                (declaration) =>
                    isTypeScriptEslintDeclarationPath(
                        declaration.getSourceFile().fileName
                    )
            );

            if (hasTypeScriptEslintDeclaration) {
                return true;
            }
        }

        if (currentType.isUnionOrIntersection()) {
            for (const typePart of currentType.types) {
                pendingTypes.push(typePart);
            }
        }

        const nestedTypeArguments = collectNestedTypeArguments(
            checker,
            currentType
        );
        if (nestedTypeArguments.length > 0) {
            for (const nestedTypeArgument of nestedTypeArguments) {
                pendingTypes.push(nestedTypeArgument);
            }
        }

        const apparentType = getTypeCheckerApparentType(checker, currentType);
        if (isDefined(apparentType) && apparentType !== currentType) {
            pendingTypes.push(apparentType);
        }

        const baseConstraintType = getTypeCheckerBaseConstraintType(
            checker,
            currentType
        );
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
    const shouldSkipExpressionCache = new WeakMap<
        Readonly<TSESTree.Expression>,
        boolean
    >();

    const namespaceNames = getTypeScriptEslintNamespaceImportNames(
        context.sourceCode
    );

    const typedServicesResult = safeTypeOperation({
        operation: () => getTypedRuleServices(context),
        reason: "ts-eslint-node-autofix-typed-services-unavailable",
    });

    if (!typedServicesResult.ok) {
        return (expression) => {
            const cachedResult = shouldSkipExpressionCache.get(expression);

            if (isDefined(cachedResult)) {
                return cachedResult;
            }

            const shouldSkip = isTypeScriptEslintNodeLikeExpressionByDefinition(
                context,
                expression,
                namespaceNames
            );

            shouldSkipExpressionCache.set(expression, shouldSkip);

            return shouldSkip;
        };
    }

    const { checker, parserServices } = typedServicesResult.value;

    return (expression) => {
        const cachedResult = shouldSkipExpressionCache.get(expression);

        if (isDefined(cachedResult)) {
            return cachedResult;
        }

        const isNodeTypedExpressionResult = safeTypeOperation({
            operation: () => {
                const tsNode =
                    parserServices.esTreeNodeToTSNodeMap.get(expression);

                if (!isDefined(tsNode)) {
                    return false;
                }

                const expressionType = checker.getTypeAtLocation(tsNode);

                return isTypeScriptEslintAstType(checker, expressionType);
            },
            reason: "ts-eslint-node-autofix-expression-check-failed",
        });

        if (
            isNodeTypedExpressionResult.ok &&
            isNodeTypedExpressionResult.value
        ) {
            shouldSkipExpressionCache.set(expression, true);

            return true;
        }

        const shouldSkip = isTypeScriptEslintNodeLikeExpressionByDefinition(
            context,
            expression,
            namespaceNames
        );

        shouldSkipExpressionCache.set(expression, shouldSkip);

        return shouldSkip;
    };
};
