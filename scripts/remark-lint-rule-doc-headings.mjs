/**
 * @file Remark lint plugin enforcing canonical H2 heading order for helper
 *   docs.
 */

/** @typedef {import("mdast").Heading} Heading */
/** @typedef {import("mdast").Root} Root */
/** @typedef {import("unist").Node} Node */
/** @typedef {import("vfile").VFile} VFile */

const canonicalHeadingOrder = [
    "Targeted pattern scope",
    "What this rule reports",
    "Why this rule exists",
    "❌ Incorrect",
    "✅ Correct",
    "Behavior and migration notes",
    "Additional examples",
    "ESLint flat config example",
    "When not to use it",
    "Package documentation",
    "Further reading",
    "Adoption resources",
];

const optionalDetailHeadings = new Set([
    "Matched patterns",
    "Detection boundaries",
]);

const optionalDetailAllowedParentHeadings = new Set([
    "Targeted pattern scope",
    "What this rule reports",
]);

const requiredCoreHeadings = [
    "Targeted pattern scope",
    "What this rule reports",
    "Why this rule exists",
    "❌ Incorrect",
    "✅ Correct",
    "Package documentation",
    "Further reading",
];

const headingOrderIndex = new Map(
    canonicalHeadingOrder.map((heading, index) => [heading, index])
);

const helperDocPathPattern = /(^|\/)docs\/rules\/prefer-[^/]+\.md$/u;
const typeFestDocPathPattern = /(^|\/)docs\/rules\/prefer-type-fest-/u;
const tsExtrasDocPathPattern = /(^|\/)docs\/rules\/prefer-ts-extras-/u;

/**
 * @param {string} path
 *
 * @returns {string}
 */
const normalizePath = (path) => path.replaceAll("\\", "/");

/**
 * @param {unknown} value
 *
 * @returns {value is { value: string }}
 */
const hasValue = (value) =>
    typeof value === "object" && value !== null && "value" in value;

/**
 * @param {unknown} value
 *
 * @returns {value is { children: unknown[] }}
 */
const hasChildren = (value) =>
    typeof value === "object" && value !== null && "children" in value;

/**
 * @param {unknown} node
 *
 * @returns {string}
 */
const getNodeText = (node) => {
    if (hasValue(node) && typeof node.value === "string") {
        return node.value;
    }

    if (hasChildren(node) && Array.isArray(node.children)) {
        return node.children.map((child) => getNodeText(child)).join("");
    }

    return "";
};

/**
 * @param {unknown} value
 *
 * @returns {value is Root}
 */
const isRootNode = (value) =>
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "root" &&
    "children" in value &&
    Array.isArray(value.children);

/**
 * @param {unknown} node
 *
 * @returns {node is Heading}
 */
const isHeadingNode = (node) =>
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "heading" &&
    "depth" in node;

/**
 * @param {Root} tree
 * @param {1 | 2} depth
 *
 * @returns {readonly Heading[]}
 */
const getHeadingsByDepth = (tree, depth) =>
    tree.children.filter(
        /**
         * @param {unknown} node
         *
         * @returns {node is Heading}
         */
        (node) =>
            typeof node === "object" &&
            node !== null &&
            "type" in node &&
            node.type === "heading" &&
            "depth" in node &&
            node.depth === depth
    );

/**
 * Enforce canonical helper-doc heading schema.
 *
 * @returns {(tree: Node, file: VFile) => void}
 */
export default function remarkLintRuleDocHeadings() {
    return (tree, file) => {
        if (typeof file.path !== "string") {
            return;
        }

        if (!isRootNode(tree)) {
            return;
        }

        const normalizedPath = normalizePath(file.path);

        if (!helperDocPathPattern.test(normalizedPath)) {
            return;
        }

        const h1Headings = getHeadingsByDepth(tree, 1);
        const h2Headings = getHeadingsByDepth(tree, 2);
        const headingNames = h2Headings.map((heading) =>
            getNodeText(heading).trim()
        );

        const expectedRuleTitle = normalizedPath
            .split("/")
            .at(-1)
            ?.replace(/\.md$/u, "");

        if (h1Headings.length !== 1) {
            file.message(
                "Helper docs must contain exactly one H1 heading.",
                h1Headings[0],
                "remark-lint:rule-doc-headings:h1-count"
            );
        }

        if (h1Headings.length === 1 && typeof expectedRuleTitle === "string") {
            const actualTitle = getNodeText(h1Headings[0]).trim();

            if (actualTitle !== expectedRuleTitle) {
                file.message(
                    `H1 heading must match the file rule id \`${expectedRuleTitle}\`.`,
                    h1Headings[0],
                    "remark-lint:rule-doc-headings:h1-title"
                );
            }
        }

        const seenHeadings = new Set();

        for (const [index, headingName] of headingNames.entries()) {
            if (seenHeadings.has(headingName)) {
                file.message(
                    `Duplicate H2 heading \`${headingName}\` is not allowed.`,
                    h2Headings[index],
                    "remark-lint:rule-doc-headings:duplicate-heading"
                );
                continue;
            }

            seenHeadings.add(headingName);
        }

        let currentH2HeadingName;
        let detectionBoundariesHeadingIndex = -1;
        let matchedPatternsHeadingIndex = -1;

        for (const [index, node] of tree.children.entries()) {
            if (!isHeadingNode(node)) {
                continue;
            }

            const headingName = getNodeText(node).trim();

            if (node.depth === 2) {
                currentH2HeadingName = headingName;
                continue;
            }

            if (node.depth !== 3 || !optionalDetailHeadings.has(headingName)) {
                continue;
            }

            if (
                currentH2HeadingName === undefined ||
                !optionalDetailAllowedParentHeadings.has(currentH2HeadingName)
            ) {
                file.message(
                    `\`### ${headingName}\` must be placed under \`## Targeted pattern scope\` or \`## What this rule reports\`.`,
                    node,
                    "remark-lint:rule-doc-headings:detail-heading-parent"
                );
            }

            if (headingName === "Matched patterns") {
                matchedPatternsHeadingIndex = index;
            }

            if (headingName === "Detection boundaries") {
                detectionBoundariesHeadingIndex = index;
            }
        }

        if (
            detectionBoundariesHeadingIndex !== -1 &&
            matchedPatternsHeadingIndex !== -1 &&
            detectionBoundariesHeadingIndex < matchedPatternsHeadingIndex
        ) {
            const detectionBoundariesHeading =
                tree.children[detectionBoundariesHeadingIndex];

            file.message(
                "`### Detection boundaries` must appear after `### Matched patterns` when both are present.",
                detectionBoundariesHeading,
                "remark-lint:rule-doc-headings:detail-heading-order"
            );
        }

        let lastOrder = -1;

        for (const [index, headingName] of headingNames.entries()) {
            const headingOrder = headingOrderIndex.get(headingName);
            const headingNode = h2Headings[index];

            if (headingOrder === undefined) {
                file.message(
                    `Unexpected H2 heading \`${headingName}\`. Allowed helper-doc headings: ${canonicalHeadingOrder.join(", ")}.`,
                    headingNode,
                    "remark-lint:rule-doc-headings:unknown-heading"
                );
                continue;
            }

            if (headingOrder < lastOrder) {
                file.message(
                    `Heading \`${headingName}\` is out of order. Follow the canonical helper-doc sequence.`,
                    headingNode,
                    "remark-lint:rule-doc-headings:order"
                );
            }

            lastOrder = headingOrder;
        }

        const packageDocumentationIndex = headingNames.indexOf(
            "Package documentation"
        );
        const furtherReadingIndex = headingNames.indexOf("Further reading");

        for (const requiredHeading of requiredCoreHeadings) {
            if (!headingNames.includes(requiredHeading)) {
                file.message(
                    `Missing required H2 heading \`${requiredHeading}\`.`,
                    undefined,
                    "remark-lint:rule-doc-headings:missing-required"
                );
            }
        }

        const targetedPatternScopeIndex = headingNames.indexOf(
            "Targeted pattern scope"
        );
        const whatThisRuleReportsIndex = headingNames.indexOf(
            "What this rule reports"
        );

        if (targetedPatternScopeIndex !== 0) {
            const targetedPatternScopeHeading =
                targetedPatternScopeIndex === -1
                    ? h2Headings[0]
                    : h2Headings[targetedPatternScopeIndex];

            file.message(
                "`## Targeted pattern scope` must be the first H2 section.",
                targetedPatternScopeHeading,
                "remark-lint:rule-doc-headings:targeted-scope-position"
            );
        }

        if (whatThisRuleReportsIndex !== targetedPatternScopeIndex + 1) {
            const targetedPatternScopeHeading =
                targetedPatternScopeIndex === -1
                    ? h2Headings[0]
                    : h2Headings[targetedPatternScopeIndex];

            file.message(
                "`## What this rule reports` must immediately follow `## Targeted pattern scope`.",
                targetedPatternScopeHeading,
                "remark-lint:rule-doc-headings:targeted-scope-adjacent"
            );
        }

        if (packageDocumentationIndex === -1) {
            file.message(
                "Missing required `## Package documentation` section.",
                undefined,
                "remark-lint:rule-doc-headings:missing-package-docs"
            );
        }

        if (furtherReadingIndex === -1) {
            file.message(
                "Missing required `## Further reading` section.",
                undefined,
                "remark-lint:rule-doc-headings:missing-further-reading"
            );
        }

        if (
            packageDocumentationIndex !== -1 &&
            furtherReadingIndex !== -1 &&
            packageDocumentationIndex !== furtherReadingIndex - 1
        ) {
            const packageHeadingNode = h2Headings[packageDocumentationIndex];

            file.message(
                "`## Package documentation` must appear immediately before `## Further reading`.",
                packageHeadingNode,
                "remark-lint:rule-doc-headings:package-placement"
            );
        }

        const markdownContent = String(file);

        if (
            typeFestDocPathPattern.test(normalizedPath) &&
            !/^TypeFest package documentation:$/mu.test(markdownContent)
        ) {
            file.message(
                "TypeFest helper docs must include the exact label `TypeFest package documentation:`.",
                undefined,
                "remark-lint:rule-doc-headings:typefest-label"
            );
        }

        if (
            tsExtrasDocPathPattern.test(normalizedPath) &&
            !/^ts-extras package documentation:$/mu.test(markdownContent)
        ) {
            file.message(
                "ts-extras helper docs must include the exact label `ts-extras package documentation:`.",
                undefined,
                "remark-lint:rule-doc-headings:ts-extras-label"
            );
        }
    };
}
