import { tmpdir } from "node:os";
import * as path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { createTypedRule } from "../../src/_internal/typed-rule";
import { supportsUpstreamVersion } from "../../src/_internal/upstream-availability";
import { createRuleTester, repoPath } from "./ruleTester";
import { typedFixturePath } from "./typed-rule-tester";

const latestFile = typedFixturePath("upstream-latest", "file.ts");
const shadowedProgram = ts.createProgram([latestFile], {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noLib: true,
    paths: { "ts-extras": [latestFile], "type-fest": [latestFile] },
    types: [],
});

/**
 * A diagnostic-only probe exercises the same per-file guard as a real rule. The
 * repository and the nested workspace install different library majors.
 */
for (const requiresUpstream of ["ts-extras@2", "type-fest@6"] as const) {
    const rule = createTypedRule({
        create(context) {
            return {
                Program(node) {
                    context.report({ messageId: "available", node });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description: "test upstream availability for rule creation",
                requiresUpstream,
            },
            messages: { available: "The requested upstream is installed." },
            schema: [],
            type: "suggestion",
        },
        name: "upstream-probe",
    });

    createRuleTester().run(requiresUpstream, rule, {
        invalid: [
            {
                code: "export {};",
                errors: [{ messageId: "available" }],
                filename: latestFile,
            },
        ],
        valid: [
            {
                code: "export {};",
                filename: repoPath("test", "old-upstream.ts"),
                name: "an older upstream version",
            },
            {
                code: "export {};",
                filename: path.join(tmpdir(), "no-library", "file.ts"),
                name: "no upstream package",
            },
            {
                code: "export {};",
                filename: latestFile,
                languageOptions: {
                    parserOptions: { programs: [shadowedProgram] },
                },
                name: "a local path alias hides the installed package",
            },
        ],
    });
}

describe("reviewed upstream majors", () => {
    it.each([
        [
            "ts-extras@2",
            "2.0.0",
            true,
        ],
        [
            "ts-extras@2",
            "3.0.0",
            true,
        ],
        [
            "ts-extras@2",
            "4.0.0",
            false,
        ],
        [
            "type-fest@6",
            "6.0.0-beta.1",
            false,
        ],
        [
            "type-fest@6",
            "6.0.3",
            true,
        ],
        [
            "type-fest@6",
            "7.0.0",
            false,
        ],
    ] as const)("checks %s against %s", (requirement, version, supported) => {
        expect.hasAssertions();
        expect(supportsUpstreamVersion(requirement, version)).toBe(supported);
    });
});
