import type { IfAny } from "legacy-type-utils";

type ShouldBeSkippedInTestFile = IfAny<unknown, "yes", "no">;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
