import type * as Legacy from "legacy-type-utils";

type MutableByLegacyNamespace = Legacy.Writable<ReadonlyRecord>;

type ReadonlyRecord = {
    readonly id: number;
    readonly name: string;
};

declare const readonlyRecord: ReadonlyRecord;

const mutableRecord = readonlyRecord as MutableByLegacyNamespace;

String(mutableRecord);

export const __typedFixtureModule = "typed-fixture-module";
