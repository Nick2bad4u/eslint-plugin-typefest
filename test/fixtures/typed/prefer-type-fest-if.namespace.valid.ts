import type * as Legacy from "legacy-type-utils";

type UsesNamespaceIfAny = Legacy.IfAny<unknown, "yes", "no">;

declare const usesNamespaceIfAny: UsesNamespaceIfAny;

String(usesNamespaceIfAny);

export const __typedFixtureModule = "typed-fixture-module";
