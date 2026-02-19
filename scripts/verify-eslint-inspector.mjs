#!/usr/bin/env node

/**
 * Verify ESLint Config Inspector integration for this repository.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptFilePath = fileURLToPath(import.meta.url);
const scriptDirectoryPath = dirname(scriptFilePath);
const repositoryRootPath = resolve(scriptDirectoryPath, "..");

const rootPackagePath = join(repositoryRootPath, "package.json");
const docsWorkspacePackagePath = join(
    repositoryRootPath,
    "docs",
    "docusaurus",
    "package.json"
);
const staticInspectorDirectoryPath = join(
    repositoryRootPath,
    "docs",
    "docusaurus",
    "static",
    "eslint-inspector"
);
const staticInspectorIndexPath = join(
    staticInspectorDirectoryPath,
    "index.html"
);

/**
 * @param {string} filePath
 *
 * @returns {Promise<boolean>}
 */
const pathExists = async (filePath) => {
    try {
        await stat(filePath);
        return true;
    } catch {
        return false;
    }
};

/**
 * @param {string} packagePath
 *
 * @returns {Promise<Record<string, string>>}
 */
const readScriptsFromPackage = async (packagePath) => {
    const packageText = await readFile(packagePath, "utf8");
    const packageJson = JSON.parse(packageText);

    if (!packageJson || typeof packageJson !== "object") {
        return {};
    }

    const scripts = Reflect.get(packageJson, "scripts");
    if (!scripts || typeof scripts !== "object") {
        return {};
    }

    return /** @type {Record<string, string>} */ (scripts);
};

/**
 * @param {string} title
 */
const printSectionTitle = (title) => {
    console.log(`\n${title}`);
};

const verifyESLintInspectorDeployment = async () => {
    let hasFailure = false;

    console.log("🔍 Verifying ESLint Inspector integration...");

    printSectionTitle("📁 Static output checks");

    const staticDirectoryExists = await pathExists(
        staticInspectorDirectoryPath
    );
    if (!staticDirectoryExists) {
        console.log(
            `❌ Missing static directory: ${staticInspectorDirectoryPath}`
        );
        hasFailure = true;
    } else {
        console.log(
            `✅ Static directory exists: ${staticInspectorDirectoryPath}`
        );
    }

    const requiredEntries = [
        "index.html",
        "200.html",
        "404.html",
        "_nuxt",
    ];
    const staticEntries = staticDirectoryExists
        ? new Set(await readdir(staticInspectorDirectoryPath))
        : new Set();

    for (const requiredEntry of requiredEntries) {
        if (staticEntries.has(requiredEntry)) {
            console.log(`✅ Found ${requiredEntry}`);
            continue;
        }

        console.log(`❌ Missing ${requiredEntry}`);
        hasFailure = true;
    }

    printSectionTitle("🧭 Asset path checks");

    if (!(await pathExists(staticInspectorIndexPath))) {
        console.log(`❌ Missing inspector index: ${staticInspectorIndexPath}`);
        hasFailure = true;
    } else {
        const indexContent = await readFile(staticInspectorIndexPath, "utf8");
        const hasRelativeNuxtAssets =
            indexContent.includes('"./_nuxt/') ||
            indexContent.includes("'./_nuxt/");
        const hasAbsoluteNuxtAssets =
            indexContent.includes('"/_nuxt/') ||
            indexContent.includes("'/_nuxt/");

        if (!hasRelativeNuxtAssets) {
            console.log(
                "❌ index.html does not contain relative ./_nuxt asset paths"
            );
            hasFailure = true;
        } else {
            console.log("✅ index.html contains relative ./_nuxt asset paths");
        }

        if (hasAbsoluteNuxtAssets) {
            console.log("❌ index.html still contains root /_nuxt asset paths");
            hasFailure = true;
        } else {
            console.log(
                "✅ index.html does not contain root /_nuxt asset paths"
            );
        }
    }

    printSectionTitle("⚙️ Script wiring checks");

    const rootScripts = await readScriptsFromPackage(rootPackagePath);
    const docsWorkspaceScripts = await readScriptsFromPackage(
        docsWorkspacePackagePath
    );

    if (rootScripts["build:eslint-inspector"]) {
        console.log("✅ Root package.json has build:eslint-inspector");
    } else {
        console.log("❌ Root package.json is missing build:eslint-inspector");
        hasFailure = true;
    }

    if (rootScripts["verify:eslint-inspector"]) {
        console.log("✅ Root package.json has verify:eslint-inspector");
    } else {
        console.log("❌ Root package.json is missing verify:eslint-inspector");
        hasFailure = true;
    }

    const docsBuildScript = docsWorkspaceScripts["build"] ?? "";
    if (
        docsBuildScript.includes("build-eslint-inspector") ||
        docsBuildScript.includes("build:eslint-inspector")
    ) {
        console.log(
            "✅ docs/docusaurus build script triggers inspector static build"
        );
    } else {
        console.log(
            "❌ docs/docusaurus build script does not trigger inspector static build"
        );
        hasFailure = true;
    }

    if (hasFailure) {
        console.log("\n❌ ESLint Inspector verification failed.");
        process.exitCode = 1;
        return;
    }

    console.log("\n🎉 ESLint Inspector verification passed.");
};

await verifyESLintInspectorDeployment().catch((error) => {
    const message =
        error instanceof Error ? (error.stack ?? error.message) : String(error);

    console.error("❌ ESLint Inspector verification crashed.");
    console.error(message);
    process.exitCode = 1;
});

export { verifyESLintInspectorDeployment };
