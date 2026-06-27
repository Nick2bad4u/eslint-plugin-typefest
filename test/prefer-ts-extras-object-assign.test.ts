import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-assign` behavior.
 */
import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-object-assign";
const docsDescription =
    "require ts-extras objectAssign over Object.assign for stronger object merge typing.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-assign";
const preferTsExtrasObjectAssignMessage =
    "Prefer `objectAssign` from `ts-extras` over `Object.assign(...)` for stronger object merge typing.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-assign.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-assign.invalid.ts";
const inlineInvalidCode =
    "const merged = Object.assign({ alpha: 1 }, { beta: 2 });";
const inlineInvalidOutput = [
    'import { objectAssign } from "ts-extras";',
    "const merged = objectAssign({ alpha: 1 }, { beta: 2 });",
].join("\n");
const inlineFixableCode = [
    'import { objectAssign } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const merged = Object.assign({}, sample);",
].join("\n");
const inlineFixableOutput = [
    'import { objectAssign } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const merged = objectAssign({}, sample);",
].join("\n");
const computedAccessValidCode =
    "const merged = Object['assign']({ alpha: 1 }, { beta: 2 });";
const nonObjectReceiverValidCode = [
    "declare const helper: {",
    "    assign<Target extends object, Source extends object>(",
    "        target: Target,",
    "        source: Source",
    "    ): Target & Source;",
    "};",
    "const merged = helper.assign({ alpha: 1 }, { beta: 2 });",
].join("\n");
const wrongPropertyValidCode = "const keys = Object.keys({ alpha: 1 });";
const shadowedObjectBindingValidCode = [
    "declare const Object: {",
    "    assign<Target extends object, Source extends object>(",
    "        target: Target,",
    "        source: Source",
    "    ): Target & Source;",
    "};",
    "const merged = Object.assign({ alpha: 1 }, { beta: 2 });",
].join("\n");

const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected prefer-ts-extras-object-assign text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const objectAssignSourceKindArbitrary = fc.constantFrom<
    "callExpression" | "identifier" | "memberExpression" | "objectLiteral"
>("callExpression", "identifier", "memberExpression", "objectLiteral");

const buildObjectAssignSourceTemplate = (
    kind: "callExpression" | "identifier" | "memberExpression" | "objectLiteral"
): Readonly<{
    declarations: readonly string[];
    sourceExpression: string;
}> => {
    if (kind === "identifier") {
        return {
            declarations: ["const source = { beta: 2 } as const;"],
            sourceExpression: "source",
        };
    }

    if (kind === "memberExpression") {
        return {
            declarations: [
                "const holder = { source: { beta: 2 } } as const satisfies Readonly<{ readonly source: { readonly beta: number } }>;",
            ],
            sourceExpression: "holder.source",
        };
    }

    if (kind === "callExpression") {
        return {
            declarations: [
                "const buildSource = (): Readonly<{ beta: number }> => ({ beta: 2 });",
            ],
            sourceExpression: "buildSource()",
        };
    }

    return {
        declarations: [],
        sourceExpression: "{ beta: 2 }",
    };
};

const parseObjectAssignCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
            continue;
        }

        if (statement.declarations.length !== 1) {
            continue;
        }

        const declaration = statement.declarations[0];
        if (
            declaration?.type === AST_NODE_TYPES.VariableDeclarator &&
            declaration.init !== null &&
            declaration.init.type === AST_NODE_TYPES.CallExpression
        ) {
            return {
                ast: parsed.ast,
                callExpression: declaration.init,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from an objectAssign call"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectAssign: preferTsExtrasObjectAssignMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-assign metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-object-assign parse-safety guards", () => {
    it("fast-check: objectAssign replacement remains parseable across source expression variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                objectAssignSourceKindArbitrary,
                includeUnicodeBannerArbitrary,
                (sourceKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const sourceTemplate =
                        buildObjectAssignSourceTemplate(sourceKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import { objectAssign } from "ts-extras";',
                        "const target = { alpha: 1 } as const;",
                        ...sourceTemplate.declarations,
                        `const merged = Object.assign({}, target, ${sourceTemplate.sourceExpression});`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "objectAssign",
                        sourceText: generatedCode,
                        target: "Object.assign",
                    });

                    const { callExpression } =
                        parseObjectAssignCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type !== AST_NODE_TYPES.Identifier
                    ) {
                        throw new Error(
                            "Expected conditional test precondition to hold."
                        );
                    }

                    expect(callExpression.callee.name).toBe("objectAssign");
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasObjectAssign" },
                { messageId: "preferTsExtrasObjectAssign" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.assign usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectAssign" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.assign call",
            output: inlineInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectAssign" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.assign when objectAssign import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: computedAccessValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Object.assign member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object assign method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object member calls that are not assign",
        },
        {
            code: shadowedObjectBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.assign call when Object binding is shadowed",
        },
    ],
});
