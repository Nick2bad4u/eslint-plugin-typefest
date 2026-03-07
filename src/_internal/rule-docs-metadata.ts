/**
 * @packageDocumentation
 * Derivation helpers for canonical rule docs metadata.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray, UnknownRecord } from "type-fest";

import { arrayIncludes, isEmpty, objectEntries } from "ts-extras";

import type { TypefestRuleNamePattern } from "./rules-registry.js";

import {
    isTypefestConfigReference,
    type TypefestConfigName,
    type TypefestConfigReference,
    typefestConfigReferenceToName,
} from "./typefest-config-references.js";

/** Normalized docs metadata derived for each rule. */
export type RuleDocsMetadata = Readonly<{
    description: string;
    recommended: boolean;
    requiresTypeChecking: boolean;
    typefestConfigNames: readonly TypefestConfigName[];
    typefestConfigReferences: readonly TypefestConfigReference[];
    url: string;
}>;

/** Rule-name keyed metadata map derived from static docs contracts. */
export type RuleDocsMetadataByName = Readonly<
    Record<TypefestRuleNamePattern, RuleDocsMetadata>
>;

/** Rule-map contract accepted by docs metadata derivation helpers. */
type RuleMap = Readonly<
    Record<
        TypefestRuleNamePattern,
        TSESLint.RuleModule<string, Readonly<UnknownArray>>
    >
>;

/**
 * Canonical docs contract required on every plugin rule.
 */
type TypefestRuleDocsContract = Readonly<{
    description: string;
    recommended: boolean;
    requiresTypeChecking: boolean;
    typefestConfigs:
        | readonly TypefestConfigReference[]
        | TypefestConfigReference;
    url: string;
}>;

/**
 * Guard dynamic values to object-shaped records.
 */
const isUnknownRecord = (value: unknown): value is Readonly<UnknownRecord> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Guard dynamic rule ids to the plugin naming contract.
 */
const isTypefestRuleNamePattern = (
    value: string
): value is TypefestRuleNamePattern => value.startsWith("prefer-");

/**
 * Convert rule docs `typefestConfigs` into a normalized, deduped reference
 * list.
 */
const normalizeTypefestConfigReferences = (
    ruleName: string,
    typefestConfigs: TypefestRuleDocsContract["typefestConfigs"]
): readonly TypefestConfigReference[] => {
    const candidates =
        typeof typefestConfigs === "string"
            ? [typefestConfigs]
            : [...typefestConfigs];

    const references: TypefestConfigReference[] = [];

    for (const candidate of candidates) {
        if (!isTypefestConfigReference(candidate)) {
            throw new TypeError(
                `Rule '${ruleName}' has invalid docs.typefestConfigs reference '${String(candidate)}'.`
            );
        }

        if (arrayIncludes(references, candidate)) {
            continue;
        }

        references.push(candidate);
    }

    if (isEmpty(references)) {
        throw new TypeError(
            `Rule '${ruleName}' must declare at least one docs.typefestConfigs reference.`
        );
    }

    return references;
};

/**
 * Validate and narrow dynamic `meta.docs` values to the plugin docs contract.
 */
const getRuleDocsContract = (
    ruleName: string,
    docs: unknown
): TypefestRuleDocsContract => {
    if (!isUnknownRecord(docs)) {
        throw new TypeError(`Rule '${ruleName}' must declare meta.docs.`);
    }

    const description = docs["description"];
    const recommended = docs["recommended"];
    const requiresTypeChecking = docs["requiresTypeChecking"];
    const typefestConfigs = docs["typefestConfigs"];
    const url = docs["url"];

    if (typeof description !== "string" || description.trim().length === 0) {
        throw new TypeError(
            `Rule '${ruleName}' must declare a non-empty docs.description.`
        );
    }

    if (typeof url !== "string" || url.trim().length === 0) {
        throw new TypeError(
            `Rule '${ruleName}' must declare a non-empty docs.url.`
        );
    }

    if (typeof recommended !== "boolean") {
        throw new TypeError(
            `Rule '${ruleName}' must declare boolean docs.recommended.`
        );
    }

    if (typeof requiresTypeChecking !== "boolean") {
        throw new TypeError(
            `Rule '${ruleName}' must declare boolean docs.requiresTypeChecking.`
        );
    }

    if (typeof typefestConfigs === "string") {
        if (!isTypefestConfigReference(typefestConfigs)) {
            throw new TypeError(
                `Rule '${ruleName}' has invalid docs.typefestConfigs reference '${typefestConfigs}'.`
            );
        }

        return {
            description,
            recommended,
            requiresTypeChecking,
            typefestConfigs,
            url,
        };
    }

    if (!Array.isArray(typefestConfigs)) {
        throw new TypeError(
            `Rule '${ruleName}' must declare docs.typefestConfigs as a preset reference or array.`
        );
    }

    const normalizedTypefestConfigs: TypefestConfigReference[] = [];

    for (const candidate of typefestConfigs) {
        if (
            typeof candidate !== "string" ||
            !isTypefestConfigReference(candidate)
        ) {
            throw new TypeError(
                `Rule '${ruleName}' has invalid docs.typefestConfigs reference '${String(candidate)}'.`
            );
        }

        normalizedTypefestConfigs.push(candidate);
    }

    return {
        description,
        recommended,
        requiresTypeChecking,
        typefestConfigs: normalizedTypefestConfigs,
        url,
    };
};

/**
 * Derive normalized docs metadata for all plugin rules.
 */
export const deriveRuleDocsMetadataByName = (
    rules: RuleMap
): RuleDocsMetadataByName => {
    const metadataByRuleName: Record<
        TypefestRuleNamePattern,
        RuleDocsMetadata
    > = {};

    for (const [ruleName, ruleModule] of objectEntries(rules)) {
        if (!isTypefestRuleNamePattern(ruleName)) {
            throw new TypeError(
                `Unexpected rule id '${ruleName}' while deriving docs metadata.`
            );
        }

        const ruleDocs = getRuleDocsContract(ruleName, ruleModule.meta?.docs);
        const typefestConfigReferences = normalizeTypefestConfigReferences(
            ruleName,
            ruleDocs.typefestConfigs
        );
        const typefestConfigNames = typefestConfigReferences.map(
            (reference) => typefestConfigReferenceToName[reference]
        );

        metadataByRuleName[ruleName] = {
            description: ruleDocs.description,
            recommended: ruleDocs.recommended,
            requiresTypeChecking: ruleDocs.requiresTypeChecking,
            typefestConfigNames,
            typefestConfigReferences,
            url: ruleDocs.url,
        };
    }

    return metadataByRuleName;
};

/**
 * Derive a typed-rule set from normalized docs metadata.
 */
export const deriveTypeCheckedRuleNameSet = (
    ruleDocsMetadataByName: RuleDocsMetadataByName
): ReadonlySet<TypefestRuleNamePattern> => {
    const ruleNames: TypefestRuleNamePattern[] = [];

    for (const [ruleName, metadata] of objectEntries(ruleDocsMetadataByName)) {
        if (!metadata.requiresTypeChecking) {
            continue;
        }

        if (!isTypefestRuleNamePattern(ruleName)) {
            throw new TypeError(
                `Unexpected rule id '${ruleName}' while deriving typed-rule metadata.`
            );
        }

        ruleNames.push(ruleName);
    }

    return new Set(ruleNames);
};

/**
 * Derive canonical preset-membership map from normalized docs metadata.
 */
export const deriveRulePresetMembershipByRuleName = (
    ruleDocsMetadataByName: RuleDocsMetadataByName
): Readonly<Record<TypefestRuleNamePattern, readonly TypefestConfigName[]>> => {
    const membershipByRuleName: Record<
        TypefestRuleNamePattern,
        readonly TypefestConfigName[]
    > = {};

    for (const [ruleName, metadata] of objectEntries(ruleDocsMetadataByName)) {
        if (!isTypefestRuleNamePattern(ruleName)) {
            throw new TypeError(
                `Unexpected rule id '${ruleName}' while deriving preset membership.`
            );
        }

        membershipByRuleName[ruleName] = metadata.typefestConfigNames;
    }

    if (isEmpty(objectEntries(membershipByRuleName))) {
        throw new TypeError(
            "Rule metadata derivation produced no membership entries."
        );
    }

    return membershipByRuleName;
};
