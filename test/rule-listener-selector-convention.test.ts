/**
 * @packageDocumentation
 * Contract test that discourages broad listeners where selector listeners are
 * trivial and more precise.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const broadListenerNodeKinds = [
    "CallExpression",
    "MemberExpression",
    "TSTypeReference",
] as const;

const selectorConventionExceptionTag = "selector-convention-exception";

const getRuleSourceFilePaths = (): readonly string[] => {
    const rulesDirectory = path.join(process.cwd(), "src", "rules");

    return fs
        .readdirSync(rulesDirectory)
        .filter((entry) => entry.endsWith(".ts"))
        .map((entry) => path.join(rulesDirectory, entry))
        .toSorted((left, right) => left.localeCompare(right));
};

const getBroadListenerViolationsForFile = (
    filePath: string
): readonly string[] => {
    const sourceText = fs.readFileSync(filePath, "utf8");
    const sourceLines = sourceText.split(/\r?\n/v);

    const violations: string[] = [];

    for (const [lineIndex, line] of sourceLines.entries()) {
        const trimmedLine = line.trimStart();
        const matchedNodeKind = broadListenerNodeKinds.find((nodeKind) =>
            trimmedLine.startsWith(`${nodeKind}(`)
        );

        if (matchedNodeKind !== undefined) {
            const previousLine = sourceLines[lineIndex - 1] ?? "";

            if (!previousLine.includes(selectorConventionExceptionTag)) {
                const relativeFilePath = path
                    .relative(process.cwd(), filePath)
                    .replaceAll("\\\\", "/");

                violations.push(
                    `${relativeFilePath}:${lineIndex + 1} uses broad '${matchedNodeKind}(...)' listener method; prefer selector keys like '${matchedNodeKind}[...]'. If broad matching is required, add a previous-line comment containing '${selectorConventionExceptionTag}' with a reason.`
                );
            }
        }
    }

    return violations;
};

describe("rule listener selector conventions", () => {
    it("avoids broad listeners for trivially selector-safe node kinds", () => {
        const violations = getRuleSourceFilePaths().flatMap((filePath) =>
            getBroadListenerViolationsForFile(filePath)
        );

        expect(violations).toStrictEqual([]);
    });
});
