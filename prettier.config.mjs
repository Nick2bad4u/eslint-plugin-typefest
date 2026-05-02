import prettierConfig from "prettier-config-nick2bad4u";

/**
 * @type {import("prettier").Config}
 */
const localConfig = {
    ...prettierConfig,
    // PrintWidth: 100, // your override here
};

export default localConfig;
