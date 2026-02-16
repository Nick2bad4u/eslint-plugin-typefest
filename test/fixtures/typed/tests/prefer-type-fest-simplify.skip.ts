import type { Expand } from "type-fest";

interface UserProfile {
    readonly id: string;
}

type ShouldBeSkippedInTestFile = Expand<UserProfile>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
