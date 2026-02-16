type MonitorIdSet = Set<unknown>;
type PayloadKeySet = Set<unknown>;

declare const monitorIdSet: MonitorIdSet;
declare const payloadKeySet: PayloadKeySet;

if (monitorIdSet.size === payloadKeySet.size && monitorIdSet.size > 999) {
    throw new TypeError("Unexpectedly large monitor identifier set");
}

export const __typedFixtureModule = "typed-fixture-module";
