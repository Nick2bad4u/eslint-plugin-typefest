/**
 * Extend Prism grammars used by Docusaurus code blocks.
 *
 * We add dedicated tokenization for JSDoc tags like `@example`, `@see`, and
 * `@category` inside TypeScript/JavaScript comment blocks so TypeDoc snippets
 * are easier to scan.
 */
const JSDOC_TAG_PATTERN = /(^\s*\*?\s*)@[a-z][\w-]*/im;
const COMMENT_TOKEN_NAMES = ["comment", "doc-comment"];

/**
 * @param {import("prismjs").GrammarValue | undefined} grammarValue
 *
 * @returns {grammarValue is import("prismjs").TokenObject}
 */
const isTokenObject = (grammarValue) => {
    if (typeof grammarValue !== "object" || grammarValue === null) {
        return false;
    }

    if (grammarValue instanceof RegExp || Array.isArray(grammarValue)) {
        return false;
    }

    return "pattern" in grammarValue;
};

/**
 * @param {import("prismjs").GrammarValue | undefined} commentToken
 */
const addJsDocTagToken = (commentToken) => {
    if (!isTokenObject(commentToken)) {
        return;
    }

    const existingInside =
        typeof commentToken.inside === "object" && commentToken.inside !== null
            ? commentToken.inside
            : {};

    if (Object.hasOwn(existingInside, "jsdoc-tag")) {
        return;
    }

    commentToken.inside = {
        "jsdoc-tag": {
            alias: "keyword",
            lookbehind: true,
            pattern: JSDOC_TAG_PATTERN,
        },
        ...existingInside,
    };
};

/**
 * @param {import("prismjs").GrammarValue | undefined} grammarToken
 */
const addTagsToGrammarToken = (grammarToken) => {
    if (grammarToken === undefined) {
        return;
    }

    if (Array.isArray(grammarToken)) {
        for (const commentToken of grammarToken) {
            if (commentToken instanceof RegExp) {
                continue;
            }

            addJsDocTagToken(commentToken);
        }

        return;
    }

    if (grammarToken instanceof RegExp) {
        return;
    }

    addJsDocTagToken(grammarToken);
};

/**
 * @param {import("prismjs").Grammar} grammar
 */
const addTagsToGrammarComments = (grammar) => {
    /**
     * Prism's Grammar type includes GrammarRest without an index signature. We
     * intentionally use string token names for extension tokens.
     *
     * @type {Record<string, import("prismjs").GrammarValue | undefined>}
     */
    const grammarEntries = /** @type {Record<
    string,
    import("prismjs").GrammarValue | undefined
>} */ (/** @type {unknown} */ (grammar));

    for (const commentTokenName of COMMENT_TOKEN_NAMES) {
        if (!(commentTokenName in grammar)) {
            continue;
        }

        addTagsToGrammarToken(grammarEntries[commentTokenName]);
    }
};

/** @param {typeof import("prismjs")} PrismObject */
module.exports = function prismIncludeLanguages(PrismObject) {
    const languageNames = [
        "javascript",
        "jsx",
        "typescript",
        "tsx",
    ];

    for (const languageName of languageNames) {
        const grammar = PrismObject.languages[languageName];

        if (grammar === undefined) {
            continue;
        }

        addTagsToGrammarComments(grammar);
    }

    return PrismObject;
};
