/**
 * @packageDocumentation
 * Shared typefest preset/config reference constants and type guards.
 */

/** Canonical flat-config preset keys exposed through `plugin.configs`. */
import { objectHasOwn } from "ts-extras";

export const typefestConfigNames = [
    "all",
    "minimal",
    "recommended",
    "strict",
    "ts-extras/type-guards",
    "type-fest/types",
] as const;

/** Canonical flat-config preset key type exposed through `plugin.configs`. */
export type TypefestConfigName = (typeof typefestConfigNames)[number];

/** Metadata references supported in `meta.docs.recommended`. */
export const typefestConfigReferenceToName: Readonly<{
    "typefest.configs.all": "all";
    "typefest.configs.minimal": "minimal";
    "typefest.configs.recommended": "recommended";
    "typefest.configs.strict": "strict";
    "typefest.configs.ts-extras/type-guards": "ts-extras/type-guards";
    "typefest.configs.type-fest/types": "type-fest/types";
    'typefest.configs["ts-extras/type-guards"]': "ts-extras/type-guards";
    'typefest.configs["type-fest/types"]': "type-fest/types";
}> = {
    "typefest.configs.all": "all",
    "typefest.configs.minimal": "minimal",
    "typefest.configs.recommended": "recommended",
    "typefest.configs.strict": "strict",
    "typefest.configs.ts-extras/type-guards": "ts-extras/type-guards",
    "typefest.configs.type-fest/types": "type-fest/types",
    'typefest.configs["ts-extras/type-guards"]': "ts-extras/type-guards",
    'typefest.configs["type-fest/types"]': "type-fest/types",
};

/** Fully-qualified preset reference type accepted in docs metadata. */
export type TypefestConfigReference =
    keyof typeof typefestConfigReferenceToName;

/** Default preset references implied when `meta.docs.recommended` is `true`. */
export const defaultRecommendedConfigReferences: readonly [
    "typefest.configs.recommended",
    "typefest.configs.strict",
    "typefest.configs.all",
] = [
    "typefest.configs.recommended",
    "typefest.configs.strict",
    "typefest.configs.all",
];

/**
 * Check whether a string is a supported `meta.docs.recommended` reference.
 */
export const isTypefestConfigReference = (
    value: string
): value is TypefestConfigReference =>
    objectHasOwn(typefestConfigReferenceToName, value);
