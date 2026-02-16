import type { ReadonlyTuple } from "legacy-type-utils";

type MonitorTuple = ReadonlyTuple<string, 3>;

declare const monitorTuple: MonitorTuple;

String(monitorTuple);

export const __typedFixtureModule = "typed-fixture-module";
