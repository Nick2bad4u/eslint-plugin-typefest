/**
 * @packageDocumentation
 * Snapshot coverage for normalized rule metadata contracts.
 */
import type { UnknownRecord } from "type-fest";

import { objectEntries } from "ts-extras";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";

interface RuleMetadataSnapshot {
    defaultOptionsLength: number;
    docs: {
        recommended: boolean;
        requiresTypeChecking: boolean;
        typefestConfigs: readonly string[];
        url: null | string;
    };
    fixable: null | string;
    hasSuggestions: boolean;
    messageIds: readonly string[];
    ruleId: string;
    schemaLength: number;
    type: null | string;
}

/** Guard dynamic values into object records. */
const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

/** Normalize unknown docs preset references into sorted string entries. */
const normalizeTypefestConfigs = (value: unknown): readonly string[] => {
    if (typeof value === "string") {
        return [value];
    }

    if (!Array.isArray(value)) {
        return [];
    }

    const references: string[] = [];

    for (const reference of value) {
        if (typeof reference === "string") {
            references.push(reference);
        }
    }

    return references.toSorted((left, right) => left.localeCompare(right));
};

/**
 * Build deterministic rule metadata snapshots for all exported rules.
 *
 * @returns One normalized snapshot payload per rule id.
 */
const getRuleMetadataSnapshots = (): readonly RuleMetadataSnapshot[] =>
    objectEntries(typefestPlugin.rules)
        .toSorted(([left], [right]) => left.localeCompare(right))
        .map(([ruleId, ruleModule]) => {
            const safeRuleModule = isRecord(ruleModule)
                ? ruleModule
                : undefined;
            const meta =
                safeRuleModule !== undefined && isRecord(safeRuleModule.meta)
                    ? safeRuleModule.meta
                    : undefined;
            const docs =
                meta !== undefined && isRecord(meta["docs"])
                    ? meta["docs"]
                    : undefined;
            const messages =
                meta !== undefined && isRecord(meta["messages"])
                    ? meta["messages"]
                    : undefined;
            const defaultOptions =
                safeRuleModule !== undefined &&
                Array.isArray(safeRuleModule["defaultOptions"])
                    ? safeRuleModule["defaultOptions"]
                    : [];
            const schema =
                meta !== undefined && Array.isArray(meta["schema"])
                    ? meta["schema"]
                    : [];
            const messageIds =
                messages === undefined
                    ? []
                    : Object.keys(messages).toSorted((left, right) =>
                          left.localeCompare(right)
                      );
            const type = meta?.["type"];
            const fixable = meta?.["fixable"];
            const docsUrl = docs?.["url"];
            const docsRecommended = docs?.["recommended"];
            const docsRequiresTypeChecking = docs?.["requiresTypeChecking"];

            return {
                defaultOptionsLength: defaultOptions.length,
                docs: {
                    recommended: docsRecommended === true,
                    requiresTypeChecking: docsRequiresTypeChecking === true,
                    typefestConfigs: normalizeTypefestConfigs(
                        docs?.["typefestConfigs"]
                    ),
                    url: typeof docsUrl === "string" ? docsUrl : null,
                },
                fixable: typeof fixable === "string" ? fixable : null,
                hasSuggestions: meta?.["hasSuggestions"] === true,
                messageIds,
                ruleId,
                schemaLength: schema.length,
                type: typeof type === "string" ? type : null,
            };
        });

describe("rule metadata snapshots", () => {
    it("keeps normalized rule metadata contract stable", () => {
        expect(getRuleMetadataSnapshots()).toMatchSnapshot();
    });
});
