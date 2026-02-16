import type { AllOrNone } from "legacy-type-utils";

type AuthPairPayload = Record<"password" | "token" | "username", string>;
type ShouldBeSkippedInTestFile = AllOrNone<AuthPairPayload>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
