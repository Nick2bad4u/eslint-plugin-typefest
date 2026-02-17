import type * as Legacy from "legacy-type-utils";

type MonitorByNamespaceAlias = Legacy.ReadonlyBy<
    MonitorPayload,
    "intervalSeconds"
>;

interface MonitorPayload {
    endpoint: string;
    intervalSeconds: number;
}

declare const monitorByNamespaceAlias: MonitorByNamespaceAlias;

String(monitorByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
