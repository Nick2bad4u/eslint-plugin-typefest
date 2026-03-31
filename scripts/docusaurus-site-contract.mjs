/**
 * @packageDocumentation
 * Compatibility wrapper that re-exports the workspace-owned Docusaurus site
 * contract package.
 */

import {
    defineDocusaurusSiteContract as defineDocusaurusSiteContractFromPackage,
    formatDocusaurusSiteContractViolations as formatDocusaurusSiteContractViolationsFromPackage,
    validateDocusaurusSiteContract as validateDocusaurusSiteContractFromPackage,
} from "../packages/docusaurus-site-contract/index.mjs";

/**
 * @param {import("../packages/docusaurus-site-contract/index.mjs").DocusaurusSiteContract} siteContract
 */
const defineDocusaurusSiteContract = (siteContract) =>
    defineDocusaurusSiteContractFromPackage(siteContract);

/**
 * @param {readonly import("../packages/docusaurus-site-contract/index.mjs").ContractViolation[]} violations
 * @param {string} rootDirectoryPath
 */
const formatDocusaurusSiteContractViolations = (
    violations,
    rootDirectoryPath
) =>
    formatDocusaurusSiteContractViolationsFromPackage(
        violations,
        rootDirectoryPath
    );

/**
 * @param {import("../packages/docusaurus-site-contract/index.mjs").DocusaurusSiteContract} siteContract
 */
const validateDocusaurusSiteContract = async (siteContract) =>
    validateDocusaurusSiteContractFromPackage(siteContract);

export {
    defineDocusaurusSiteContract,
    formatDocusaurusSiteContractViolations,
    validateDocusaurusSiteContract,
};
