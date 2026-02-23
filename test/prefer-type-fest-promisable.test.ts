/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-promisable.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { expect, test, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const invalidFixtureName = "prefer-type-fest-promisable.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

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
const inlineInvalidWithoutFixOutputCode = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = Promisable<string>;",
].join("\n");
const promiseFirstInvalidCode = "type Result = Promise<string> | string;";
const promiseSecondInvalidCode = "type Result = string | Promise<string>;";
const promiseLikeValidCode = "type Result = PromiseLike<string> | string;";
const promiseNoTypeArgumentsValidCode = "type Result = Promise | string;";
const promiseNullValidCode = "type Result = Promise<string> | null;";
const promiseUndefinedUnionValidCode =
    "type Result = Promise<string> | undefined;";
const promiseUndefinedValidCode =
    "type Result = PromiseLike<string> | undefined;";
const promiseNeverValidCode = "type Result = Promise<string> | never;";
const promiseNullInnerMatchValidCode = "type Result = Promise<null> | null;";
const promiseUndefinedInnerMatchValidCode =
    "type Result = Promise<undefined> | undefined;";
const promiseNeverInnerMatchValidCode = "type Result = Promise<never> | never;";
const doublePromiseUnionValidCode =
    "type Result = Promise<string> | Promise<string>;";
const promiseMismatchValidCode = "type Result = Promise<string> | number;";
const promiseThreeMemberUnionValidCode =
    "type Result = Promise<string> | number | string;";
const promiseThreeMemberLeadingPairValidCode =
    "type Result = Promise<string> | string | boolean;";
const promiseThreeMemberLeadingReversePairValidCode =
    "type Result = string | Promise<string> | boolean;";
const promiseFourMemberLeadingPairValidCode =
    "type Result = Promise<string> | string | boolean | number;";
const promiseFourMemberLeadingReversePairValidCode =
    "type Result = string | Promise<string> | boolean | number;";
const nullFirstPromiseSecondValidCode = "type Result = null | Promise<string>;";
const undefinedFirstPromiseSecondValidCode =
    "type Result = undefined | Promise<string>;";
const neverFirstPromiseSecondValidCode =
    "type Result = never | Promise<string>;";
const alreadyPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<string> | Promisable<string>;",
].join("\n");
const nestedPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string>;",
].join("\n");
const reverseNestedPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promisable<string> | Promise<Promisable<string>>;",
].join("\n");
const threeMemberPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string> | boolean;",
].join("\n");
const skipPathInvalidCode = promiseFirstInvalidCode;
const qualifiedPromiseValidCode =
    "type Result = globalThis.Promise<string> | string;";
const customWrapperValidCode = [
    "type MaybePromise<T> = Promise<T>;",
    "type Result = MaybePromise<string> | string;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-promisable", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest Promisable for sync-or-async callback contracts currently expressed as Promise<T> | T unions.",
    enforceRuleShape: true,
    messages: {
        preferPromisable:
            "Prefer `Promisable<T>` from type-fest over `Promise<T> | T` for sync-or-async contracts.",
    },
    name: "prefer-type-fest-promisable",
});

test("tSUnionType visitor reports only strict Promise<T> | T pairs", async () => {
    const code = [
        'import type { Promisable } from "type-fest";',
        "type ShouldReportPromiseFirst = Promise<string> | string;",
        "type ShouldReportPromiseSecond = string | Promise<string>;",
        "type ShouldSkipPromisable = Promise<Promisable<string>> | Promisable<string>;",
        "type ShouldSkipNull = Promise<null> | null;",
        "type ShouldSkipUndefined = Promise<undefined> | undefined;",
        "type ShouldSkipNever = Promise<never> | never;",
    ].join("\n");

    try {
        vi.resetModules();

        vi.doMock("../src/_internal/typed-rule.js", () => ({
            createTypedRule: (definition: unknown): unknown => definition,
            isTestFilePath: (): boolean => false,
        }));

        const undecoratedRuleModule = (await import(
            "../src/rules/prefer-type-fest-promisable.ts"
        )) as {
            default: {
                create: (context: unknown) => {
                    TSUnionType?: (node: unknown) => void;
                };
            };
        };

        const parsedResult = parser.parseForESLint(code, {
            ecmaVersion: "latest",
            loc: true,
            range: true,
            sourceType: "module",
        });

        const getNodeText = (node: unknown): string => {
            if (
                typeof node !== "object" ||
                node === null ||
                !("range" in node)
            ) {
                return "";
            }

            const nodeRange = (node as { range?: readonly [number, number] })
                .range;
            if (!nodeRange) {
                return "";
            }

            const [start, end] = nodeRange;
            return code.slice(start, end);
        };

        const report = vi.fn();

        const listenerMap = undecoratedRuleModule.default.create({
            filename: "fixtures/typed/prefer-type-fest-promisable.invalid.ts",
            report,
            sourceCode: {
                ast: parsedResult.ast,
                getText: getNodeText,
            },
        });

        const unionTypeNodes = parsedResult.ast.body
            .filter(
                (statement): statement is typeof statement & {
                    type: "TSTypeAliasDeclaration";
                } => statement.type === "TSTypeAliasDeclaration"
            )
            .map((alias) => alias.typeAnnotation)
            .filter(
                (typeAnnotation): typeAnnotation is typeof typeAnnotation & {
                    type: "TSUnionType";
                } => typeAnnotation.type === "TSUnionType"
            );

        expect(unionTypeNodes).toHaveLength(6);

        for (const unionTypeNode of unionTypeNodes) {
            listenerMap.TSUnionType?.(unionTypeNode);
        }

        expect(report).toHaveBeenCalledTimes(2);
    } finally {
        vi.doUnmock("../src/_internal/typed-rule.js");
        vi.resetModules();
    }
});

ruleTester.run(
    "prefer-type-fest-promisable",
    getPluginRule("prefer-type-fest-promisable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Promise<T> | T unions",
                output: null,
            },
            {
                code: promiseFirstInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union with Promise first and value second",
                output: null,
            },
            {
                code: promiseSecondInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union with value first and Promise second",
                output: null,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes imported MaybePromise alias",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports alias usage when Promisable import is missing",
                output: inlineInvalidWithoutFixOutputCode,
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
                code: promiseUndefinedUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with undefined",
            },
            {
                code: promiseNeverValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with never",
            },
            {
                code: promiseNullInnerMatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise<null> union with matching null member",
            },
            {
                code: promiseUndefinedInnerMatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise<undefined> union with matching undefined member",
            },
            {
                code: promiseNeverInnerMatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise<never> union with matching never member",
            },
            {
                code: doublePromiseUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union containing only Promise members",
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
                code: promiseThreeMemberLeadingPairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores three-member union even when first two members form a Promise pair",
            },
            {
                code: promiseThreeMemberLeadingReversePairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores three-member union even when first two members form a reverse Promise pair",
            },
            {
                code: promiseFourMemberLeadingPairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores four-member union even when first two members form a Promise pair",
            },
            {
                code: promiseFourMemberLeadingReversePairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores four-member union even when first two members form a reverse Promise pair",
            },
            {
                code: nullFirstPromiseSecondValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores null-first union with Promise second",
            },
            {
                code: undefinedFirstPromiseSecondValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores undefined-first union with Promise second",
            },
            {
                code: neverFirstPromiseSecondValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores never-first union with Promise second",
            },
            {
                code: alreadyPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union already using Promisable",
            },
            {
                code: nestedPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union where Promise inner type is already Promisable",
            },
            {
                code: reverseNestedPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores reverse-order union where Promise inner type is already Promisable",
            },
            {
                code: threeMemberPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores multi-member union that already contains Promisable",
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
