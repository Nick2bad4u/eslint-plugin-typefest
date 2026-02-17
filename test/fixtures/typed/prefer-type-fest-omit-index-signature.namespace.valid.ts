import type * as Legacy from "legacy-type-utils";

type HeaderMapByNamespaceAlias = Legacy.RemoveIndexSignature<HeaderMapPayload>;
interface HeaderMapPayload {
    [headerName: string]: string;
    authorization: string;
}

declare const headerMapByNamespaceAlias: HeaderMapByNamespaceAlias;

String(headerMapByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
