#!/usr/bin/env node

/**
 * Keep `peerDependencies.eslint` aligned with the currently installed
 * `devDependencies.eslint` upper range.
 *
 * Why: npm does not support `$eslint` indirection in `peerDependencies` (that
 * syntax is supported for `overrides` only), so we synchronize the top-end
 * range explicitly after dependency updates.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url)
);
const minimumSupportedEslintRange = "^9.0.0";

/**
 * Read and parse package.json.
 *
 * @returns {Promise<Record<string, unknown>>}
 */
const readPackageJson = async () => {
    const packageJsonContent = await readFile(packageJsonPath, "utf8");
    return JSON.parse(packageJsonContent);
};

/**
 * Resolve a floor range from an existing peer range when possible. Falls back
 * to repository baseline.
 *
 * @param {unknown} existingPeerRange
 *
 * @returns {string}
 */
const resolvePeerFloorRange = (existingPeerRange) => {
    if (typeof existingPeerRange !== "string") {
        return minimumSupportedEslintRange;
    }

    const [floorCandidate] = existingPeerRange
        .split("||")
        .map((part) => part.trim());

    if (!floorCandidate) {
        return minimumSupportedEslintRange;
    }

    return floorCandidate;
};

/**
 * Check whether an unknown runtime value is a non-null object record.
 *
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
const isRecord = (value) => typeof value === "object" && value !== null;

const main = async () => {
    const packageJson = await readPackageJson();

    const devDependencies = packageJson.devDependencies;
    const peerDependencies = packageJson.peerDependencies;

    if (!isRecord(devDependencies) || !isRecord(peerDependencies)) {
        throw new TypeError(
            "Expected package.json to include object-valued devDependencies and peerDependencies"
        );
    }

    const devDependencyEslintRange = devDependencies.eslint;

    if (
        typeof devDependencyEslintRange !== "string" ||
        devDependencyEslintRange.trim().length === 0
    ) {
        throw new TypeError(
            "Expected devDependencies.eslint to be a non-empty string range"
        );
    }

    const peerFloorRange = resolvePeerFloorRange(peerDependencies.eslint);
    const nextPeerEslintRange = `${peerFloorRange} || ${devDependencyEslintRange}`;

    if (peerDependencies.eslint === nextPeerEslintRange) {
        console.log(
            `peerDependencies.eslint already aligned: ${nextPeerEslintRange}`
        );
        return;
    }

    peerDependencies.eslint = nextPeerEslintRange;

    await writeFile(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 4)}\n`,
        "utf8"
    );

    console.log(`Updated peerDependencies.eslint to: ${nextPeerEslintRange}`);
};

await main();
