/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-promisable.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const inlineFixableInvalidCode = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type JobResult = MaybePromise<string>;",
    "type JobResult = Promisable<string>;"
);
const inlineInvalidWithoutFixCode = [
    'import type { MaybePromise } from "type-aliases";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");
const promiseFirstInvalidCode = "type Result = Promise<string> | string;";
const promiseSecondInvalidCode = "type Result = string | Promise<string>;";
const promiseLikeValidCode = "type Result = PromiseLike<string> | string;";
const promiseNoTypeArgumentsValidCode = "type Result = Promise | string;";
const promiseNullValidCode = "type Result = Promise<string> | null;";
const promiseUndefinedValidCode =
    "type Result = PromiseLike<string> | undefined;";
const promiseNeverValidCode = "type Result = Promise<string> | never;";
const promiseMismatchValidCode = "type Result = Promise<string> | number;";
const promiseThreeMemberUnionValidCode =
    "type Result = Promise<string> | number | string;";
const alreadyPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<string> | Promisable<string>;",
].join("\n");
const skipPathInvalidCode = promiseFirstInvalidCode;
const qualifiedPromiseValidCode =
    "type Result = globalThis.Promise<string> | string;";
const customWrapperValidCode = [
    "type MaybePromise<T> = Promise<T>;",
    "type Result = MaybePromise<string> | string;",
].join("\n");

ruleTester.run(
    "prefer-type-fest-promisable",
    getPluginRule("prefer-type-fest-promisable"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
                errors: [
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                ],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
                name: "reports fixture Promise<T> | T unions",
            },
            {
                code: promiseFirstInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
                name: "reports union with Promise first and value second",
            },
            {
                code: promiseSecondInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
                name: "reports union with value first and Promise second",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
                name: "reports and autofixes imported MaybePromise alias",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
                name: "reports alias usage when Promisable import is missing",
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-type-fest-promisable.valid.ts"),
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "accepts fixture-safe patterns",
            },
            {
                code: promiseNoTypeArgumentsValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise without explicit type arguments",
            },
            {
                code: qualifiedPromiseValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores globalThis.Promise union",
            },
            {
                code: customWrapperValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores custom Promise wrapper alias",
            },
            {
                code: promiseLikeValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores PromiseLike union",
            },
            {
                code: promiseNullValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with null",
            },
            {
                code: promiseUndefinedValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores PromiseLike union with undefined",
            },
            {
                code: promiseNeverValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with never",
            },
            {
                code: promiseMismatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with mismatched non-base type",
            },
            {
                code: promiseThreeMemberUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union containing more than Promise and base pair",
            },
            {
                code: alreadyPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union already using Promisable",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-promisable.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
