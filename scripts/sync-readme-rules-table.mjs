/**
 * @packageDocumentation
 * Synchronize or validate the README rules matrix from canonical rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import builtPlugin from "../dist/plugin.js";

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

/** @typedef {keyof typeof presetIconByName} PresetName */

/** @type {Readonly<Record<string, string>>} */
const presetIconByName = {
    all: "🟣",
    minimal: "🟢",
    recommended: "🟡",
    "recommended-type-checked": "🟠",
    strict: "🔴",
    "ts-extras/type-guards": "✴️",
    "type-fest/types": "💠",
};

const presetOrder = [
    "minimal",
    "recommended",
    "recommended-type-checked",
    "strict",
    "all",
    "type-fest/types",
    "ts-extras/type-guards",
];

const rulesSectionHeading = "## Rules";

/**
 * @param {string} reference
 *
 * @returns {null | string}
 */
const normalizeTypefestConfigName = (reference) => {
    const dottedMatch = reference.match(/^typefest\.configs\.(.+)$/u);

    if (dottedMatch?.[1]) {
        return dottedMatch[1];
    }

    const bracketedMatch = reference.match(/^typefest\.configs\["(.+)"\]$/u);

    return bracketedMatch?.[1] ?? null;
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

    for (const reference of references) {
        if (typeof reference !== "string") {
            continue;
        }

        const configName = normalizeTypefestConfigName(reference);

        if (configName === null) {
            continue;
        }

        if (!Object.hasOwn(presetIconByName, configName)) {
            continue;
        }

        /** @type {PresetName} */
        const presetName = configName;

        if (!names.includes(presetName)) {
            names.push(presetName);
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

    /** @type {string[]} */
    const icons = [];

    for (const presetName of presetOrder) {
        if (presetNames.includes(presetName)) {
            icons.push(presetIconByName[presetName]);
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
 * @returns Full markdown section text starting at `## Rules`.
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
        "- `Preset key` legend: `🟢 minimal` · `🟡 recommended` · `🟠 recommended-type-checked` · `🔴 strict` · `🟣 all` · `💠 type-fest/types` · `✴️ ts-extras/type-guards`",
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
