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
            href: "/docs/intro",
            label: "🏁 Overview",
            type: "link",
        },
        {
            className: "sb-doc-getting-started",
            href: "/docs/getting-started",
            label: "🚀 Getting Started",
            type: "link",
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
