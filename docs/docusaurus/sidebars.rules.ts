/**
 * @packageDocumentation
 * Dynamic sidebar generation for plugin rule documentation sections.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/** Minimal document item shape used by generated rule categories. */
type SidebarDocItem = {
    readonly id: string;
    readonly type: "doc";
};

/** Directory containing this sidebar module. */
const sidebarDirectoryPath = dirname(fileURLToPath(import.meta.url));
/** Directory containing generated rule docs consumed by the sidebar. */
const rulesDirectoryPath = join(sidebarDirectoryPath, "..", "rules");

/** Check whether a directory entry name is a markdown file. */
const isMarkdownFile = (fileName: string): boolean => fileName.endsWith(".md");

/** Convert a markdown filename (e.g. `foo.md`) to a Docusaurus doc id. */
const toRuleDocId = (fileName: string): string => fileName.slice(0, -3);

/** Sorted rule-doc ids discovered from `docs/rules/*.md`. */
const allRuleDocIds = readdirSync(rulesDirectoryPath, {
    withFileTypes: true,
})
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => toRuleDocId(entry.name))
    .sort((left, right) => left.localeCompare(right));

/** Build sidebar doc items for rule docs matching a given filename prefix. */
const createRuleItemsByPrefix = (prefix: string): SidebarDocItem[] =>
    allRuleDocIds
        .filter((ruleDocId) => ruleDocId.startsWith(prefix))
        .map((ruleDocId) => ({
            id: ruleDocId,
            type: "doc",
        }));

/** Sidebar entries for `prefer-ts-extras-*` rule docs. */
const tsExtrasRuleItems = createRuleItemsByPrefix("prefer-ts-extras-");
/** Sidebar entries for `prefer-type-fest-*` rule docs. */
const typeFestRuleItems = createRuleItemsByPrefix("prefer-type-fest-");

/** Complete sidebar structure for docs site navigation. */
const sidebars: SidebarsConfig = {
    rules: [
        {
            className: "sb-doc-overview",
            id: "overview",
            label: "🏁 Overview",
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "🚀 Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-guides",
            collapsed: true,
            customProps: {
                badge: "guides",
            },
            type: "category",
            label: "🧭 Adoption & Rollout",
            link: {
                type: "generated-index",
                title: "Adoption & Rollout",
                description:
                    "Shared migration, rollout, and fix-safety guidance for rule adoption.",
            },
            items: [
                {
                    id: "guides/adoption-checklist",
                    label: "✅ Adoption checklist",
                    type: "doc",
                },
                {
                    id: "guides/rollout-and-fix-safety",
                    label: "🛡️ Rollout and fix safety",
                    type: "doc",
                },
            ],
        },
        {
            className: "sb-cat-presets",
            collapsed: true,
            customProps: {
                badge: "presets",
            },
            type: "category",
            label: "🎛 Presets",
            link: {
                type: "doc",
                id: "presets/index",
            },
            items: [
                {
                    id: "presets/minimal",
                    label: "🟢 Minimal",
                    type: "doc",
                },
                {
                    id: "presets/recommended",
                    label: "🟡 Recommended",
                    type: "doc",
                },
                {
                    id: "presets/strict",
                    label: "🔴 Strict",
                    type: "doc",
                },
                {
                    id: "presets/all",
                    label: "🟣 All",
                    type: "doc",
                },
                {
                    id: "presets/type-fest-types",
                    label: "💠 type-fest",
                    type: "doc",
                },
                {
                    id: "presets/ts-extras-type-guards",
                    label: "✴️ type-guards",
                    type: "doc",
                },
            ],
        },
        {
            className: "sb-cat-rules",
            collapsed: true,
            customProps: {
                badge: "rules",
            },
            type: "category",
            label: "📏 Rules",
            link: {
                type: "generated-index",
                title: "Rule Reference",
                slug: "/",
                description:
                    "Rule documentation for every eslint-plugin-typefest rule.",
            },
            items: [
                {
                    className: "sb-cat-rules-ts-extras",
                    collapsed: true,
                    customProps: {
                        badge: "ts-extras",
                    },
                    type: "category",
                    label: "🧰 ts-extras Rules",
                    link: {
                        type: "generated-index",
                        title: "ts-extras Rules",
                        description:
                            "Rules that prefer ts-extras runtime helpers and utility functions.",
                    },
                    items: tsExtrasRuleItems,
                },
                {
                    className: "sb-cat-rules-type-fest",
                    collapsed: true,
                    customProps: {
                        badge: "type-fest",
                    },
                    type: "category",
                    label: "✨ type-fest Rules",
                    link: {
                        type: "generated-index",
                        title: "type-fest Rules",
                        description:
                            "Rules that prefer expressive type-fest utility types for clearer type-level code.",
                    },
                    items: typeFestRuleItems,
                },
            ],
        },
    ],
};

export default sidebars;
