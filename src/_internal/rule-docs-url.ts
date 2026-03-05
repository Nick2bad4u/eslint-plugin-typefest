/**
 * @packageDocumentation
 * URL-construction helpers for linking rule metadata to hosted documentation.
 */
/**
 * Canonical Docusaurus route prefix for rule documentation pages.
 */
export const RULE_DOCS_URL_BASE =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules";

/**
 * Build the canonical documentation URL for a plugin rule.
 *
 * @param ruleName - Rule identifier without plugin prefix.
 *
 * @returns Canonical docs URL for a rule.
 */
export const createRuleDocsUrl = (ruleName: string): string =>
    `${RULE_DOCS_URL_BASE}/${ruleName}`;
