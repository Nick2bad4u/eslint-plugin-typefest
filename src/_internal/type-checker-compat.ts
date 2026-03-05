/**
 * @packageDocumentation
 * Compatibility wrappers for optional TypeScript TypeChecker APIs.
 */
import type ts from "typescript";

/**
 * Read `checker.getApparentType` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 * @param type - Candidate type.
 *
 * @returns Apparent type when available; otherwise `undefined`.
 */
export const getTypeCheckerApparentType = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): ts.Type | undefined => {
    const checkerWithApparentType = checker as ts.TypeChecker & {
        getApparentType?: (type: Readonly<ts.Type>) => ts.Type;
    };

    return checkerWithApparentType.getApparentType?.call(checker, type);
};

/**
 * Read `checker.getBaseTypes` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 * @param type - Candidate type.
 *
 * @returns Base types when available; otherwise `undefined`.
 */
export const getTypeCheckerBaseTypes = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): readonly ts.BaseType[] | undefined => {
    const checkerWithBaseTypes = checker as ts.TypeChecker & {
        getBaseTypes?: (
            type: Readonly<ts.Type>
        ) => readonly ts.BaseType[] | undefined;
    };

    return checkerWithBaseTypes.getBaseTypes?.call(checker, type);
};

/**
 * Read `checker.getStringType` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 *
 * @returns Primitive string type when available; otherwise `undefined`.
 */
export const getTypeCheckerStringType = (
    checker: Readonly<ts.TypeChecker>
): ts.Type | undefined => {
    const checkerWithStringType = checker as ts.TypeChecker & {
        getStringType?: () => ts.Type;
    };

    return checkerWithStringType.getStringType?.call(checker);
};

/**
 * Read `checker.isTypeAssignableTo` when the host TypeScript version provides
 * it.
 *
 * @param checker - TypeScript type checker.
 * @param source - Candidate source type.
 * @param target - Candidate target type.
 *
 * @returns Assignability result when available; otherwise `undefined`.
 */
export const getTypeCheckerIsTypeAssignableToResult = (
    checker: Readonly<ts.TypeChecker>,
    source: Readonly<ts.Type>,
    target: Readonly<ts.Type>
): boolean | undefined => {
    const checkerWithAssignable = checker as ts.TypeChecker & {
        isTypeAssignableTo?: (
            source: Readonly<ts.Type>,
            target: Readonly<ts.Type>
        ) => boolean;
    };

    return checkerWithAssignable.isTypeAssignableTo?.call(
        checker,
        source,
        target
    );
};

/**
 * Read `checker.getBaseConstraintOfType` when the host TypeScript version
 * provides it.
 *
 * @param checker - TypeScript type checker.
 * @param type - Candidate type.
 *
 * @returns Base-constraint type when available; otherwise `undefined`.
 */
export const getTypeCheckerBaseConstraintType = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): ts.Type | undefined => {
    const checkerWithBaseConstraint = checker as ts.TypeChecker & {
        getBaseConstraintOfType?: (
            type: Readonly<ts.Type>
        ) => ts.Type | undefined;
    };

    return checkerWithBaseConstraint.getBaseConstraintOfType?.call(
        checker,
        type
    );
};

/**
 * Read `checker.isArrayType` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 * @param type - Candidate type.
 *
 * @returns Array-type result when available; otherwise `undefined`.
 */
export const getTypeCheckerIsArrayTypeResult = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): boolean | undefined => {
    const checkerWithArrayType = checker as ts.TypeChecker & {
        isArrayType?: (type: Readonly<ts.Type>) => boolean;
    };

    return checkerWithArrayType.isArrayType?.call(checker, type);
};

/**
 * Read `checker.isTupleType` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 * @param type - Candidate type.
 *
 * @returns Tuple-type result when available; otherwise `undefined`.
 */
export const getTypeCheckerIsTupleTypeResult = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): boolean | undefined => {
    const checkerWithTupleType = checker as ts.TypeChecker & {
        isTupleType?: (type: Readonly<ts.Type>) => boolean;
    };

    return checkerWithTupleType.isTupleType?.call(checker, type);
};

/**
 * Read `checker.getTypeArguments` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 * @param type - Candidate type reference.
 *
 * @returns Type arguments when available; otherwise `undefined`.
 */
export const getTypeCheckerTypeArguments = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.TypeReference>
): readonly ts.Type[] | undefined => {
    const checkerWithTypeArguments = checker as ts.TypeChecker & {
        getTypeArguments?: (
            type: Readonly<ts.TypeReference>
        ) => readonly ts.Type[];
    };

    return checkerWithTypeArguments.getTypeArguments?.call(checker, type);
};
