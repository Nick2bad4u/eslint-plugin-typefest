import type * as Legacy from "legacy-type-utils";

type MonitorRecord = Record<"id" | "latencyMs", number | string>;
type UsesNamespaceSetOptional = Legacy.PartialBy<MonitorRecord, "latencyMs">;

declare const usesNamespaceSetOptional: UsesNamespaceSetOptional;

String(usesNamespaceSetOptional);

export const __typedFixtureModule = "typed-fixture-module";
