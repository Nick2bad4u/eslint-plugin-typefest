const sharedConfig = require("secretlint-config-nick2bad4u/secretlintrc.json");

/**
 * @type {import("@secretlint/types").SecretLintConfigDescriptor}
 */
const secretlintConfig = {
    ...sharedConfig,
    rules: [
        ...sharedConfig.rules,
        // Add project-specific Secretlint rules here.
    ],
};

module.exports = secretlintConfig;
