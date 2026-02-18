/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-non-empty-tuple`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const normalizeTypeText = (text: string): string => text.replaceAll(/\s+/g, "");

type RestAnnotation = TSESTree.TSRestType["typeAnnotation"];
type TupleElement = TSESTree.TSTupleType["elementTypes"][number];

const getRequiredTupleElementType = (
    element: TupleElement
): null | TSESTree.TypeNode => {
    if (element.type === "TSNamedTupleMember") {
        if (element.optional) {
            return null;
        }

        return element.elementType;
    }

    if (element.type === "TSOptionalType" || element.type === "TSRestType") {
        return null;
    }

    return element;
};

const unwrapRestAnnotation = (
    annotation: RestAnnotation
): null | TSESTree.TypeNode => {
    if (annotation.type === "TSNamedTupleMember") {
        return annotation.elementType;
    }

    return annotation;
};

const getRestArrayElementType = (
    element: TupleElement
): null | TSESTree.TypeNode => {
    if (element.type !== "TSRestType") {
        return null;
    }

    const restType = unwrapRestAnnotation(element.typeAnnotation);
    if (restType?.type !== "TSArrayType") {
        return null;
    }

    return restType.elementType;
};

const preferTypeFestNonEmptyTupleRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;

            return {
                TSTypeOperator(node) {
                    if (node.operator !== "readonly") {
                        return;
                    }

                    const tupleType = node.typeAnnotation;
                    if (tupleType?.type !== "TSTupleType") {
                        return;
                    }

                    if (tupleType.elementTypes.length !== 2) {
                        return;
                    }

                    const [firstElement, restElement] = tupleType.elementTypes;
                    if (!firstElement || !restElement) {
                        return;
                    }

                    const firstType = getRequiredTupleElementType(firstElement);
                    if (!firstType) {
                        return;
                    }

                    const restArrayElementType =
                        getRestArrayElementType(restElement);
                    if (!restArrayElementType) {
                        return;
                    }

                    const firstText = normalizeTypeText(
                        sourceCode.getText(firstType)
                    );
                    const restText = normalizeTypeText(
                        sourceCode.getText(restArrayElementType)
                    );

                    if (firstText !== restText) {
                        return;
                    }

                    context.report({
                        messageId: "preferNonEmptyTuple",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest NonEmptyTuple over readonly [T, ...T[]] tuple patterns.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-non-empty-tuple.md",
            },
            messages: {
                preferNonEmptyTuple:
                    "Prefer `NonEmptyTuple<T>` from type-fest over `readonly [T, ...T[]]`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-non-empty-tuple",
    });

export default preferTypeFestNonEmptyTupleRule;
