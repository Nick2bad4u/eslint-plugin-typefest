import type * as Legacy from "legacy-type-utils";

type AuthPairPayload = Record<"password" | "token" | "username", string>;
type UsesNamespaceAllOrNone = Legacy.AllOrNone<AuthPairPayload>;

declare const usesNamespaceAllOrNone: UsesNamespaceAllOrNone;

String(usesNamespaceAllOrNone);

export const __typedFixtureModule = "typed-fixture-module";
