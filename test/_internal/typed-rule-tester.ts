import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { afterAll, describe, it } from "vitest";

import { repoPath } from "./ruleTester";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe as unknown as typeof RuleTester.describe;
RuleTester.it = it as unknown as typeof RuleTester.it;
RuleTester.itOnly = it as unknown as typeof RuleTester.itOnly;

const typedFixturesRoot = repoPath("test", "fixtures", "typed");

export const typedFixturePath = (...segments: string[]): string =>
    path.join(typedFixturesRoot, ...segments);

export const readTypedFixture = (...segments: string[]): string =>
    readFileSync(typedFixturePath(...segments), "utf8");

export const createTypedRuleTester = (): RuleTester =>
    new RuleTester({
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                projectService: {
                    allowDefaultProject: [
                        "file.ts",
                        "test/fixtures/typed/*.ts",
                        "test/fixtures/typed/tests/*.ts",
                    ],
                    defaultProject: "tsconfig.eslint.json",
                },
                sourceType: "module",
                tsconfigRootDir: repoPath(),
            },
        },
    });

export const typedRuleTester = createTypedRuleTester();
