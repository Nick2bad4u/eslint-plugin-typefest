import type * as Legacy from "legacy-type-utils";

type EnvironmentTemplate = Record<"api" | "dashboard", string>;
type UsesNamespaceSchema = Legacy.RecordDeep<EnvironmentTemplate, string>;

declare const usesNamespaceSchema: UsesNamespaceSchema;

String(usesNamespaceSchema);

export const __typedFixtureModule = "typed-fixture-module";
