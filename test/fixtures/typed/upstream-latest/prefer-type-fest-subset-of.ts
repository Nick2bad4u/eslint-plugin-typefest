import type { IsEqual, SubsetOf } from "type-fest";

export type Allowed<Domain, Selection extends Domain> = Selection;

type Assert<Condition extends true> = Condition;
export type VerifiedExample = Assert<
    IsEqual<
        Allowed<string | number, "ready">,
        SubsetOf<string | number, "ready">
    >
>;
