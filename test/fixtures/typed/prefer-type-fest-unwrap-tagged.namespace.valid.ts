import type * as Legacy from "legacy-type-utils";

type MonitorIdentifier = string & { readonly __opaque__: "MonitorIdentifier" };

type UsesNamespaceUnwrapOpaque = Legacy.UnwrapOpaque<MonitorIdentifier>;

declare const usesNamespaceUnwrapOpaque: UsesNamespaceUnwrapOpaque;

String(usesNamespaceUnwrapOpaque);

export const __typedFixtureModule = "typed-fixture-module";
