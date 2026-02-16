import type { AtMostOne } from "legacy-type-utils";

type QueryScope = AtMostOne<QueryScopePayload>;
type QueryScopePayload = Record<"monitorId" | "teamId", string>;

declare const queryScope: QueryScope;

String(queryScope);

export const __typedFixtureModule = "typed-fixture-module";
