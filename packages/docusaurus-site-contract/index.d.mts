export type PatternLike = string | RegExp;

export type ContractViolation = Readonly<{
    code: string;
    filePath: string;
    message: string;
}>;

export type PatternExpectation = Readonly<{
    description?: string;
    minMatches?: number;
    pattern: RegExp;
}>;

export type SourceFileContract = Readonly<{
    forbiddenPatterns?: readonly PatternExpectation[];
    forbiddenSnippets?: readonly string[];
    orderedPatterns?: readonly PatternExpectation[];
    orderedSnippets?: readonly string[];
    path: string;
    requiredPatterns?: readonly PatternExpectation[];
    requiredSnippets?: readonly string[];
}>;

export type RequiredPackageJsonScript = Readonly<{
    includes?: string;
    name: string;
    pattern?: RegExp;
}>;

export type PackageJsonContract = Readonly<{
    path: string;
    requiredScripts?: readonly RequiredPackageJsonScript[];
}>;

export type ManifestContract = Readonly<{
    minimumIcons?: number;
    path: string;
    requireExistingIconFiles?: boolean;
    requiredFields?: Readonly<Record<string, string>>;
}>;

export type NavbarItemContract = Readonly<{
    hrefPattern?: RegExp;
    labelPattern: RegExp;
    minDropdownItems?: number;
    position?: "left" | "right";
    requiredDropdownLabelPatterns?: readonly RegExp[];
    toPattern?: RegExp;
    type?: string;
}>;

export type NavbarContract = Readonly<{
    orderedItems: readonly NavbarItemContract[];
    requireLogo?: boolean;
}>;

export type FooterContract = Readonly<{
    maxItemCountDelta?: number;
    minColumns?: number;
    requireLogo?: boolean;
    requiredLinkLabelPatterns?: readonly PatternLike[];
    requiredTitles?: readonly PatternLike[];
}>;

export type SearchPluginContract = Readonly<{
    packageName: string;
    requiredOptions?: Readonly<Record<string, boolean | number | string>>;
}>;

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

export type DocusaurusSiteContract = Readonly<{
    docusaurusConfig?: DocusaurusConfigContract;
    manifestFiles?: readonly ManifestContract[];
    packageJsonFiles?: readonly PackageJsonContract[];
    requiredFiles?: readonly string[];
    rootDirectoryPath?: string;
    sourceFiles?: readonly SourceFileContract[];
}>;

export function defineDocusaurusSiteContract(
    siteContract: DocusaurusSiteContract
): DocusaurusSiteContract;

export function validateDocusaurusSiteContract(
    siteContract: DocusaurusSiteContract
): Promise<ContractViolation[]>;

export function formatDocusaurusSiteContractViolations(
    violations: readonly ContractViolation[],
    rootDirectoryPath: string
): string;
