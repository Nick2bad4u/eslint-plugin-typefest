import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-readonly.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-set-readonly";
const docsDescription =
    "require TypeFest SetReadonly over imported aliases such as ReadonlyBy.";
const preferSetReadonlyMessage =
    "Prefer `{{replacement}}` from type-fest to mark selected keys readonly instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-set-readonly.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-readonly.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-set-readonly.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { ReadonlyBy } from "type-aliases";\r\n',
        'import type { ReadonlyBy } from "type-aliases";\nimport type { SetReadonly } from "type-fest";\r\n'
    )
    .replace("ReadonlyBy<", "SetReadonly<");
const inlineFixableInvalidCode = [
    'import type { ReadonlyBy } from "type-aliases";',
    'import type { SetReadonly } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    'type FrozenUser = ReadonlyBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type FrozenUser = ReadonlyBy<User, "id">;',
    'type FrozenUser = SetReadonly<User, "id">;'
);
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { ReadonlyBy } from "type-aliases";',
    "",
    'type Wrapper<SetReadonly extends object> = ReadonlyBy<SetReadonly, "id">;',
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferSetReadonly: preferSetReadonlyMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyBy",
                        replacement: "SetReadonly",
                    },
                    messageId: "preferSetReadonly",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture MarkReadonly and ReadonlyBy aliases",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyBy",
                        replacement: "SetReadonly",
                    },
                    messageId: "preferSetReadonly",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline MarkReadonly alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyBy",
                        replacement: "SetReadonly",
                    },
                    messageId: "preferSetReadonly",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyBy alias when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(namespaceValidFixtureName),
            filename: typedFixturePath(namespaceValidFixtureName),
            name: "accepts namespace-qualified SetReadonly references",
        },
    ],
});
