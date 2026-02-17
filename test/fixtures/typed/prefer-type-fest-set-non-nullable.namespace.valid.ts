import type * as Legacy from "legacy-type-utils";

type AccountByNamespaceAlias = Legacy.NonNullableBy<AccountPayload, "token">;

interface AccountPayload {
    accountId: string;
    token: null | string;
}

declare const accountByNamespaceAlias: AccountByNamespaceAlias;

String(accountByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
