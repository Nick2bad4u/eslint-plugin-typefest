import type * as Legacy from "legacy-type-utils";

type AuthPayload = Record<"apiKey" | "oauthToken" | "sessionToken", string>;
type UsesNamespaceRequireExactlyOne = Legacy.OneOf<AuthPayload>;

declare const usesNamespaceRequireExactlyOne: UsesNamespaceRequireExactlyOne;

String(usesNamespaceRequireExactlyOne);

export const __typedFixtureModule = "typed-fixture-module";
