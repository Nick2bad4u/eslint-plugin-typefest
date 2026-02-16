import type * as Legacy from "legacy-type-utils";

type UsesNamespaceReadonlyTuple = Legacy.ReadonlyTuple<string, 3>;

declare const usesNamespaceReadonlyTuple: UsesNamespaceReadonlyTuple;

String(usesNamespaceReadonlyTuple);

export const __typedFixtureModule = "typed-fixture-module";
