import nick2bad4u from "eslint-config-nick2bad4u";

import typefest from "./plugin.mjs";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nick2bad4u.configs.withoutTypefest,

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{ts,tsx,mts,cts}"],
        name: "Local Typefest",
        plugins: {
            "typefest": typefest,
        },
        rules: {
            // @ts-expect-error -- plugin.mjs is typed as generic ESLint.Plugin.
            ...typefest.configs.experimental.rules,
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;
