/**
 * @packageDocumentation
 * Public type declarations for the vendorable Docusaurus site-contract
 * validator.
 */

/**
 * String or regular-expression matcher accepted by site-contract
 * expectations.
 */
export type PatternLike = string | RegExp;

/**
 * Structured validation failure returned when the site contract is not
 * satisfied.
 */
export type ContractViolation = Readonly<{
    code: string;
    filePath: string;
    message: string;
}>;

/**
 * Regular-expression expectation used when validating source-file content.
 */
export type PatternExpectation = Readonly<{
    description?: string;
    minMatches?: number;
    pattern: RegExp;
}>;

/**
 * Text-level assertions that apply to a specific source file.
 */
export type SourceFileContract = Readonly<{
    forbiddenPatterns?: readonly PatternExpectation[];
    forbiddenSnippets?: readonly string[];
    orderedPatterns?: readonly PatternExpectation[];
    orderedSnippets?: readonly string[];
    path: string;
    requiredPatterns?: readonly PatternExpectation[];
    requiredSnippets?: readonly string[];
}>;

/**
 * Expected npm script entry that must exist in a package manifest.
 */
export type RequiredPackageJsonScript = Readonly<{
    includes?: string;
    name: string;
    pattern?: RegExp;
}>;

/**
 * Package-manifest expectations enforced for a repository file.
 */
export type PackageJsonContract = Readonly<{
    path: string;
    requiredScripts?: readonly RequiredPackageJsonScript[];
}>;

/**
 * Manifest-file expectations for docs-site web app metadata.
 */
export type ManifestContract = Readonly<{
    minimumIcons?: number;
    path: string;
    requireExistingIconFiles?: boolean;
    requiredFields?: Readonly<Record<string, string>>;
}>;

/**
 * Expected shape for a navbar item in the parsed Docusaurus config.
 */
export type NavbarItemContract = Readonly<{
    hrefPattern?: RegExp;
    labelPattern: RegExp;
    minDropdownItems?: number;
    position?: "left" | "right";
    requiredDropdownLabelPatterns?: readonly RegExp[];
    toPattern?: RegExp;
    type?: string;
}>;

/**
 * Navbar-level expectations for ordered items and logo presence.
 */
export type NavbarContract = Readonly<{
    orderedItems: readonly NavbarItemContract[];
    requireLogo?: boolean;
}>;

/**
 * Footer-level expectations for column structure, required labels, and logo
 * presence.
 */
export type FooterContract = Readonly<{
    maxItemCountDelta?: number;
    minColumns?: number;
    requireLogo?: boolean;
    requiredLinkLabelPatterns?: readonly PatternLike[];
    requiredTitles?: readonly PatternLike[];
}>;

/**
 * Expected configuration for the Docusaurus local-search plugin.
 */
export type SearchPluginContract = Readonly<{
    packageName: string;
    requiredOptions?: Readonly<Record<string, boolean | number | string>>;
}>;

/**
 * Docusaurus config expectations enforced by the site-contract validator.
 */
export type DocusaurusConfigContract = Readonly<{
    footer?: FooterContract;
    navbar?: NavbarContract;
    path: string;
    requireFavicon?: boolean;
    requiredClientModuleIdentifiers?: readonly string[];
    requiredPluginNames?: readonly string[];
    requiredThemeNames?: readonly string[];
    requiredTopLevelProperties?: readonly string[];
    requireThemeImage?: boolean;
    searchPlugin?: SearchPluginContract;
    variableName?: string;
}>;

/**
 * Top-level contract definition passed into the site-contract validator.
 */
export type DocusaurusSiteContract = Readonly<{
    docusaurusConfig?: DocusaurusConfigContract;
    manifestFiles?: readonly ManifestContract[];
    packageJsonFiles?: readonly PackageJsonContract[];
    requiredFiles?: readonly string[];
    rootDirectoryPath?: string;
    sourceFiles?: readonly SourceFileContract[];
}>;

/**
 * Define a repository-specific Docusaurus site contract while preserving the
 * declared shape.
 */
export function defineDocusaurusSiteContract(
    siteContract: DocusaurusSiteContract
): DocusaurusSiteContract;

/**
 * Validate a site contract and return all discovered violations.
 */
export function validateDocusaurusSiteContract(
    siteContract: DocusaurusSiteContract
): Promise<ContractViolation[]>;

/**
 * Format contract violations for human-readable CLI output.
 */
export function formatDocusaurusSiteContractViolations(
    violations: readonly ContractViolation[],
    rootDirectoryPath: string
): string;
