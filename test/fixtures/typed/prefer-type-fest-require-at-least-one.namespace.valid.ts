import type * as Legacy from "legacy-type-utils";

type AlertDestinationPayload = Record<"email" | "pager" | "slack", string>;
type UsesNamespaceAtLeastOne = Legacy.AtLeastOne<AlertDestinationPayload>;

declare const usesNamespaceAtLeastOne: UsesNamespaceAtLeastOne;

String(usesNamespaceAtLeastOne);

export const __typedFixtureModule = "typed-fixture-module";
