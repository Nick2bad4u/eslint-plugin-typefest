/**
 * Canonical Docusaurus route prefix for rule documentation pages.
 */
export const DEFAULT_RULE_DOCS_URL_BASE =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules";

/**
 * CreateRuleDocsUrl helper.
 *
 * @param ruleName - Rule identifier without plugin prefix.
 *
 * @returns Canonical docs URL for a rule.
 */
export const createRuleDocsUrl = (ruleName: string): string =>
    `${DEFAULT_RULE_DOCS_URL_BASE}/${ruleName}`;
