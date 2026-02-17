import type { ReadonlyBy } from "legacy-type-utils";

type MonitorByAlias = ReadonlyBy<MonitorPayload, "intervalSeconds">;

interface MonitorPayload {
    endpoint: string;
    intervalSeconds: number;
}

declare const monitorByAlias: MonitorByAlias;

String(monitorByAlias);

export const __typedFixtureModule = "typed-fixture-module";
