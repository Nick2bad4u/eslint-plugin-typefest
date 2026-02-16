import type { Mutable } from "legacy-type-utils";

interface ReadonlyMonitor {
    readonly endpoint: string;
    readonly intervalMs: number;
}

type WritableMonitor = Mutable<ReadonlyMonitor>;

declare const writableMonitor: WritableMonitor;

String(writableMonitor);

export const __typedFixtureModule = "typed-fixture-module";
