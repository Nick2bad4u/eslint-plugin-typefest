import { asWritable } from "ts-extras";
import type { Writable as LegacyWritable } from "legacy-type-utils";

type MutableByLegacy = LegacyWritable<ReadonlyRecord>;

type ReadonlyRecord = {
    readonly id: number;
    readonly name: string;
};

declare const readonlyRecord: ReadonlyRecord;

declare const mutableByLegacy: MutableByLegacy;

const mutableRecord = asWritable(readonlyRecord);

String(mutableRecord);
String(mutableByLegacy);

export const __typedFixtureModule = "typed-fixture-module";
