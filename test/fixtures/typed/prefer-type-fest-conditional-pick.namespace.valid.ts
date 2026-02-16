import type * as Legacy from "legacy-type-utils";

interface MonitorPayload {
    readonly errorCode: number;
    readonly id: string;
    readonly region: string;
}

type UsesNamespaceConditionalPick = Legacy.PickByTypes<MonitorPayload, string>;

declare const usesNamespaceConditionalPick: UsesNamespaceConditionalPick;

String(usesNamespaceConditionalPick);

export const __typedFixtureModule = "typed-fixture-module";
