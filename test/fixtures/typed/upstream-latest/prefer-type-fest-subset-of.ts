import type { SubsetOf } from "type-fest";

export type Allowed<Domain, Selection extends Domain> = Selection;

export type { SubsetOf };
