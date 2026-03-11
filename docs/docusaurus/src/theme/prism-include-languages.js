/**
 * Extend Prism grammars used by Docusaurus code blocks.
 *
 * We add dedicated tokenization for JSDoc tags like `@example`, `@see`, and
 * `@category` inside TypeScript/JavaScript comment blocks so TypeDoc snippets
 * are easier to scan.
 */
const JSDOC_TAG_PATTERN = /(^\s*\*?\s*)@[a-z][\w-]*/im;

/**
 * @param {import("prismjs").GrammarToken | undefined} commentToken
 */
const addJsDocTagToken = (commentToken) => {
    if (typeof commentToken !== "object" || commentToken === null) {
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
 * @param {import("prismjs").Grammar} grammar
 */
const addTagsToGrammarComments = (grammar) => {
    if (!("comment" in grammar)) {
        return;
    }

    const { comment } = grammar;

    if (Array.isArray(comment)) {
        for (const commentToken of comment) {
            addJsDocTagToken(commentToken);
        }

        return;
    }

    addJsDocTagToken(comment);
};

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
