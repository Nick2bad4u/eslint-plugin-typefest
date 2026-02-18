import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

type SidebarDocItem = {
    readonly id: string;
    readonly type: "doc";
};

const sidebarDirectoryPath = dirname(fileURLToPath(import.meta.url));
const rulesDirectoryPath = join(sidebarDirectoryPath, "..", "rules");

const isMarkdownFile = (fileName: string): boolean => fileName.endsWith(".md");

const toRuleDocId = (fileName: string): string => fileName.slice(0, -3);

const allRuleDocIds = readdirSync(rulesDirectoryPath, {
    withFileTypes: true,
})
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => toRuleDocId(entry.name))
    .sort((left, right) => left.localeCompare(right));

const createRuleItemsByPrefix = (prefix: string): SidebarDocItem[] =>
    allRuleDocIds
        .filter((ruleDocId) => ruleDocId.startsWith(prefix))
        .map((ruleDocId) => ({
            id: ruleDocId,
            type: "doc",
        }));

const tsExtrasRuleItems = createRuleItemsByPrefix("prefer-ts-extras-");
const typeFestRuleItems = createRuleItemsByPrefix("prefer-type-fest-");

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
