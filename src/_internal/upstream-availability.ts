/**
 * @packageDocumentation
 * Check the consumer's upstream libraries before recommending newer exports.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import * as path from "node:path";
import { arrayIncludes, isDefined } from "ts-extras";
import ts from "typescript";

import type { TypedRuleContext } from "./typed-rule.js";

/** Upstream API family a rule requires, identified by its first supported major. */
export type UpstreamRequirement = "ts-extras@2" | "type-fest@6";

// Subsequent major releases can remove public exports; enable them after review.
const tsExtrasMajors = [2, 3] as const;
const typeFestMajors = [6] as const;

const fallbackCompilerOptions: ts.CompilerOptions = {
    moduleResolution: ts.ModuleResolutionKind.Bundler,
};

// Rules from the same preset share a parse. Never retain a file between parses.
const availabilityByAst = new WeakMap<
    TSESTree.Program,
    Map<UpstreamRequirement, boolean>
>();

/** A breaking or prerelease version may no longer provide the reviewed export. */
export const supportsUpstreamVersion = (
    requirement: UpstreamRequirement,
    version: string
): boolean =>
    !version.includes("-") &&
    arrayIncludes(
        requirement === "ts-extras@2" ? tsExtrasMajors : typeFestMajors,
        Number.parseInt(version, 10)
    );

/**
 * Resolve from the linted file, respecting project paths and package exports. A
 * path alias or missing package cannot establish the upstream API contract.
 */
export const hasRequiredUpstream = (
    context: TypedRuleContext,
    requirement: UpstreamRequirement
): boolean => {
    const { physicalFilename, sourceCode } = context;
    if (physicalFilename.startsWith("<")) {
        return false;
    }

    let cached = availabilityByAst.get(sourceCode.ast);
    if (!isDefined(cached)) {
        cached = new Map<UpstreamRequirement, boolean>();
        availabilityByAst.set(sourceCode.ast, cached);
    }
    const previous = cached.get(requirement);
    if (isDefined(previous)) {
        return previous;
    }

    const name = requirement === "ts-extras@2" ? "ts-extras" : "type-fest";
    const file = path.resolve(context.cwd, physicalFilename);
    const program = sourceCode.parserServices?.program;
    const { resolvedModule } = ts.resolveModuleName(
        name,
        file,
        program?.getCompilerOptions() ?? fallbackCompilerOptions,
        ts.sys,
        undefined,
        undefined,
        program?.getSourceFile(file)?.impliedNodeFormat
    );
    const id = resolvedModule?.packageId;
    const available =
        id?.name === name && supportsUpstreamVersion(requirement, id.version);
    cached.set(requirement, available);
    return available;
};
