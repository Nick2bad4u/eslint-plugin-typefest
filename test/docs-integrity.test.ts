import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../plugin.mjs";

interface RuleWithMeta {
    readonly meta?: {
        readonly docs?: {
            readonly description?: unknown;
            readonly url?: unknown;
        };
    };
}

function isRuleWithMeta(value: unknown): value is RuleWithMeta {
    return typeof value === "object" && value !== null;
}

describe("typefest rule docs", () => {
    it("every rule has a docs url and a matching docs/rules/<id>.md file", () => {
        const { rules } = typefestPlugin;
        expect(rules).toBeDefined();

        const docsDir = path.join(process.cwd(), "docs", "rules");

        for (const [ruleId, rule] of Object.entries(rules ?? {})) {
            const docs = isRuleWithMeta(rule)
                ? (rule.meta?.docs ?? null)
                : null;

            const url = docs?.url;
            expect(typeof url).toBe("string");

            if (typeof url === "string") {
                expect(url).toContain(`/docs/rules/${ruleId}.md`);
            }

            const description = docs?.description;
            expect(typeof description).toBe("string");

            const expectedPath = path.join(docsDir, `${ruleId}.md`);
            expect(fs.existsSync(expectedPath)).toBe(true);
        }
    });
});
