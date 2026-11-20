/**
 * @packageDocumentation
 * Compare the documented coverage decisions with the installed public declarations.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { assertDefined, objectKeys } from "ts-extras";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { typefestRules } from "../src/_internal/rules-registry";
import { typedFixturePath } from "./_internal/typed-rule-tester";

const guide = readFileSync(
    path.resolve("docs/rules/guides/rule-coverage-gap-analysis.md"),
    "utf8"
).replaceAll("\r\n", "\n");
const fixture = typedFixturePath("upstream-latest", "file.ts");
const compareNames = (left: string, right: string): number =>
    left.localeCompare(right);
const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
};

/** Resolve the types condition from the consuming workspace, including subpaths. */
const declarationPath = (
    specifier: string,
    containingFile = fixture
): string => {
    const { resolvedModule } = ts.resolveModuleName(
        specifier,
        containingFile,
        compilerOptions,
        ts.sys,
        undefined,
        undefined,
        ts.ModuleKind.ESNext
    );
    assertDefined(resolvedModule);
    return resolvedModule.resolvedFileName;
};

const latestTypes = declarationPath("type-fest");
const latestGlobals = declarationPath("type-fest/globals");
const latestExtras = declarationPath("ts-extras");

/** Read subpath names from either form of Node's package exports map. */
const publicSubpaths = (declaration: string): readonly string[] => {
    const manifestPath = ts.findConfigFile(
        path.dirname(declaration),
        (name) => ts.sys.fileExists(name),
        "package.json"
    );
    assertDefined(manifestPath);
    const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (
        typeof manifest !== "object" ||
        manifest === null ||
        !("exports" in manifest)
    ) {
        throw new TypeError(`Expected a public exports map in ${manifestPath}`);
    }
    const entries = manifest.exports;
    const subpaths =
        typeof entries === "object" && entries !== null
            ? Object.keys(entries).filter((key) => key.startsWith("."))
            : [];
    return subpaths.length > 0 ? subpaths.toSorted(compareNames) : ["."];
};

const previousTypes = declarationPath(
    "type-fest",
    path.resolve("src/plugin.ts")
);
const program = ts.createProgram(
    [
        latestTypes,
        latestGlobals,
        latestExtras,
        previousTypes,
    ],
    compilerOptions
);
const checker = program.getTypeChecker();

/** Follow star and named re-exports and distinguish value exports from types. */
const exportedNames = (
    entryPoint: string,
    runtime: boolean
): readonly string[] => {
    const file = program.getSourceFile(entryPoint);
    assertDefined(file);
    const module = checker.getSymbolAtLocation(file);
    assertDefined(module);

    return checker
        .getExportsOfModule(module)
        .filter((symbol) => {
            const specifier = symbol.declarations?.find(ts.isExportSpecifier);
            if (specifier && ts.isTypeOnlyExportDeclaration(specifier)) {
                return !runtime;
            }
            const target = specifier
                ? checker.getExportSpecifierLocalTargetSymbol(specifier)
                : symbol;
            assertDefined(target);
            return (target.valueDeclaration !== undefined) === runtime;
        })
        .map((symbol) => symbol.getName());
};

/** Read the rows of a single public module's decision table. */
const documentedRows = (heading: string) => {
    const section = guide
        .split(/^## /mv)
        .find((part) => part.startsWith(`${heading}\n`));
    assertDefined(section);
    return Array.from(
        section.matchAll(
            /^\| *`(?<name>\w+)` *\| *(?<decision>\w+) *\|(?<explanation>[^\n]+)\|$/gmv
        ),
        (match) => {
            const { decision, explanation, name } = match.groups ?? {};
            assertDefined(name);
            assertDefined(decision);
            assertDefined(explanation);
            const ruleLinks = Array.from(
                explanation.matchAll(
                    /\[(?<rule>prefer-[\w\-]+)\]\(\.\.\/\k<rule>\.md\)/gv
                ),
                (link) => {
                    const rule = link.groups?.["rule"];
                    assertDefined(rule);
                    return rule;
                }
            );
            return {
                decision,
                explanation: explanation.trim(),
                name,
                ruleLinks,
            };
        }
    );
};

const latestNames = exportedNames(latestTypes, false);
const sections = [
    {
        heading: "Former type-fest exports",
        names: exportedNames(previousTypes, false).filter(
            (name) => !latestNames.includes(name)
        ),
    },
    { heading: "Root type exports from type-fest", names: latestNames },
    {
        heading: "Runtime exports from ts-extras",
        names: exportedNames(latestExtras, true),
    },
    {
        heading: "Type exports from ts-extras",
        names: exportedNames(latestExtras, false),
    },
    {
        heading: "Type exports from type-fest/globals",
        names: exportedNames(latestGlobals, false),
    },
] as const;

describe("public API coverage decisions", () => {
    it("accounts for every exported entry point and checks the type-only modules", () => {
        expect.hasAssertions();
        expect(publicSubpaths(latestTypes)).toStrictEqual([".", "./globals"]);
        expect(publicSubpaths(latestExtras)).toStrictEqual(["."]);
        expect(exportedNames(latestTypes, true)).toStrictEqual([]);
        expect(exportedNames(latestGlobals, true)).toStrictEqual([]);
    });

    it.each(sections)(
        "accounts for every name exactly once in $heading",
        ({ heading, names }) => {
            expect.hasAssertions();

            const rows = documentedRows(heading);

            expect(
                rows.map(({ name }) => name).toSorted(compareNames)
            ).toStrictEqual(names.toSorted(compareNames));
        }
    );

    it("links every covered or migrated export to registered rules and explains exclusions", () => {
        expect.hasAssertions();

        const rows = sections.flatMap(({ heading }) => documentedRows(heading));
        const recommendations = rows.filter(
            ({ decision }) => decision !== "Excluded"
        );
        const documentedRules = new Set(
            recommendations.flatMap(({ ruleLinks }) => ruleLinks)
        );

        expect(
            rows.filter(
                ({ decision }) =>
                    ![
                        "Covered",
                        "Excluded",
                        "Migration",
                    ].includes(decision)
            )
        ).toStrictEqual([]);
        expect(
            rows.filter(({ explanation }) => explanation.length === 0)
        ).toStrictEqual([]);
        expect(
            recommendations.filter(({ ruleLinks }) => ruleLinks.length === 0)
        ).toStrictEqual([]);
        expect(
            Array.from(documentedRules).toSorted(compareNames)
        ).toStrictEqual(objectKeys(typefestRules).toSorted(compareNames));
    });
});
