import type { OneOf } from "legacy-type-utils";

type AuthPayload = Record<"apiKey" | "oauthToken" | "sessionToken", string>;
type ShouldBeSkippedInTestFile = OneOf<AuthPayload>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
