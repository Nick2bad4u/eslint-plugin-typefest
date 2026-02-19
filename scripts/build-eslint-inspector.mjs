#!/usr/bin/env node

/**
 * Build a static ESLint Config Inspector and place it under Docusaurus static
 * assets.
 *
 * @remarks
 * `@eslint/config-inspector build` outputs a Nuxt SPA with root-absolute asset
 * paths (`/_nuxt/...`). Those break when hosted under a subpath like
 * `/eslint-plugin-typefest/eslint-inspector/`, so this script rewrites relevant
 * HTML references to relative paths.
 */

import { execSync } from "node:child_process";
import {
    cp,
    mkdir,
    readdir,
    readFile,
    rm,
    stat,
    writeFile,
} from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptFilePath = fileURLToPath(import.meta.url);
const scriptDirectoryPath = dirname(scriptFilePath);
const repositoryRootPath = resolve(scriptDirectoryPath, "..");

const inspectorBuildOutputDirectoryPath = resolve(
    repositoryRootPath,
    ".eslint-config-inspector"
);

const inspectorStaticTargetDirectoryPath = resolve(
    repositoryRootPath,
    "docs",
    "docusaurus",
    "static",
    "eslint-inspector"
);

/**
 * @param {string} content
 *
 * @returns {string}
 */
const rewriteInspectorHtmlContent = (content) =>
    content
        .replaceAll('="/_nuxt/', '="./_nuxt/')
        .replaceAll("='/_nuxt/", "='./_nuxt/")
        .replaceAll('="/favicon', '="./favicon')
        .replaceAll("='/favicon", "='./favicon")
        .replaceAll('="/api/', '="./api/')
        .replaceAll("='/api/", "='./api/")
        .replaceAll('buildAssetsDir:"/_nuxt/"', 'buildAssetsDir:"./_nuxt/"')
        .replaceAll('baseURL:"/"', 'baseURL:"./"');

/**
 * @param {string} directoryPath
 *
 * @returns {Promise<void>}
 */
const ensureDirectoryExists = async (directoryPath) => {
    const directoryStats = await stat(directoryPath);

    if (!directoryStats.isDirectory()) {
        throw new Error(`Expected a directory at: ${directoryPath}`);
    }
};

const buildInspectorStaticSite = () => {
    console.log("[eslint-inspector] Building static inspector...");

    execSync("npx @eslint/config-inspector@latest build", {
        cwd: repositoryRootPath,
        stdio: "inherit",
    });
};

const copyBuildOutputToDocusaurusStatic = async () => {
    await ensureDirectoryExists(inspectorBuildOutputDirectoryPath);
    await rm(inspectorStaticTargetDirectoryPath, {
        force: true,
        recursive: true,
    });
    await mkdir(inspectorStaticTargetDirectoryPath, { recursive: true });

    await cp(
        inspectorBuildOutputDirectoryPath,
        inspectorStaticTargetDirectoryPath,
        {
            force: true,
            recursive: true,
        }
    );
};

const rewriteGeneratedHtmlFiles = async () => {
    const topLevelEntries = await readdir(inspectorStaticTargetDirectoryPath);
    const htmlFileNames = topLevelEntries.filter(
        (entryName) => extname(entryName).toLowerCase() === ".html"
    );

    await Promise.all(
        htmlFileNames.map(async (htmlFileName) => {
            const htmlFilePath = resolve(
                inspectorStaticTargetDirectoryPath,
                htmlFileName
            );

            const sourceContent = await readFile(htmlFilePath, "utf8");
            const rewrittenContent = rewriteInspectorHtmlContent(sourceContent);

            if (rewrittenContent !== sourceContent) {
                await writeFile(htmlFilePath, rewrittenContent, "utf8");
            }
        })
    );
};

const cleanIntermediateBuildOutput = async () => {
    await rm(inspectorBuildOutputDirectoryPath, {
        force: true,
        recursive: true,
    });
};

const main = async () => {
    buildInspectorStaticSite();
    await copyBuildOutputToDocusaurusStatic();
    await rewriteGeneratedHtmlFiles();
    await cleanIntermediateBuildOutput();

    console.log("[eslint-inspector] Static build ready at:");
    console.log(`  ${inspectorStaticTargetDirectoryPath}`);
    console.log("[eslint-inspector] Public URL after docs deploy:");
    console.log("  /eslint-inspector/");
};

await main().catch((error) => {
    const message =
        error instanceof Error ? (error.stack ?? error.message) : String(error);

    console.error("[eslint-inspector] Build failed.");
    console.error(message);
    process.exitCode = 1;
});

export {
    buildInspectorStaticSite,
    cleanIntermediateBuildOutput,
    copyBuildOutputToDocusaurusStatic,
    rewriteGeneratedHtmlFiles,
};
