import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const typedocPackageJsonPath = require.resolve("typedoc/package.json");
const typedocCliPath = resolve(
    dirname(typedocPackageJsonPath),
    "bin",
    "typedoc"
);

/**
 * Parse a `--config FILE` (or `--options FILE`) argument from CLI args.
 *
 * @param {readonly string[]} cliArgs - Raw process arguments after the script
 *   path.
 *
 * @returns {string} TypeDoc options file name to pass to `typedoc --options`.
 */
function getConfigFileName(cliArgs) {
    for (let index = 0; index < cliArgs.length; index += 1) {
        const argument = cliArgs[index];
        if (argument !== "--config" && argument !== "--options") {
            continue;
        }

        const nextIndex = index + 1;
        if (nextIndex >= cliArgs.length) {
            throw new Error(`Missing value for CLI argument: ${argument}`);
        }

        const nextValue = cliArgs[nextIndex];
        if (typeof nextValue !== "string" || nextValue.length === 0) {
            throw new Error(`Missing value for CLI argument: ${argument}`);
        }

        return nextValue;
    }

    return "typedoc.config.json";
}

/**
 * Resolve the nearest hoisted/local TypeDoc CLI executable by walking up from
 * cwd.
 *
 * @param {string} cwd - Starting directory for lookup.
 *
 * @returns {string} Path to a TypeDoc CLI script.
 */
function resolveTypedocCliFromCwd(cwd) {
    let currentPath = cwd;

    while (true) {
        const candidatePath = resolve(
            currentPath,
            "node_modules",
            "typedoc",
            "bin",
            "typedoc"
        );

        if (existsSync(candidatePath)) {
            return candidatePath;
        }

        const parentPath = dirname(currentPath);

        if (parentPath === currentPath) {
            break;
        }

        currentPath = parentPath;
    }

    return typedocCliPath;
}

/**
 * Execute TypeDoc with the provided options file in a specific working
 * directory.
 *
 * @param {string} cwd - Working directory for the TypeDoc process.
 * @param {string} configFile - TypeDoc options file to pass to `--options`.
 */
function runTypedoc(cwd, configFile) {
    const resolvedTypedocCliPath = resolveTypedocCliFromCwd(cwd);

    execFileSync(
        process.execPath,
        [
            resolvedTypedocCliPath,
            "--options",
            configFile,
        ],
        {
            cwd,
            stdio: "inherit",
        }
    );
}

/**
 * Pick an unused drive letter suitable for a temporary `subst` mapping.
 *
 * @returns {string} Drive letter (without colon).
 */
function getTemporaryDriveLetter() {
    const candidateLetters = [
        "Z",
        "Y",
        "X",
        "W",
        "V",
        "U",
        "T",
        "S",
        "R",
    ];

    for (const letter of candidateLetters) {
        if (!existsSync(`${letter}:\\`)) {
            return letter;
        }
    }

    throw new Error(
        "No free temporary drive letter was found for TypeDoc subst mapping."
    );
}

/**
 * Run TypeDoc from a temporary subst drive to avoid escaped-parentheses path
 * bugs on Windows.
 *
 * @param {string} repositoryRoot - Absolute repository root directory.
 * @param {string} docsWorkspaceRelativePath - Docs workspace relative path from
 *   the repository root.
 * @param {string} configFile - TypeDoc options file name to use.
 */
function runViaTemporaryDrive(
    repositoryRoot,
    docsWorkspaceRelativePath,
    configFile
) {
    const driveLetter = getTemporaryDriveLetter();
    const driveRoot = `${driveLetter}:`;

    execFileSync("subst", [driveRoot, repositoryRoot], {
        stdio: "ignore",
    });

    try {
        const mappedDocsWorkspaceDirectory = resolve(
            `${driveRoot}\\`,
            docsWorkspaceRelativePath
        );
        runTypedoc(mappedDocsWorkspaceDirectory, configFile);
    } finally {
        execFileSync("subst", [driveRoot, "/d"], {
            stdio: "ignore",
        });
    }
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const docsWorkspaceDirectory = resolve(repositoryRoot, "docs", "docusaurus");
const docsWorkspaceRelativePath = relative(
    repositoryRoot,
    docsWorkspaceDirectory
);
const configFile = getConfigFileName(process.argv.slice(2));

if (process.platform === "win32" && /[()]/u.test(repositoryRoot)) {
    runViaTemporaryDrive(repositoryRoot, docsWorkspaceRelativePath, configFile);
} else {
    runTypedoc(docsWorkspaceDirectory, configFile);
}
