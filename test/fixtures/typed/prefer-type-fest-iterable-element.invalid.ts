import type {
    SetEntry as EntryAlias,
    SetElement,
    SetValues,
} from "legacy-type-utils";

type ElementViaAlias = SetElement<MonitorIdSet>;
type EntryViaAlias = EntryAlias<MonitorIdSet>;
type MonitorIdSet = Set<string>;
type ValueViaAlias = SetValues<MonitorIdSet>;

declare const entryViaAlias: EntryViaAlias;
declare const elementViaAlias: ElementViaAlias;
declare const valueViaAlias: ValueViaAlias;

String(entryViaAlias);
String(elementViaAlias);
String(valueViaAlias);

export const __typedFixtureModule = "typed-fixture-module";
