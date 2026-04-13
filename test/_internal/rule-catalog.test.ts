import { assertDefined } from "ts-extras";
import { describe, expect, it } from "vitest";

import {
    getRuleCatalogEntryForRuleId,
    getRuleCatalogEntryForRuleName,
    getRuleCatalogEntryForRuleNameOrNull,
    typefestRuleCatalogEntries,
    validateRuleCatalogIntegrity,
} from "../../src/_internal/rule-catalog";
import { typefestRules } from "../../src/_internal/rules-registry";

interface MutableRuleCatalogEntry {
    ruleId: `R${string}`;
    ruleName: `prefer-${string}`;
    ruleNumber: number;
}

const withMutatedCatalogEntry = (
    index: number,
    patch: Readonly<Partial<MutableRuleCatalogEntry>>,
    assertion: () => void
): void => {
    const mutableEntries =
        typefestRuleCatalogEntries as unknown as MutableRuleCatalogEntry[];
    const originalEntry = mutableEntries.at(index);
    assertDefined(originalEntry);

    mutableEntries[index] = {
        ...originalEntry,
        ...patch,
    };

    try {
        assertion();
    } finally {
        mutableEntries[index] = originalEntry;
    }
};

describe("rule-catalog", () => {
    it("contains every runtime rule plus reserved historical ids", () => {
        expect.hasAssertions();

        const catalogRuleNames = typefestRuleCatalogEntries
            .map((entry) => entry.ruleName)
            .toSorted((left, right) => left.localeCompare(right));
        const registryRuleNames = Object.keys(typefestRules).toSorted(
            (left, right) => left.localeCompare(right)
        );
        const reservedHistoricalRuleNames = [
            "prefer-ts-extras-array-find",
            "prefer-ts-extras-array-find-last",
            "prefer-ts-extras-array-find-last-index",
        ];
        const catalogOnlyRuleNames = catalogRuleNames.filter(
            (ruleName) => !registryRuleNames.includes(ruleName)
        );

        expect(catalogRuleNames).toStrictEqual(
            expect.arrayContaining(registryRuleNames)
        );
        expect(catalogOnlyRuleNames).toStrictEqual(reservedHistoricalRuleNames);
        expect(typefestRuleCatalogEntries).toHaveLength(
            registryRuleNames.length + reservedHistoricalRuleNames.length
        );
    });

    it("resolves known entries by rule name and id", () => {
        expect.hasAssertions();

        const byName = getRuleCatalogEntryForRuleName(
            "prefer-ts-extras-array-at"
        );
        const byId = getRuleCatalogEntryForRuleId("R001");

        expect(byName.ruleId).toBe("R001");
        expect(byName.ruleNumber).toBe(1);
        expect(byName.ruleName).toBe("prefer-ts-extras-array-at");
        expect(byId).toStrictEqual(byName);
    });

    it("returns null for non-catalog or non-prefer rule names", () => {
        expect.hasAssertions();
        expect(
            getRuleCatalogEntryForRuleNameOrNull("internal-helper-rule")
        ).toBeNull();
        expect(
            getRuleCatalogEntryForRuleNameOrNull(
                "prefer-internal-non-catalog-rule"
            )
        ).toBeNull();
    });

    it("throws for unknown rule names in strict lookup", () => {
        expect.hasAssertions();
        expect(() =>
            getRuleCatalogEntryForRuleName("prefer-internal-non-catalog-rule")
        ).toThrow(/missing from the stable rule catalog/v);
    });

    it("returns undefined for unknown rule ids", () => {
        expect.hasAssertions();
        expect(getRuleCatalogEntryForRuleId("R999")).toBeUndefined();
    });

    it("reports valid baseline catalog integrity", () => {
        expect.hasAssertions();
        expect(validateRuleCatalogIntegrity()).toBeTruthy();
    });

    it("detects duplicate rule ids", () => {
        expect.hasAssertions();

        const firstEntry = typefestRuleCatalogEntries.at(0);
        assertDefined(firstEntry);

        withMutatedCatalogEntry(
            1,
            {
                ruleId: firstEntry.ruleId,
            },
            () => {
                expect(validateRuleCatalogIntegrity()).toBeFalsy();
            }
        );
    });

    it("detects out-of-sequence rule numbers", () => {
        expect.hasAssertions();

        withMutatedCatalogEntry(
            0,
            {
                ruleNumber: 99,
            },
            () => {
                expect(validateRuleCatalogIntegrity()).toBeFalsy();
            }
        );
    });

    it("detects mismatched rule ids for a valid index", () => {
        expect.hasAssertions();

        withMutatedCatalogEntry(
            0,
            {
                ruleId: "R999",
            },
            () => {
                expect(validateRuleCatalogIntegrity()).toBeFalsy();
            }
        );
    });
});
