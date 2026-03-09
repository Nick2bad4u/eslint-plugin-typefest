/**
 * @packageDocumentation
 * Synchronize or validate the README rules matrix from canonical rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import builtPlugin from "../dist/plugin.js";
import {
    typefestConfigMetadataByName,
    typefestConfigNamesByReadmeOrder,
    typefestConfigReferenceToName,
} from "../dist/_internal/typefest-config-references.js";

/**
 * @typedef {Readonly<{
 *     meta?: {
 *         docs?: {
 *             typefestConfigs?: readonly string[] | string;
 *             url?: string;
 *         };
 *         fixable?: string;
 *         hasSuggestions?: boolean;
 *     };
 * }>} ReadmeRuleModule
 */

/** @typedef {Readonly<Record<string, ReadmeRuleModule>>} ReadmeRulesMap */

/** @typedef {import("../dist/_internal/typefest-config-references.js").TypefestConfigName} PresetName */

const presetOrder = [...typefestConfigNamesByReadmeOrder];
const presetNameSet = new Set(presetOrder);

const rulesSectionHeading = "## Rules";

/**
 * @returns {string}
 */
const createPresetLegend = () =>
    presetOrder
        .map(
            (presetName) =>
                `\`${typefestConfigMetadataByName[presetName].icon} ${presetName}\``
        )
        .join(" · ");

/**
 * @param {string} reference
 *
 * @returns {null | PresetName}
 */
const normalizeTypefestConfigName = (reference) => {
    if (Object.hasOwn(typefestConfigReferenceToName, reference)) {
        const referenceKey =
            /** @type {keyof typeof typefestConfigReferenceToName} */ (
                reference
            );

        return typefestConfigReferenceToName[referenceKey];
    }

    const presetName = /** @type {PresetName} */ (reference);

    return presetNameSet.has(presetName) ? presetName : null;
};

/**
 * @param {readonly string[] | string | undefined} typefestConfigs
 *
 * @returns {readonly PresetName[]}
 */
const normalizeTypefestConfigNames = (typefestConfigs) => {
    const references = Array.isArray(typefestConfigs)
        ? typefestConfigs
        : [typefestConfigs];

    /** @type {PresetName[]} */
    const names = [];
    /** @type {Set<PresetName>} */
    const seenPresetNames = new Set();

    for (const reference of references) {
        if (typeof reference !== "string") {
            continue;
        }

        const configName = normalizeTypefestConfigName(reference);

        if (configName === null) {
            continue;
        }

        if (!presetNameSet.has(configName)) {
            continue;
        }

        if (!seenPresetNames.has(configName)) {
            seenPresetNames.add(configName);
            names.push(configName);
        }
    }

    return names;
};

/**
 * @param {ReadmeRuleModule} ruleModule
 *
 * @returns {"—" | "💡" | "🔧" | "🔧 💡"}
 */
const getRuleFixIndicator = (ruleModule) => {
    const fixable = ruleModule.meta?.fixable === "code";
    const hasSuggestions = ruleModule.meta?.hasSuggestions === true;

    if (fixable && hasSuggestions) {
        return "🔧 💡";
    }

    if (fixable) {
        return "🔧";
    }

    if (hasSuggestions) {
        return "💡";
    }

    return "—";
};

/**
 * @param {ReadmeRuleModule} ruleModule
 *
 * @returns {string}
 */
const getPresetIndicator = (ruleModule) => {
    const docsTypefestConfigs = ruleModule.meta?.docs?.typefestConfigs;
    const presetNames = normalizeTypefestConfigNames(docsTypefestConfigs);
    const presetNamesSet = new Set(presetNames);

    /** @type {string[]} */
    const icons = [];

    for (const presetName of presetOrder) {
        if (presetNamesSet.has(presetName)) {
            icons.push(typefestConfigMetadataByName[presetName].icon);
        }
    }

    return icons.length === 0 ? "—" : icons.join(" ");
};

/**
 * @param {readonly [string, ReadmeRuleModule]} entry
 *
 * @returns {string}
 */
const toRuleTableRow = ([ruleName, ruleModule]) => {
    const docsUrl = ruleModule.meta?.docs?.url;

    if (typeof docsUrl !== "string" || docsUrl.trim().length === 0) {
        throw new TypeError(`Rule '${ruleName}' is missing meta.docs.url.`);
    }

    return `| [\`${ruleName}\`](${docsUrl}) | ${getRuleFixIndicator(ruleModule)} | ${getPresetIndicator(ruleModule)} |`;
};

/**
 * Generate the canonical README rules section from plugin rules metadata.
 *
 * @param {ReadmeRulesMap} rules - Plugin `rules` map.
 *
 * @returns {string} Full markdown section text starting at `## Rules`.
 */
export const generateReadmeRulesSectionFromRules = (rules) => {
    const ruleEntries = Object.entries(rules).toSorted((left, right) =>
        left[0].localeCompare(right[0])
    );

    const rows = ruleEntries.map(toRuleTableRow);

    return [
        "## Rules",
        "",
        "- `Fix` legend:",
        "  - `🔧` = autofixable",
        "  - `💡` = suggestions available",
        "  - `—` = report only",
        `- \`Preset key\` legend: ${createPresetLegend()}`,
        "",
        "| Rule | Fix | Preset key |",
        "| --- | :-: | :-- |",
        ...rows,
        "",
    ].join("\n");
};

/**
 * @param {{ writeChanges: boolean }} input
 */
const syncReadmeRulesTable = async ({ writeChanges }) => {
    const workspaceRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const readmePath = resolve(workspaceRoot, "README.md");
    const readmeText = await readFile(readmePath, "utf8");

    const rulesHeadingOffset = readmeText.indexOf(rulesSectionHeading);

    if (rulesHeadingOffset < 0) {
        throw new Error("README.md is missing the '## Rules' section heading.");
    }

    const nextHeadingOffset = readmeText.indexOf(
        "\n## ",
        rulesHeadingOffset + rulesSectionHeading.length
    );

    const sectionEndOffset =
        nextHeadingOffset < 0 ? readmeText.length : nextHeadingOffset + 1;

    const readmePrefix = readmeText.slice(0, rulesHeadingOffset).trimEnd();
    const readmeSuffix = readmeText.slice(sectionEndOffset);

    const generatedRulesSection = generateReadmeRulesSectionFromRules(
        /** @type {ReadmeRulesMap} */ (builtPlugin.rules)
    );

    const nextReadmeText = `${readmePrefix}\n\n${generatedRulesSection}${readmeSuffix}`;

    if (readmeText === nextReadmeText) {
        return {
            changed: false,
        };
    }

    if (!writeChanges) {
        return {
            changed: true,
        };
    }

    await writeFile(readmePath, nextReadmeText, "utf8");

    return {
        changed: true,
    };
};

const runCli = async () => {
    const writeChanges = process.argv.includes("--write");
    const result = await syncReadmeRulesTable({ writeChanges });

    if (!result.changed) {
        console.log("README rules table is already synchronized.");

        return;
    }

    if (writeChanges) {
        console.log("README rules table synchronized from plugin metadata.");

        return;
    }

    console.error(
        "README rules table is out of sync. Run: node scripts/sync-readme-rules-table.mjs --write"
    );
    process.exitCode = 1;
};

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await runCli();
}
