import type { SetElement } from "legacy-type-utils";

type MonitorIdSet = Set<string>;
type ShouldBeSkippedInTestFile = SetElement<MonitorIdSet>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
