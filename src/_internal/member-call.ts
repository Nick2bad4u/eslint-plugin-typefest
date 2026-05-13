/**
 * @packageDocumentation
 * Shared call-expression helpers for matching method calls safely.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
/**
 * Strongly-typed shape for non-computed member calls with identifier receiver
 * and property (e.g. `Object.keys`).
 */
export type IdentifierMemberCallExpression = TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        object: TSESTree.Identifier;
        property: TSESTree.Identifier;
    };
};
/**
 * Strongly-typed shape for non-computed member calls with identifier property
 * (e.g. `value.includes`).
 */
export type IdentifierPropertyMemberCallExpression = TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        object: Exclude<TSESTree.MemberExpression["object"], TSESTree.Super>;
        property: TSESTree.Identifier;
    };
};
const isIdentifierMemberCallExpression = (
    options: Readonly<{
        memberName: string;
        node: Readonly<TSESTree.CallExpression>;
        objectName: string;
    }>
): options is Readonly<{
    memberName: string;
    node: IdentifierMemberCallExpression;
    objectName: string;
}> => {
    const { memberName, node, objectName } = options;
    if (node.optional) {
        return false;
    }
    const { callee } = node;
    return (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        !callee.optional &&
        callee.object.type === AST_NODE_TYPES.Identifier &&
        callee.object.name === objectName &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        callee.property.name === memberName
    );
};
const isIdentifierPropertyMemberCallExpression = (
    options: Readonly<{
        memberName: string;
        node: Readonly<TSESTree.CallExpression>;
    }>
): options is Readonly<{
    memberName: string;
    node: IdentifierPropertyMemberCallExpression;
}> => {
    const { memberName, node } = options;
    if (node.optional) {
        return false;
    }
    const { callee } = node;
    return (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        !callee.optional &&
        callee.object.type !== AST_NODE_TYPES.Super &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        callee.property.name === memberName
    );
};
/**
 * Match `ObjectName.methodName(...)` style calls.
 *
 * @param options - Candidate call expression and expected receiver/member
 *   names.
 *
 * @returns Narrowed call expression when the shape matches; otherwise `null`.
 */
export const getIdentifierMemberCall = (
    options: Readonly<{
        memberName: string;
        node: Readonly<TSESTree.CallExpression>;
        objectName: string;
    }>
): IdentifierMemberCallExpression | null => {
    if (!isIdentifierMemberCallExpression(options)) {
        return null;
    }
    return options.node;
};
/**
 * Match `<expression>.memberName(...)` style calls where the property is a
 * non-computed identifier.
 *
 * @param options - Candidate call expression and expected member name.
 *
 * @returns Narrowed call expression when matched; otherwise `null`.
 */
export const getIdentifierPropertyMemberCall = (
    options: Readonly<{
        memberName: string;
        node: Readonly<TSESTree.CallExpression>;
    }>
): IdentifierPropertyMemberCallExpression | null => {
    if (!isIdentifierPropertyMemberCallExpression(options)) {
        return null;
    }
    return options.node;
};
