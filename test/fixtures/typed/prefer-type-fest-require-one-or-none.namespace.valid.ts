import type * as Legacy from "legacy-type-utils";

type QueryScopePayload = Record<"monitorId" | "teamId", string>;
type UsesNamespaceRequireOneOrNone = Legacy.AtMostOne<QueryScopePayload>;

declare const usesNamespaceRequireOneOrNone: UsesNamespaceRequireOneOrNone;

String(usesNamespaceRequireOneOrNone);

export const __typedFixtureModule = "typed-fixture-module";
