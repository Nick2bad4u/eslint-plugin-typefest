import type { PartialBy } from "legacy-type-utils";

type MonitorRecord = Record<"id" | "latencyMs", number | string>;
type ShouldBeSkippedInTestFile = PartialBy<MonitorRecord, "latencyMs">;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
