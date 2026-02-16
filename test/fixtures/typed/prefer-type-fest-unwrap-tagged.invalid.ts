import type { UnwrapOpaque } from "legacy-type-utils";

type MonitorIdentifier = string & { readonly __opaque__: "MonitorIdentifier" };

type PlainMonitorIdentifier = UnwrapOpaque<MonitorIdentifier>;

declare const plainMonitorIdentifier: PlainMonitorIdentifier;

String(plainMonitorIdentifier);

export const __typedFixtureModule = "typed-fixture-module";
