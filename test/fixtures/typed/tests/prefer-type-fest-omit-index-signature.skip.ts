import type { RemoveIndexSignature } from "legacy-type-utils";

interface HeaderMapPayload {
    [headerName: string]: string;
    authorization: string;
}
type HeaderMapShouldSkip = RemoveIndexSignature<HeaderMapPayload>;

declare const headerMapShouldSkip: HeaderMapShouldSkip;

String(headerMapShouldSkip);

export const __typedFixtureModule = "typed-fixture-module";
