import tsParser from "@typescript-eslint/parser";

export default [
    {
        ignores: ["node_modules/**", "dist/**"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    },
];
