/**
 * @packageDocumentation
 * Compatibility wrappers for optional TypeScript TypeChecker APIs.
 */
import type { UnknownArray } from "type-fest";
import type ts from "typescript";

import { isTypeReferenceType } from "@typescript-eslint/type-utils";

type TypeCheckerMethod<Result> = (
    this: Readonly<ts.TypeChecker>,
    ...arguments_: Readonly<UnknownArray>
) => Result;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The result type models optional TypeChecker APIs whose return types vary by method name.
const callTypeCheckerMethod = <Result>(
    checker: Readonly<ts.TypeChecker>,
    methodName: string,
    ...arguments_: Readonly<UnknownArray>
): Result | undefined => {
    const method: unknown = Reflect.get(checker, methodName);

    if (typeof method !== "function") {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Optional checker APIs are verified as functions before invoking with the known checker receiver.
    const typedMethod = method as TypeCheckerMethod<Result>;

    return typedMethod.apply(checker, [...arguments_]);
};

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
): ts.Type | undefined =>
    callTypeCheckerMethod<ts.Type>(checker, "getApparentType", type);

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
): readonly ts.BaseType[] | undefined =>
    callTypeCheckerMethod<readonly ts.BaseType[]>(
        checker,
        "getBaseTypes",
        type
    );

/**
 * Read `checker.getStringType` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 *
 * @returns Primitive string type when available; otherwise `undefined`.
 */
export const getTypeCheckerStringType = (
    checker: Readonly<ts.TypeChecker>
): ts.Type | undefined =>
    callTypeCheckerMethod<ts.Type>(checker, "getStringType");

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
): boolean | undefined =>
    callTypeCheckerMethod<boolean>(
        checker,
        "isTypeAssignableTo",
        source,
        target
    );

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
): ts.Type | undefined =>
    callTypeCheckerMethod<ts.Type>(checker, "getBaseConstraintOfType", type);

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
): boolean | undefined =>
    callTypeCheckerMethod<boolean>(checker, "isArrayType", type);

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
): boolean | undefined =>
    callTypeCheckerMethod<boolean>(checker, "isTupleType", type);

/**
 * Read `checker.getTypeArguments` when the host TypeScript version provides it.
 *
 * @param checker - TypeScript type checker.
 * @param type - Candidate type.
 *
 * @returns Type arguments when available; otherwise `undefined`.
 */
export const getTypeCheckerTypeArguments = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): readonly ts.Type[] | undefined => {
    if (!isTypeReferenceType(type)) {
        return undefined;
    }

    return callTypeCheckerMethod<readonly ts.Type[]>(
        checker,
        "getTypeArguments",
        type
    );
};
