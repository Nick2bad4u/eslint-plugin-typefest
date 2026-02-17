import type { NonNullableBy } from "legacy-type-utils";

interface AccountPayload {
    accountId: string;
    token: null | string;
}

type AccountShouldSkip = NonNullableBy<AccountPayload, "token">;

declare const accountShouldSkip: AccountShouldSkip;

String(accountShouldSkip);

export const __typedFixtureModule = "typed-fixture-module";
