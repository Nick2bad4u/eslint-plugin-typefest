// @ts-check

/**
 * @packageDocumentation
 * Generic, config-driven Docusaurus site contract validator.
 *
 * The validator is intentionally repo-agnostic: repository-specific expectations
 * live in a separate contract file that describes required assets, source-file
 * invariants, navbar/footer structure, and docs-workspace package scripts.
 */

import { access, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import typescript from "typescript";

const ts = typescript;

/** @typedef {string | RegExp} PatternLike */

/**
 * @typedef {Readonly<{
 *     code: string;
 *     filePath: string;
 *     message: string;
 * }>} ContractViolation
 */

/**
 * @typedef {Readonly<{
 *     description?: string;
 *     minMatches?: number;
 *     pattern: RegExp;
 * }>} PatternExpectation
 */

/**
 * @typedef {Readonly<{
 *     forbiddenPatterns?: readonly PatternExpectation[];
 *     forbiddenSnippets?: readonly string[];
 *     orderedPatterns?: readonly PatternExpectation[];
 *     orderedSnippets?: readonly string[];
 *     path: string;
 *     requiredPatterns?: readonly PatternExpectation[];
 *     requiredSnippets?: readonly string[];
 * }>} SourceFileContract
 */

/**
 * @typedef {Readonly<{
 *     includes?: string;
 *     name: string;
 *     pattern?: RegExp;
 * }>} RequiredPackageJsonScript
 */

/**
 * @typedef {Readonly<{
 *     path: string;
 *     requiredScripts?: readonly RequiredPackageJsonScript[];
 * }>} PackageJsonContract
 */

/**
 * @typedef {Readonly<{
 *     minimumIcons?: number;
 *     path: string;
 *     requireExistingIconFiles?: boolean;
 *     requiredFields?: Readonly<Record<string, string>>;
 * }>} ManifestContract
 */

/**
 * @typedef {Readonly<{
 *     hrefPattern?: RegExp;
 *     labelPattern: RegExp;
 *     minDropdownItems?: number;
 *     position?: "left" | "right";
 *     requiredDropdownLabelPatterns?: readonly RegExp[];
 *     toPattern?: RegExp;
 *     type?: string;
 * }>} NavbarItemContract
 */

/**
 * @typedef {Readonly<{
 *     orderedItems: readonly NavbarItemContract[];
 *     requireLogo?: boolean;
 * }>} NavbarContract
 */

/**
 * @typedef {Readonly<{
 *     maxItemCountDelta?: number;
 *     minColumns?: number;
 *     requireLogo?: boolean;
 *     requiredLinkLabelPatterns?: readonly PatternLike[];
 *     requiredTitles?: readonly PatternLike[];
 * }>} FooterContract
 */

/**
 * @typedef {Readonly<{
 *     packageName: string;
 *     requiredOptions?: Readonly<Record<string, boolean | number | string>>;
 * }>} SearchPluginContract
 */

/**
 * @typedef {Readonly<{
 *     footer?: FooterContract;
 *     navbar?: NavbarContract;
 *     path: string;
 *     requireFavicon?: boolean;
 *     requiredClientModuleIdentifiers?: readonly string[];
 *     requiredPluginNames?: readonly string[];
 *     requiredThemeNames?: readonly string[];
 *     requiredTopLevelProperties?: readonly string[];
 *     requireThemeImage?: boolean;
 *     searchPlugin?: SearchPluginContract;
 *     variableName?: string;
 * }>} DocusaurusConfigContract
 */

/**
 * @typedef {Readonly<{
 *     docusaurusConfig?: DocusaurusConfigContract;
 *     manifestFiles?: readonly ManifestContract[];
 *     packageJsonFiles?: readonly PackageJsonContract[];
 *     requiredFiles?: readonly string[];
 *     rootDirectoryPath?: string;
 *     sourceFiles?: readonly SourceFileContract[];
 * }>} DocusaurusSiteContract
 */

/**
 * @typedef {Readonly<{
 *     footerColumns: readonly FooterColumnInfo[];
 *     hasFooterLogo: boolean;
 *     hasNavbarLogo: boolean;
 *     navbarItems: readonly NavbarItemInfo[];
 *     pluginNames: readonly string[];
 *     searchPluginOptions: null | Readonly<
 *         Record<string, boolean | number | string>
 *     >;
 *     topLevelPropertyNames: readonly string[];
 *     themeNames: readonly string[];
 *     themeImageValue: null | string;
 *     faviconValue: null | string;
 *     clientModuleIdentifiers: readonly string[];
 * }>} ParsedDocusaurusConfig
 */

/**
 * @typedef {Readonly<{
 *     childLabels: readonly string[];
 *     hrefValue: null | string;
 *     labelValue: null | string;
 *     positionValue: null | string;
 *     toValue: null | string;
 *     typeValue: null | string;
 * }>} NavbarItemInfo
 */

/**
 * @typedef {Readonly<{
 *     itemCount: number;
 *     itemLabels: readonly string[];
 *     titleValue: null | string;
 * }>} FooterColumnInfo
 */

/**
 * Convert a string or regular expression contract matcher into display text.
 *
 * @param {PatternLike} patternLike
 *
 * @returns {string}
 */
const describePatternLike = (patternLike) =>
    typeof patternLike === "string"
        ? JSON.stringify(patternLike)
        : patternLike.toString();

/**
 * Resolve a contract-relative path from the repository root.
 *
 * @param {string} rootDirectoryPath
 * @param {string} contractPath
 *
 * @returns {string}
 */
const resolveFromRoot = (rootDirectoryPath, contractPath) =>
    resolve(rootDirectoryPath, contractPath);

/**
 * Format a path relative to the repository root for diagnostics.
 *
 * @param {string} rootDirectoryPath
 * @param {string} absoluteFilePath
 *
 * @returns {string}
 */
const toRelativePath = (rootDirectoryPath, absoluteFilePath) => {
    const relativePath = relative(rootDirectoryPath, absoluteFilePath);

    return relativePath.length === 0 ? "." : relativePath.replaceAll("\\", "/");
};

/**
 * Create a structured contract violation.
 *
 * @param {string} code
 * @param {string} filePath
 * @param {string} message
 *
 * @returns {ContractViolation}
 */
const createViolation = (code, filePath, message) => ({
    code,
    filePath,
    message,
});

/**
 * Identity helper for authoring a site contract with clearer intent.
 *
 * @param {DocusaurusSiteContract} siteContract
 *
 * @returns {DocusaurusSiteContract}
 */
const defineDocusaurusSiteContract = (siteContract) => siteContract;

/**
 * Check whether a file exists.
 *
 * @param {string} absoluteFilePath
 *
 * @returns {Promise<boolean>}
 */
const fileExists = async (absoluteFilePath) => {
    try {
        await access(absoluteFilePath);
        return true;
    } catch {
        return false;
    }
};

/**
 * Read a UTF-8 source file.
 *
 * @param {string} absoluteFilePath
 *
 * @returns {Promise<string>}
 */
const readUtf8File = async (absoluteFilePath) =>
    readFile(absoluteFilePath, "utf8");

/**
 * Find a named top-level variable initializer inside a source file.
 *
 * @param {import("typescript").SourceFile} sourceFile
 * @param {string} variableName
 *
 * @returns {import("typescript").Expression | null}
 */
const findNamedVariableInitializer = (sourceFile, variableName) => {
    /** @type {import("typescript").Expression | null} */
    let initializer = null;

    /**
     * @param {import("typescript").Node} node
     */
    const visit = (node) => {
        if (initializer !== null) {
            return;
        }

        if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === variableName &&
            node.initializer !== undefined
        ) {
            initializer = node.initializer;
            return;
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return initializer;
};

/**
 * Peel off TypeScript wrapper expressions that do not change runtime value
 * shape (e.g. `satisfies`, `as`, or parenthesized expressions).
 *
 * @param {import("typescript").Expression} expression
 *
 * @returns {import("typescript").Expression}
 */
const unwrapExpression = (expression) => {
    let currentExpression = expression;

    while (
        ts.isAsExpression(currentExpression) ||
        ts.isParenthesizedExpression(currentExpression) ||
        ts.isSatisfiesExpression(currentExpression) ||
        ts.isTypeAssertionExpression(currentExpression)
    ) {
        currentExpression = currentExpression.expression;
    }

    return currentExpression;
};

/**
 * Read a stable property name from an object-literal property declaration.
 *
 * @param {import("typescript").PropertyName} propertyName
 *
 * @returns {null | string}
 */
const getPropertyNameText = (propertyName) => {
    if (
        ts.isIdentifier(propertyName) ||
        ts.isNumericLiteral(propertyName) ||
        ts.isStringLiteral(propertyName)
    ) {
        return propertyName.text;
    }

    if (
        ts.isComputedPropertyName(propertyName) &&
        ts.isStringLiteralLike(propertyName.expression)
    ) {
        return propertyName.expression.text;
    }

    return null;
};

/**
 * Resolve a property initializer from an object literal.
 *
 * @param {import("typescript").ObjectLiteralExpression} objectLiteral
 * @param {string} propertyName
 *
 * @returns {import("typescript").Expression | null}
 */
const getObjectPropertyInitializer = (objectLiteral, propertyName) => {
    for (const property of objectLiteral.properties) {
        if (
            ts.isPropertyAssignment(property) &&
            getPropertyNameText(property.name) === propertyName
        ) {
            return property.initializer;
        }

        if (
            ts.isShorthandPropertyAssignment(property) &&
            getPropertyNameText(property.name) === propertyName
        ) {
            return property.name;
        }
    }

    return null;
};

/**
 * Convert an arbitrary expression to an object literal when possible.
 *
 * @param {import("typescript").Expression | null} expression
 *
 * @returns {import("typescript").ObjectLiteralExpression | null}
 */
const toObjectLiteralExpression = (expression) => {
    if (expression === null) {
        return null;
    }

    const unwrappedExpression = unwrapExpression(expression);

    return ts.isObjectLiteralExpression(unwrappedExpression)
        ? unwrappedExpression
        : null;
};

/**
 * Convert an arbitrary expression to an array literal when possible.
 *
 * @param {import("typescript").Expression | null} expression
 *
 * @returns {import("typescript").ArrayLiteralExpression | null}
 */
const toArrayLiteralExpression = (expression) => {
    if (expression === null) {
        return null;
    }

    const unwrappedExpression = unwrapExpression(expression);

    return ts.isArrayLiteralExpression(unwrappedExpression)
        ? unwrappedExpression
        : null;
};

/**
 * Convert an expression to a primitive value when it is represented as a plain
 * string, boolean, or number literal.
 *
 * @param {import("typescript").Expression | null} expression
 *
 * @returns {boolean | number | null | string | undefined}
 */
const toPrimitiveValue = (expression) => {
    if (expression === null) {
        return undefined;
    }

    const unwrappedExpression = unwrapExpression(expression);

    if (
        ts.isStringLiteral(unwrappedExpression) ||
        ts.isNoSubstitutionTemplateLiteral(unwrappedExpression)
    ) {
        return unwrappedExpression.text;
    }

    if (unwrappedExpression.kind === ts.SyntaxKind.TrueKeyword) {
        return true;
    }

    if (unwrappedExpression.kind === ts.SyntaxKind.FalseKeyword) {
        return false;
    }

    if (ts.isNumericLiteral(unwrappedExpression)) {
        return Number(unwrappedExpression.text);
    }

    if (unwrappedExpression.kind === ts.SyntaxKind.NullKeyword) {
        return null;
    }

    return undefined;
};

/**
 * Produce a stable string for diagnostics and regex matching.
 *
 * @param {import("typescript").Expression | null} expression
 * @param {import("typescript").SourceFile} sourceFile
 *
 * @returns {null | string}
 */
const toComparableText = (expression, sourceFile) => {
    if (expression === null) {
        return null;
    }

    const primitiveValue = toPrimitiveValue(expression);

    if (typeof primitiveValue === "string") {
        return primitiveValue;
    }

    if (
        typeof primitiveValue === "boolean" ||
        typeof primitiveValue === "number"
    ) {
        return String(primitiveValue);
    }

    const unwrappedExpression = unwrapExpression(expression);

    if (ts.isIdentifier(unwrappedExpression)) {
        return unwrappedExpression.text;
    }

    if (ts.isTemplateExpression(unwrappedExpression)) {
        let templateText = unwrappedExpression.head.text;

        for (const templateSpan of unwrappedExpression.templateSpans) {
            templateText += `\${${templateSpan.expression.getText(sourceFile)}}${templateSpan.literal.text}`;
        }

        return templateText;
    }

    return unwrappedExpression
        .getText(sourceFile)
        .replaceAll(/\s+/gv, " ")
        .trim();
};

/**
 * Match a string against either a literal string expectation or a regex.
 *
 * @param {null | string} candidateText
 * @param {PatternLike} patternLike
 *
 * @returns {boolean}
 */
const matchesPatternLike = (candidateText, patternLike) => {
    if (candidateText === null) {
        return false;
    }

    return typeof patternLike === "string"
        ? candidateText === patternLike
        : patternLike.test(candidateText);
};

/**
 * Count all matches for a required source-file regex.
 *
 * @param {string} sourceText
 * @param {RegExp} pattern
 *
 * @returns {number}
 */
const countPatternMatches = (sourceText, pattern) => {
    const safePattern = pattern.global
        ? new RegExp(pattern.source, pattern.flags)
        : new RegExp(pattern.source, `${pattern.flags}g`);

    return [...sourceText.matchAll(safePattern)].length;
};

/**
 * Find the first source offset matched by a regex.
 *
 * @param {string} sourceText
 * @param {RegExp} pattern
 *
 * @returns {number}
 */
const findFirstPatternOffset = (sourceText, pattern) => {
    const safePattern = new RegExp(
        pattern.source,
        pattern.flags.replaceAll("g", "")
    );
    const match = safePattern.exec(sourceText);

    return match?.index ?? -1;
};

/**
 * Collect plugin or theme package names from a Docusaurus tuple/string array.
 *
 * @param {import("typescript").ArrayLiteralExpression | null} arrayLiteral
 * @param {import("typescript").SourceFile} sourceFile
 *
 * @returns {string[]}
 */
const collectNamedTupleEntries = (arrayLiteral, sourceFile) => {
    if (arrayLiteral === null) {
        return [];
    }

    const names = [];

    for (const element of arrayLiteral.elements) {
        const unwrappedElement = unwrapExpression(element);

        if (
            ts.isStringLiteral(unwrappedElement) ||
            ts.isNoSubstitutionTemplateLiteral(unwrappedElement)
        ) {
            names.push(unwrappedElement.text);
            continue;
        }

        if (ts.isArrayLiteralExpression(unwrappedElement)) {
            const tupleHead = unwrappedElement.elements.at(0);
            const tupleHeadText = tupleHead
                ? toComparableText(tupleHead, sourceFile)
                : null;

            if (tupleHeadText !== null) {
                names.push(tupleHeadText);
            }
        }
    }

    return names;
};

/**
 * Find the options object belonging to a named plugin/theme tuple.
 *
 * @param {import("typescript").ArrayLiteralExpression | null} arrayLiteral
 * @param {import("typescript").SourceFile} sourceFile
 * @param {string} tupleName
 *
 * @returns {import("typescript").ObjectLiteralExpression | null}
 */
const findNamedTupleOptionsObject = (arrayLiteral, sourceFile, tupleName) => {
    if (arrayLiteral === null) {
        return null;
    }

    for (const element of arrayLiteral.elements) {
        const unwrappedElement = unwrapExpression(element);

        if (!ts.isArrayLiteralExpression(unwrappedElement)) {
            continue;
        }

        const tupleHead = unwrappedElement.elements.at(0);
        const tupleHeadText = tupleHead
            ? toComparableText(tupleHead, sourceFile)
            : null;

        if (tupleHeadText !== tupleName) {
            continue;
        }

        const tupleOptions = unwrappedElement.elements.at(1);

        return tupleOptions ? toObjectLiteralExpression(tupleOptions) : null;
    }

    return null;
};

/**
 * Extract comparable values from an object-literal options object.
 *
 * @param {import("typescript").ObjectLiteralExpression | null} objectLiteral
 * @param {import("typescript").SourceFile} sourceFile
 *
 * @returns {Readonly<Record<string, boolean | number | string>>}
 */
const collectPrimitiveObjectEntries = (objectLiteral, sourceFile) => {
    if (objectLiteral === null) {
        return {};
    }

    /** @type {Record<string, boolean | number | string>} */
    const entries = {};

    for (const property of objectLiteral.properties) {
        if (!ts.isPropertyAssignment(property)) {
            continue;
        }

        const propertyName = getPropertyNameText(property.name);

        if (propertyName === null) {
            continue;
        }

        const primitiveValue = toPrimitiveValue(property.initializer);

        if (
            typeof primitiveValue === "boolean" ||
            typeof primitiveValue === "number" ||
            typeof primitiveValue === "string"
        ) {
            entries[propertyName] = primitiveValue;
            continue;
        }

        const comparableText = toComparableText(
            property.initializer,
            sourceFile
        );

        if (comparableText !== null) {
            entries[propertyName] = comparableText;
        }
    }

    return entries;
};

/**
 * Collect child dropdown labels from a navbar item.
 *
 * @param {import("typescript").Expression | null} expression
 * @param {import("typescript").SourceFile} sourceFile
 *
 * @returns {string[]}
 */
const collectDropdownItemLabels = (expression, sourceFile) => {
    const itemsArray = toArrayLiteralExpression(expression);

    if (itemsArray === null) {
        return [];
    }

    const labels = [];

    for (const element of itemsArray.elements) {
        const itemObject = toObjectLiteralExpression(element);
        const labelText = itemObject
            ? toComparableText(
                  getObjectPropertyInitializer(itemObject, "label"),
                  sourceFile
              )
            : null;

        if (labelText !== null) {
            labels.push(labelText);
        }
    }

    return labels;
};

/**
 * Collect structured navbar item information from `themeConfig.navbar.items`.
 *
 * @param {import("typescript").ArrayLiteralExpression | null} navbarItemsArray
 * @param {import("typescript").SourceFile} sourceFile
 *
 * @returns {NavbarItemInfo[]}
 */
const collectNavbarItems = (navbarItemsArray, sourceFile) => {
    if (navbarItemsArray === null) {
        return [];
    }

    const items = [];

    for (const element of navbarItemsArray.elements) {
        const itemObject = toObjectLiteralExpression(element);

        if (itemObject === null) {
            continue;
        }

        items.push({
            childLabels: collectDropdownItemLabels(
                getObjectPropertyInitializer(itemObject, "items"),
                sourceFile
            ),
            hrefValue: toComparableText(
                getObjectPropertyInitializer(itemObject, "href"),
                sourceFile
            ),
            labelValue: toComparableText(
                getObjectPropertyInitializer(itemObject, "label"),
                sourceFile
            ),
            positionValue: toComparableText(
                getObjectPropertyInitializer(itemObject, "position"),
                sourceFile
            ),
            toValue: toComparableText(
                getObjectPropertyInitializer(itemObject, "to"),
                sourceFile
            ),
            typeValue: toComparableText(
                getObjectPropertyInitializer(itemObject, "type"),
                sourceFile
            ),
        });
    }

    return items;
};

/**
 * Collect footer column information from `themeConfig.footer.links`.
 *
 * @param {import("typescript").ArrayLiteralExpression | null} footerLinksArray
 * @param {import("typescript").SourceFile} sourceFile
 *
 * @returns {FooterColumnInfo[]}
 */
const collectFooterColumns = (footerLinksArray, sourceFile) => {
    if (footerLinksArray === null) {
        return [];
    }

    const columns = [];

    for (const element of footerLinksArray.elements) {
        const columnObject = toObjectLiteralExpression(element);

        if (columnObject === null) {
            continue;
        }

        const itemLabels = collectDropdownItemLabels(
            getObjectPropertyInitializer(columnObject, "items"),
            sourceFile
        );

        columns.push({
            itemCount: itemLabels.length,
            itemLabels,
            titleValue: toComparableText(
                getObjectPropertyInitializer(columnObject, "title"),
                sourceFile
            ),
        });
    }

    return columns;
};

/**
 * Parse a Docusaurus config source file into a structure suitable for contract
 * validation.
 *
 * @param {string} absoluteFilePath
 * @param {string} variableName
 *
 * @returns {Promise<null | ParsedDocusaurusConfig>}
 */
const parseDocusaurusConfig = async (absoluteFilePath, variableName) => {
    const sourceText = await readUtf8File(absoluteFilePath);
    const scriptKind = absoluteFilePath.endsWith(".ts")
        ? ts.ScriptKind.TS
        : ts.ScriptKind.JS;
    const sourceFile = ts.createSourceFile(
        absoluteFilePath,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        scriptKind
    );
    const initializer = findNamedVariableInitializer(sourceFile, variableName);
    const configObject = toObjectLiteralExpression(initializer);

    if (configObject === null) {
        return null;
    }

    const topLevelPropertyNames = configObject.properties
        .flatMap((property) => {
            if (
                ts.isPropertyAssignment(property) ||
                ts.isShorthandPropertyAssignment(property)
            ) {
                const propertyName = getPropertyNameText(property.name);
                return propertyName === null ? [] : [propertyName];
            }

            return [];
        })
        .toSorted((left, right) => left.localeCompare(right));

    const pluginsArray = toArrayLiteralExpression(
        getObjectPropertyInitializer(configObject, "plugins")
    );
    const themesArray = toArrayLiteralExpression(
        getObjectPropertyInitializer(configObject, "themes")
    );
    const clientModulesArray = toArrayLiteralExpression(
        getObjectPropertyInitializer(configObject, "clientModules")
    );
    const themeConfigObject = toObjectLiteralExpression(
        getObjectPropertyInitializer(configObject, "themeConfig")
    );
    const navbarObject = themeConfigObject
        ? toObjectLiteralExpression(
              getObjectPropertyInitializer(themeConfigObject, "navbar")
          )
        : null;
    const footerObject = themeConfigObject
        ? toObjectLiteralExpression(
              getObjectPropertyInitializer(themeConfigObject, "footer")
          )
        : null;
    const navbarItemsArray = navbarObject
        ? toArrayLiteralExpression(
              getObjectPropertyInitializer(navbarObject, "items")
          )
        : null;
    const footerLinksArray = footerObject
        ? toArrayLiteralExpression(
              getObjectPropertyInitializer(footerObject, "links")
          )
        : null;

    return {
        clientModuleIdentifiers:
            clientModulesArray?.elements
                .map((element) => toComparableText(element, sourceFile))
                .filter((identifier) => identifier !== null) ?? [],
        faviconValue: toComparableText(
            getObjectPropertyInitializer(configObject, "favicon"),
            sourceFile
        ),
        footerColumns: collectFooterColumns(footerLinksArray, sourceFile),
        hasFooterLogo:
            footerObject !== null &&
            toObjectLiteralExpression(
                getObjectPropertyInitializer(footerObject, "logo")
            ) !== null,
        hasNavbarLogo:
            navbarObject !== null &&
            toObjectLiteralExpression(
                getObjectPropertyInitializer(navbarObject, "logo")
            ) !== null,
        navbarItems: collectNavbarItems(navbarItemsArray, sourceFile),
        pluginNames: collectNamedTupleEntries(pluginsArray, sourceFile),
        searchPluginOptions: collectPrimitiveObjectEntries(
            findNamedTupleOptionsObject(
                themesArray,
                sourceFile,
                "@easyops-cn/docusaurus-search-local"
            ),
            sourceFile
        ),
        themeImageValue:
            themeConfigObject === null
                ? null
                : toComparableText(
                      getObjectPropertyInitializer(themeConfigObject, "image"),
                      sourceFile
                  ),
        themeNames: collectNamedTupleEntries(themesArray, sourceFile),
        topLevelPropertyNames,
    };
};

/**
 * Validate simple required file existence.
 *
 * @param {string} rootDirectoryPath
 * @param {readonly string[]} requiredFiles
 *
 * @returns {Promise<ContractViolation[]>}
 */
const validateRequiredFiles = async (rootDirectoryPath, requiredFiles) => {
    const violations = [];

    for (const requiredFilePath of requiredFiles) {
        const absoluteFilePath = resolveFromRoot(
            rootDirectoryPath,
            requiredFilePath
        );
        const exists = await fileExists(absoluteFilePath);

        if (!exists) {
            violations.push(
                createViolation(
                    "missing-file",
                    absoluteFilePath,
                    `Required docs-site file is missing: ${requiredFilePath}.`
                )
            );
        }
    }

    return violations;
};

/**
 * Validate package.json script expectations.
 *
 * @param {string} rootDirectoryPath
 * @param {readonly PackageJsonContract[]} packageJsonContracts
 *
 * @returns {Promise<ContractViolation[]>}
 */
const validatePackageJsonContracts = async (
    rootDirectoryPath,
    packageJsonContracts
) => {
    const violations = [];

    for (const packageJsonContract of packageJsonContracts) {
        const absoluteFilePath = resolveFromRoot(
            rootDirectoryPath,
            packageJsonContract.path
        );

        if (!(await fileExists(absoluteFilePath))) {
            violations.push(
                createViolation(
                    "package-json-missing",
                    absoluteFilePath,
                    `Package manifest '${packageJsonContract.path}' is missing.`
                )
            );
            continue;
        }

        const rawPackageJson = await readUtf8File(absoluteFilePath);
        /** @type {{ scripts?: Record<string, string> }} */
        const packageJson = JSON.parse(rawPackageJson);
        const scripts = packageJson.scripts ?? {};

        for (const requiredScript of packageJsonContract.requiredScripts ??
            []) {
            const actualScript = scripts[requiredScript.name];

            if (typeof actualScript !== "string") {
                violations.push(
                    createViolation(
                        "package-script-missing",
                        absoluteFilePath,
                        `Expected script '${requiredScript.name}' in ${packageJsonContract.path}.`
                    )
                );
                continue;
            }

            if (
                requiredScript.includes !== undefined &&
                !actualScript.includes(requiredScript.includes)
            ) {
                violations.push(
                    createViolation(
                        "package-script-mismatch",
                        absoluteFilePath,
                        `Script '${requiredScript.name}' must include ${JSON.stringify(requiredScript.includes)}.`
                    )
                );
            }

            if (
                requiredScript.pattern !== undefined &&
                !requiredScript.pattern.test(actualScript)
            ) {
                violations.push(
                    createViolation(
                        "package-script-mismatch",
                        absoluteFilePath,
                        `Script '${requiredScript.name}' must match ${requiredScript.pattern.toString()}.`
                    )
                );
            }
        }
    }

    return violations;
};

/**
 * Validate manifest metadata and icon file existence.
 *
 * @param {string} rootDirectoryPath
 * @param {readonly ManifestContract[]} manifestContracts
 *
 * @returns {Promise<ContractViolation[]>}
 */
const validateManifestContracts = async (
    rootDirectoryPath,
    manifestContracts
) => {
    const violations = [];

    for (const manifestContract of manifestContracts) {
        const absoluteFilePath = resolveFromRoot(
            rootDirectoryPath,
            manifestContract.path
        );

        if (!(await fileExists(absoluteFilePath))) {
            violations.push(
                createViolation(
                    "manifest-missing",
                    absoluteFilePath,
                    `Manifest '${manifestContract.path}' is missing.`
                )
            );
            continue;
        }

        const rawManifest = await readUtf8File(absoluteFilePath);
        /** @type {{ icons?: { src?: string }[]; [key: string]: unknown }} */
        const manifest = JSON.parse(rawManifest);
        const icons = Array.isArray(manifest.icons) ? manifest.icons : [];

        for (const [fieldName, expectedValue] of Object.entries(
            manifestContract.requiredFields ?? {}
        )) {
            const actualValue = manifest[fieldName];

            if (actualValue !== expectedValue) {
                violations.push(
                    createViolation(
                        "manifest-field-mismatch",
                        absoluteFilePath,
                        `Manifest field '${fieldName}' must equal ${JSON.stringify(expectedValue)}.`
                    )
                );
            }
        }

        const minimumIcons = manifestContract.minimumIcons ?? 0;

        if (icons.length < minimumIcons) {
            violations.push(
                createViolation(
                    "manifest-icons-missing",
                    absoluteFilePath,
                    `Manifest must declare at least ${minimumIcons} icon(s); found ${icons.length}.`
                )
            );
        }

        if (manifestContract.requireExistingIconFiles) {
            for (const icon of icons) {
                const iconSrc =
                    typeof icon.src === "string" ? icon.src : undefined;

                if (iconSrc === undefined) {
                    violations.push(
                        createViolation(
                            "manifest-icon-src-missing",
                            absoluteFilePath,
                            "Manifest icon entries must include a string 'src' value."
                        )
                    );
                    continue;
                }

                const absoluteIconPath = resolve(
                    dirname(absoluteFilePath),
                    iconSrc
                );
                const exists = await fileExists(absoluteIconPath);

                if (!exists) {
                    violations.push(
                        createViolation(
                            "manifest-icon-file-missing",
                            absoluteFilePath,
                            `Manifest icon '${iconSrc}' does not exist on disk.`
                        )
                    );
                }
            }
        }
    }

    return violations;
};

/**
 * Validate plain-text source-file contracts.
 *
 * @param {string} rootDirectoryPath
 * @param {readonly SourceFileContract[]} sourceFileContracts
 *
 * @returns {Promise<ContractViolation[]>}
 */
const validateSourceFileContracts = async (
    rootDirectoryPath,
    sourceFileContracts
) => {
    const violations = [];

    for (const sourceFileContract of sourceFileContracts) {
        const absoluteFilePath = resolveFromRoot(
            rootDirectoryPath,
            sourceFileContract.path
        );

        if (!(await fileExists(absoluteFilePath))) {
            violations.push(
                createViolation(
                    "source-file-missing",
                    absoluteFilePath,
                    `Source file '${sourceFileContract.path}' is missing.`
                )
            );
            continue;
        }

        const sourceText = await readUtf8File(absoluteFilePath);

        for (const requiredSnippet of sourceFileContract.requiredSnippets ??
            []) {
            if (!sourceText.includes(requiredSnippet)) {
                violations.push(
                    createViolation(
                        "source-required-snippet-missing",
                        absoluteFilePath,
                        `Source must include snippet ${JSON.stringify(requiredSnippet)}.`
                    )
                );
            }
        }

        for (const forbiddenSnippet of sourceFileContract.forbiddenSnippets ??
            []) {
            if (sourceText.includes(forbiddenSnippet)) {
                violations.push(
                    createViolation(
                        "source-forbidden-snippet-present",
                        absoluteFilePath,
                        `Source must not include snippet ${JSON.stringify(forbiddenSnippet)}.`
                    )
                );
            }
        }

        let lastSnippetOffset = -1;

        for (const orderedSnippet of sourceFileContract.orderedSnippets ?? []) {
            const snippetOffset = sourceText.indexOf(orderedSnippet);

            if (snippetOffset === -1) {
                violations.push(
                    createViolation(
                        "source-ordered-snippet-missing",
                        absoluteFilePath,
                        `Source must include ordered snippet ${JSON.stringify(orderedSnippet)}.`
                    )
                );
                continue;
            }

            if (snippetOffset < lastSnippetOffset) {
                violations.push(
                    createViolation(
                        "source-order-violation",
                        absoluteFilePath,
                        `Ordered snippet ${JSON.stringify(orderedSnippet)} appears out of sequence.`
                    )
                );
            }

            lastSnippetOffset = snippetOffset;
        }

        let lastPatternOffset = -1;

        for (const orderedPattern of sourceFileContract.orderedPatterns ?? []) {
            const patternOffset = findFirstPatternOffset(
                sourceText,
                orderedPattern.pattern
            );

            if (patternOffset === -1) {
                violations.push(
                    createViolation(
                        "source-ordered-pattern-missing",
                        absoluteFilePath,
                        `Source must include ordered pattern ${orderedPattern.description ?? orderedPattern.pattern.toString()}.`
                    )
                );
                continue;
            }

            if (patternOffset < lastPatternOffset) {
                violations.push(
                    createViolation(
                        "source-pattern-order-violation",
                        absoluteFilePath,
                        `Ordered pattern ${orderedPattern.description ?? orderedPattern.pattern.toString()} appears out of sequence.`
                    )
                );
            }

            lastPatternOffset = patternOffset;
        }

        for (const requiredPattern of sourceFileContract.requiredPatterns ??
            []) {
            const matchCount = countPatternMatches(
                sourceText,
                requiredPattern.pattern
            );
            const minimumMatches = requiredPattern.minMatches ?? 1;

            if (matchCount < minimumMatches) {
                violations.push(
                    createViolation(
                        "source-required-pattern-missing",
                        absoluteFilePath,
                        `Source must match ${requiredPattern.description ?? requiredPattern.pattern.toString()} at least ${minimumMatches} time(s); found ${matchCount}.`
                    )
                );
            }
        }

        for (const forbiddenPattern of sourceFileContract.forbiddenPatterns ??
            []) {
            if (countPatternMatches(sourceText, forbiddenPattern.pattern) > 0) {
                violations.push(
                    createViolation(
                        "source-forbidden-pattern-present",
                        absoluteFilePath,
                        `Source must not match ${forbiddenPattern.description ?? forbiddenPattern.pattern.toString()}.`
                    )
                );
            }
        }
    }

    return violations;
};

/**
 * Check whether a navbar item satisfies a contract item.
 *
 * @param {NavbarItemInfo} navbarItem
 * @param {NavbarItemContract} navbarItemContract
 *
 * @returns {boolean}
 */
const navbarItemMatchesContract = (navbarItem, navbarItemContract) => {
    if (!navbarItemContract.labelPattern.test(navbarItem.labelValue ?? "")) {
        return false;
    }

    if (
        navbarItemContract.position !== undefined &&
        navbarItem.positionValue !== navbarItemContract.position
    ) {
        return false;
    }

    if (
        navbarItemContract.type !== undefined &&
        navbarItem.typeValue !== navbarItemContract.type
    ) {
        return false;
    }

    if (
        navbarItemContract.toPattern !== undefined &&
        !navbarItemContract.toPattern.test(navbarItem.toValue ?? "")
    ) {
        return false;
    }

    if (
        navbarItemContract.hrefPattern !== undefined &&
        !navbarItemContract.hrefPattern.test(navbarItem.hrefValue ?? "")
    ) {
        return false;
    }

    if (
        navbarItemContract.minDropdownItems !== undefined &&
        navbarItem.childLabels.length < navbarItemContract.minDropdownItems
    ) {
        return false;
    }

    return (navbarItemContract.requiredDropdownLabelPatterns ?? []).every(
        (requiredChildLabelPattern) =>
            navbarItem.childLabels.some((childLabel) =>
                requiredChildLabelPattern.test(childLabel)
            )
    );
};

/**
 * Find the first navbar item whose label matches the contract label pattern.
 *
 * @param {readonly NavbarItemInfo[]} navbarItems
 * @param {NavbarItemContract} navbarItemContract
 *
 * @returns {{ index: number; item: NavbarItemInfo } | null}
 */
const findNavbarItemByLabel = (navbarItems, navbarItemContract) => {
    const index = navbarItems.findIndex((navbarItem) =>
        navbarItemContract.labelPattern.test(navbarItem.labelValue ?? "")
    );

    if (index === -1) {
        return null;
    }

    const item = navbarItems[index];

    return item === undefined ? null : { index, item };
};

/**
 * Validate structured Docusaurus config expectations.
 *
 * @param {string} rootDirectoryPath
 * @param {DocusaurusConfigContract} docusaurusConfigContract
 *
 * @returns {Promise<ContractViolation[]>}
 */
const validateDocusaurusConfigContract = async (
    rootDirectoryPath,
    docusaurusConfigContract
) => {
    const absoluteFilePath = resolveFromRoot(
        rootDirectoryPath,
        docusaurusConfigContract.path
    );
    const violations = [];

    if (!(await fileExists(absoluteFilePath))) {
        return [
            createViolation(
                "config-file-missing",
                absoluteFilePath,
                `Docusaurus config '${docusaurusConfigContract.path}' is missing.`
            ),
        ];
    }

    const parsedConfig = await parseDocusaurusConfig(
        absoluteFilePath,
        docusaurusConfigContract.variableName ?? "config"
    );

    if (parsedConfig === null) {
        return [
            createViolation(
                "config-parse-failed",
                absoluteFilePath,
                `Could not find an object literal initializer for '${docusaurusConfigContract.variableName ?? "config"}'.`
            ),
        ];
    }

    for (const propertyName of docusaurusConfigContract.requiredTopLevelProperties ??
        []) {
        if (!parsedConfig.topLevelPropertyNames.includes(propertyName)) {
            violations.push(
                createViolation(
                    "config-property-missing",
                    absoluteFilePath,
                    `Docusaurus config must define top-level property '${propertyName}'.`
                )
            );
        }
    }

    for (const requiredPluginName of docusaurusConfigContract.requiredPluginNames ??
        []) {
        if (!parsedConfig.pluginNames.includes(requiredPluginName)) {
            violations.push(
                createViolation(
                    "config-plugin-missing",
                    absoluteFilePath,
                    `Docusaurus config must include plugin '${requiredPluginName}'.`
                )
            );
        }
    }

    for (const requiredThemeName of docusaurusConfigContract.requiredThemeNames ??
        []) {
        if (!parsedConfig.themeNames.includes(requiredThemeName)) {
            violations.push(
                createViolation(
                    "config-theme-missing",
                    absoluteFilePath,
                    `Docusaurus config must include theme '${requiredThemeName}'.`
                )
            );
        }
    }

    for (const requiredIdentifier of docusaurusConfigContract.requiredClientModuleIdentifiers ??
        []) {
        if (
            !parsedConfig.clientModuleIdentifiers.includes(requiredIdentifier)
        ) {
            violations.push(
                createViolation(
                    "config-client-module-missing",
                    absoluteFilePath,
                    `Docusaurus config must reference client module identifier '${requiredIdentifier}'.`
                )
            );
        }
    }

    if (
        docusaurusConfigContract.requireFavicon &&
        (parsedConfig.faviconValue === null ||
            parsedConfig.faviconValue.length === 0)
    ) {
        violations.push(
            createViolation(
                "config-favicon-missing",
                absoluteFilePath,
                "Docusaurus config must define a favicon."
            )
        );
    }

    if (
        docusaurusConfigContract.requireThemeImage &&
        (parsedConfig.themeImageValue === null ||
            parsedConfig.themeImageValue.length === 0)
    ) {
        violations.push(
            createViolation(
                "config-theme-image-missing",
                absoluteFilePath,
                "Docusaurus themeConfig must define a social/share image."
            )
        );
    }

    if (
        docusaurusConfigContract.navbar?.requireLogo &&
        !parsedConfig.hasNavbarLogo
    ) {
        violations.push(
            createViolation(
                "navbar-logo-missing",
                absoluteFilePath,
                "Navbar must define a logo block."
            )
        );
    }

    if (
        docusaurusConfigContract.footer?.requireLogo &&
        !parsedConfig.hasFooterLogo
    ) {
        violations.push(
            createViolation(
                "footer-logo-missing",
                absoluteFilePath,
                "Footer must define a logo block."
            )
        );
    }

    if (docusaurusConfigContract.navbar !== undefined) {
        let lastMatchedNavbarIndex = -1;

        for (const navbarItemContract of docusaurusConfigContract.navbar
            .orderedItems) {
            const matchedNavbarItem = findNavbarItemByLabel(
                parsedConfig.navbarItems,
                navbarItemContract
            );

            if (matchedNavbarItem === null) {
                violations.push(
                    createViolation(
                        "navbar-item-missing",
                        absoluteFilePath,
                        `Navbar must include an item whose label matches ${navbarItemContract.labelPattern.toString()}.`
                    )
                );
                continue;
            }

            if (
                !navbarItemMatchesContract(
                    matchedNavbarItem.item,
                    navbarItemContract
                )
            ) {
                violations.push(
                    createViolation(
                        "navbar-item-property-mismatch",
                        absoluteFilePath,
                        `Navbar item ${JSON.stringify(matchedNavbarItem.item.labelValue ?? "<unknown>")} does not satisfy the contract for ${navbarItemContract.labelPattern.toString()}.`
                    )
                );
            }

            if (matchedNavbarItem.index < lastMatchedNavbarIndex) {
                violations.push(
                    createViolation(
                        "navbar-item-order-violation",
                        absoluteFilePath,
                        `Navbar item ${navbarItemContract.labelPattern.toString()} appears out of the required order.`
                    )
                );
            }

            lastMatchedNavbarIndex = Math.max(
                lastMatchedNavbarIndex,
                matchedNavbarItem.index
            );
        }
    }

    if (docusaurusConfigContract.footer !== undefined) {
        const footerColumns = parsedConfig.footerColumns;
        const minColumns = docusaurusConfigContract.footer.minColumns ?? 0;
        const itemCounts = footerColumns.map((column) => column.itemCount);
        const allFooterItemLabels = footerColumns.flatMap(
            (column) => column.itemLabels
        );

        if (footerColumns.length < minColumns) {
            violations.push(
                createViolation(
                    "footer-columns-missing",
                    absoluteFilePath,
                    `Footer must define at least ${minColumns} column(s); found ${footerColumns.length}.`
                )
            );
        }

        for (const requiredTitle of docusaurusConfigContract.footer
            .requiredTitles ?? []) {
            const hasTitle = footerColumns.some((column) =>
                matchesPatternLike(column.titleValue, requiredTitle)
            );

            if (!hasTitle) {
                violations.push(
                    createViolation(
                        "footer-column-missing",
                        absoluteFilePath,
                        `Footer must include a column title matching ${describePatternLike(requiredTitle)}.`
                    )
                );
            }
        }

        for (const requiredLinkLabel of docusaurusConfigContract.footer
            .requiredLinkLabelPatterns ?? []) {
            const hasFooterLink = allFooterItemLabels.some((itemLabel) =>
                matchesPatternLike(itemLabel, requiredLinkLabel)
            );

            if (!hasFooterLink) {
                violations.push(
                    createViolation(
                        "footer-link-missing",
                        absoluteFilePath,
                        `Footer must include a link label matching ${describePatternLike(requiredLinkLabel)}.`
                    )
                );
            }
        }

        if (itemCounts.length > 1) {
            const maximumCount = Math.max(...itemCounts);
            const minimumCount = Math.min(...itemCounts);
            const allowedDelta =
                docusaurusConfigContract.footer.maxItemCountDelta;

            if (
                allowedDelta !== undefined &&
                maximumCount - minimumCount > allowedDelta
            ) {
                violations.push(
                    createViolation(
                        "footer-balance-violation",
                        absoluteFilePath,
                        `Footer columns must stay within ${allowedDelta} item(s) of each other; saw a delta of ${maximumCount - minimumCount}.`
                    )
                );
            }
        }
    }

    if (docusaurusConfigContract.searchPlugin !== undefined) {
        const requiredSearchThemeName =
            docusaurusConfigContract.searchPlugin.packageName;

        if (!parsedConfig.themeNames.includes(requiredSearchThemeName)) {
            violations.push(
                createViolation(
                    "search-plugin-missing",
                    absoluteFilePath,
                    `Docusaurus config must include search theme '${requiredSearchThemeName}'.`
                )
            );
        }

        for (const [optionName, expectedValue] of Object.entries(
            docusaurusConfigContract.searchPlugin.requiredOptions ?? {}
        )) {
            const actualValue = parsedConfig.searchPluginOptions?.[optionName];

            if (actualValue !== expectedValue) {
                violations.push(
                    createViolation(
                        "search-plugin-option-mismatch",
                        absoluteFilePath,
                        `Search option '${optionName}' must equal ${JSON.stringify(expectedValue)}; found ${JSON.stringify(actualValue)}.`
                    )
                );
            }
        }
    }

    return violations;
};

/**
 * Validate an entire Docusaurus site contract.
 *
 * @param {DocusaurusSiteContract} siteContract
 *
 * @returns {Promise<ContractViolation[]>}
 */
const validateDocusaurusSiteContract = async (siteContract) => {
    const rootDirectoryPath = siteContract.rootDirectoryPath ?? process.cwd();
    const validationTasks = [
        validateRequiredFiles(
            rootDirectoryPath,
            siteContract.requiredFiles ?? []
        ),
        validatePackageJsonContracts(
            rootDirectoryPath,
            siteContract.packageJsonFiles ?? []
        ),
        validateManifestContracts(
            rootDirectoryPath,
            siteContract.manifestFiles ?? []
        ),
        validateSourceFileContracts(
            rootDirectoryPath,
            siteContract.sourceFiles ?? []
        ),
        siteContract.docusaurusConfig === undefined
            ? Promise.resolve([])
            : validateDocusaurusConfigContract(
                  rootDirectoryPath,
                  siteContract.docusaurusConfig
              ),
    ];
    const validationResults = await Promise.all(validationTasks);

    return validationResults
        .flat()
        .toSorted((left, right) =>
            `${left.filePath}:${left.code}`.localeCompare(
                `${right.filePath}:${right.code}`
            )
        );
};

/**
 * Render contract violations as a human-readable report.
 *
 * @param {readonly ContractViolation[]} violations
 * @param {string} rootDirectoryPath
 *
 * @returns {string}
 */
const formatDocusaurusSiteContractViolations = (
    violations,
    rootDirectoryPath
) => {
    if (violations.length === 0) {
        return "✅ Docusaurus site contract satisfied.";
    }

    const lines = [
        `❌ Docusaurus site contract failed with ${violations.length} violation(s):`,
    ];

    for (const violation of violations) {
        lines.push(
            `- [${violation.code}] ${toRelativePath(rootDirectoryPath, violation.filePath)}: ${violation.message}`
        );
    }

    return lines.join("\n");
};

export {
    defineDocusaurusSiteContract,
    formatDocusaurusSiteContractViolations,
    validateDocusaurusSiteContract,
};
