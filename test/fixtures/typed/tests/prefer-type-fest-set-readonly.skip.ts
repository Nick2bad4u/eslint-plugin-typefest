import type { ReadonlyBy } from "legacy-type-utils";

interface MonitorPayload {
    endpoint: string;
    intervalSeconds: number;
}

type MonitorShouldSkip = ReadonlyBy<MonitorPayload, "intervalSeconds">;

declare const monitorShouldSkip: MonitorShouldSkip;

String(monitorShouldSkip);

export const __typedFixtureModule = "typed-fixture-module";
