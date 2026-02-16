import type * as Legacy from "legacy-type-utils";

type MonitorIdSet = Set<string>;

type UsesNamespaceSetElement = Legacy.SetElement<MonitorIdSet>;

declare const usesNamespaceSetElement: UsesNamespaceSetElement;

String(usesNamespaceSetElement);

export const __typedFixtureModule = "typed-fixture-module";
