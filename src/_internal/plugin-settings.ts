import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { JsonObject, UnknownArray } from "type-fest";

import { getProgramNode } from "./ast-node.js";

const TYPEFEST_SETTINGS_KEY = "typefest";
const DISABLE_ALL_AUTOFIXES_KEY = "disableAllAutofixes";
const DISABLE_IMPORT_INSERTION_FIXES_KEY = "disableImportInsertionFixes";

type ProgramSettings = {
    disableAllAutofixes: boolean;
    disableImportInsertionFixes: boolean;
};

const settingsByProgram = new WeakMap<TSESTree.Program, ProgramSettings>();

const isObject = (value: unknown): value is Readonly<JsonObject> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const getTypefestSettings = (
    settings: unknown
): null | Readonly<JsonObject> => {
    if (!isObject(settings)) {
        return null;
    }

    const typefestSettings = settings[TYPEFEST_SETTINGS_KEY];

    return isObject(typefestSettings) ? typefestSettings : null;
};

const readBooleanFlag = (object: Readonly<JsonObject>, key: string): boolean =>
    Object.hasOwn(object, key) && object[key] === true;

const readDisableImportInsertionFixesFromSettings = (
    settings: unknown
): boolean => {
    const typefestSettings = getTypefestSettings(settings);
    if (!typefestSettings) {
        return false;
    }

    return readBooleanFlag(
        typefestSettings,
        DISABLE_IMPORT_INSERTION_FIXES_KEY
    );
};

const readDisableAllAutofixesFromSettings = (settings: unknown): boolean => {
    const typefestSettings = getTypefestSettings(settings);
    if (!typefestSettings) {
        return false;
    }

    return readBooleanFlag(typefestSettings, DISABLE_ALL_AUTOFIXES_KEY);
};

/**
 * Register parsed plugin settings for the current file program.
 *
 * @param context - Active ESLint rule context.
 */
export const registerProgramSettingsForContext = (
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>
): Readonly<ProgramSettings> => {
    const existingProgramSettings = settingsByProgram.get(
        context.sourceCode.ast
    );
    if (existingProgramSettings) {
        return existingProgramSettings;
    }

    const parsedSettings: Readonly<ProgramSettings> = Object.freeze({
        disableAllAutofixes: readDisableAllAutofixesFromSettings(
            context.settings
        ),
        disableImportInsertionFixes:
            readDisableImportInsertionFixesFromSettings(context.settings),
    });

    settingsByProgram.set(context.sourceCode.ast, parsedSettings);

    return parsedSettings;
};

/**
 * Determine whether import insertion autofixes are globally disabled for the
 * file containing the provided node.
 *
 * @param node - AST node used to resolve the enclosing Program.
 *
 * @returns `true` when import insertion fixes should be suppressed.
 */
export const isImportInsertionFixesDisabledForNode = (
    node: Readonly<TSESTree.Node>
): boolean => {
    const programNode = getProgramNode(node);
    if (!programNode) {
        return false;
    }

    const settings = settingsByProgram.get(programNode);

    return settings?.disableImportInsertionFixes === true;
};
