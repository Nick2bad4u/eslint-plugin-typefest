#!/usr/bin/env node

/**
 * Documentation link checker.
 *
 * Scans Markdown content within the docs directory and verifies that relative
 * links resolve to existing files or directories. External links (http, https,
 * mailto, etc.) are ignored. Fails with a non-zero exit code when broken links
 * are detected so CI can block the offending changes early.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = dirname(currentFilePath);
const ROOT_DIRECTORY = resolve(currentDirectoryPath, "..");

const DOCS_DIRECTORIES = [
    "docs/rules",
    "docs/docusaurus/site-docs",
    "docs/docusaurus/src/pages",
];

const IGNORED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    ".docusaurus",
    "build",
    "dist",
    ".vite",
    "coverage",
]);

const LINK_PATTERN = /!?\[[^\]]*]\(([^)]+)\)/g;

const EXTERNAL_PROTOCOLS = [
    "http:",
    "https:",
    "mailto:",
    "tel:",
    "data:",
    "javascript:",
    "vscode:",
    "file:",
];

const LEADING_BANG = /^!/;

/**
 * @param {string} entryPath
 *
 * @returns {Promise<boolean>}
 */
async function isDirectory(entryPath) {
    try {
        const entryStat = await stat(entryPath);
        return entryStat.isDirectory();
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return false;
        }
        throw error;
    }
}

/**
 * @param {string} startDirectory
 *
 * @returns {Promise<string[]>}
 */
async function collectMarkdownFiles(startDirectory) {
    const results = [];
    const stack = [startDirectory];

    while (stack.length > 0) {
        const current = stack.pop();
        if (current === undefined) {
            // This should not happen due to the loop condition, but added for safety in JS
            continue;
        }
        const entries = await readdir(current, { withFileTypes: true });

        for (const entry of entries) {
            const entryName = entry.name;

            if (IGNORED_DIRECTORIES.has(entryName)) {
                continue;
            }

            const entryPath = join(current, entryName);

            if (entry.isDirectory()) {
                stack.push(entryPath);
                continue;
            }

            if (
                entry.isFile() &&
                [".md", ".mdx"].includes(extname(entryName).toLowerCase())
            ) {
                results.push(entryPath);
            }
        }
    }

    return results;
}

/**
 * @param {string} link
 */
function isExternalLink(link) {
    return EXTERNAL_PROTOCOLS.some((protocol) =>
        link.toLowerCase().startsWith(protocol)
    );
}

/**
 * @param {string} link
 */
function isAnchor(link) {
    return link.startsWith("#");
}

/**
 * @param {string} rawLink
 *
 * @returns {string}
 */
function normalizeLink(rawLink) {
    const [pathPart] = rawLink.split("#");
    if (!pathPart) return "";

    const [cleanPath] = pathPart.split("?");
    if (!cleanPath) return "";

    return cleanPath.trim();
}

/**
 * @param {string} pathToCheck
 *
 * @returns {Promise<boolean>}
 */
const pathExists = async (pathToCheck) => {
    try {
        await stat(pathToCheck);
        return true;
    } catch {
        return false;
    }
};

/**
 * @param {string} markdownPath
 * @param {string} normalizedLink
 *
 * @returns {string[]}
 */
const getPathCandidates = (markdownPath, normalizedLink) => {
    const markdownDirectoryPath = dirname(markdownPath);
    const basePath = resolve(markdownDirectoryPath, normalizedLink);
    const hasKnownExtension = [
        ".md",
        ".mdx",
        ".html",
    ].includes(extname(basePath).toLowerCase());

    if (hasKnownExtension) {
        return [basePath];
    }

    return [
        basePath,
        `${basePath}.md`,
        `${basePath}.mdx`,
        resolve(basePath, "index.md"),
        resolve(basePath, "index.mdx"),
        resolve(basePath, "README.md"),
    ];
};

/**
 * @param {string} markdownPath
 * @param {string} link
 * @param {{ file: string; link: string; resolvedPath: string }[]} issues
 */
async function validateLink(markdownPath, link, issues) {
    const normalized = normalizeLink(link);

    if (normalized.length === 0) {
        return;
    }

    if (isAnchor(normalized) || isExternalLink(normalized)) {
        return;
    }

    // Docusaurus route links like /docs/getting-started are app routes, not
    // file-system paths. We intentionally do not validate them here.
    if (normalized.startsWith("/")) {
        return;
    }

    const pathCandidates = getPathCandidates(markdownPath, normalized);

    for (const candidatePath of pathCandidates) {
        if (await pathExists(candidatePath)) {
            return;
        }
    }

    issues.push({
        file: markdownPath,
        link,
        resolvedPath: pathCandidates[0] ?? normalized,
    });
}

/**
 * @param {string} markdownPath
 * @param {{ file: string; link: string; resolvedPath: string }[]} issues
 */
async function checkFile(markdownPath, issues) {
    const content = await readFile(markdownPath, "utf8");

    // Skip fenced code blocks so examples don't produce false positives.
    const contentWithoutCodeBlocks = content.replaceAll(/```[\s\S]*?```/g, "");
    const matches = Array.from(contentWithoutCodeBlocks.matchAll(LINK_PATTERN));

    for (const match of matches) {
        const fullMatch = match[0];
        const link = match[1];

        if (LEADING_BANG.test(fullMatch)) {
            continue;
        }

        if (link) {
            await validateLink(markdownPath, link, issues);
        }
    }
}

/**
 * Scan documentation markdown files for broken local links.
 *
 * @returns {Promise<void>} Resolves after reporting any link issues.
 */
async function main() {
    /**
     * @type {{ file: string; link: string; resolvedPath: string }[]}
     */
    const issues = [];

    for (const directory of DOCS_DIRECTORIES) {
        const absoluteDirectory = resolve(ROOT_DIRECTORY, directory);

        if (!(await isDirectory(absoluteDirectory))) {
            continue;
        }

        const markdownFiles = await collectMarkdownFiles(absoluteDirectory);

        await Promise.all(markdownFiles.map((file) => checkFile(file, issues)));
    }

    if (issues.length > 0) {
        console.error("Broken documentation links detected:\n");
        for (const issue of issues) {
            console.error(
                `• ${issue.file} -> ${issue.link} (resolved path: ${issue.resolvedPath})`
            );
        }
        console.error(
            `\nTotal broken links: ${issues.length}. Please fix the links above.`
        );
        process.exit(1);
    }

    console.log("Documentation link check passed – no broken links found.");
}

try {
    await main();
} catch (error) {
    console.error(
        "Documentation link check failed due to an unexpected error."
    );
    console.error(error);
    process.exit(1);
}
