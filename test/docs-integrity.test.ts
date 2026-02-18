/**
 * @packageDocumentation
 * Vitest coverage for `docs-integrity.test` behavior.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, expectTypeOf, it } from "vitest";

import plugin from "../plugin.mjs";

interface RuleWithMeta {
    readonly meta?: {
        readonly docs?: {
            readonly description?: unknown;
            readonly url?: unknown;
        };
    };
}

/**
 * Check whether is rule with meta.
 *
 * @param value - Input value for value.
 *
 * @returns `true` when is rule with meta; otherwise `false`.
 */

function isRuleWithMeta(value: unknown): value is RuleWithMeta {
    return typeof value === "object" && value !== null;
}

describe("typefest rule docs", () => {
    it("every rule has a docs url and a matching docs/rules/<id>.md file", () => {
        const { rules } = plugin;

        expect(rules).toBeDefined();

        const docsDir = path.join(process.cwd(), "docs", "rules");

        for (const [ruleId, rule] of Object.entries(rules ?? {})) {
            const docs = isRuleWithMeta(rule)
                ? (rule.meta?.docs ?? null)
                : null;

            const url = docs?.url;

            if (typeof url === "string") {
                expect(url).toContain(`/docs/rules/${ruleId}.md`);
            }

            const description = docs?.description;

            expectTypeOf(description).toEqualTypeOf<string | undefined>();

            const expectedPath = path.join(docsDir, `${ruleId}.md`);

            expect(fs.existsSync(expectedPath)).toBeTruthy();
        }
    });
});
