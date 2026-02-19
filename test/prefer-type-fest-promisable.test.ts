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
const promiseFirstInvalidCode = "type Result = Promise<string> | string;";
const promiseSecondInvalidCode = "type Result = string | Promise<string>;";
const promiseLikeValidCode = "type Result = PromiseLike<string> | string;";
const promiseNoTypeArgumentsValidCode = "type Result = Promise | string;";
const promiseNullValidCode = "type Result = Promise<string> | null;";
const promiseUndefinedValidCode =
    "type Result = PromiseLike<string> | undefined;";
const promiseNeverValidCode = "type Result = Promise<string> | never;";
const promiseMismatchValidCode = "type Result = Promise<string> | number;";
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
            },
            {
                code: promiseFirstInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
            },
            {
                code: promiseSecondInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
                output: inlineFixableOutputCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-type-fest-promisable.valid.ts"),
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: promiseNoTypeArgumentsValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: qualifiedPromiseValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: customWrapperValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: promiseLikeValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: promiseNullValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: promiseUndefinedValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: promiseNeverValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: promiseMismatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-promisable.skip.ts"
                ),
            },
        ],
    }
);
