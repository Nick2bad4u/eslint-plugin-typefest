import type { If as Choose, Not } from "type-fest";

export type Inverted<Flag extends boolean> = Choose<Flag, false, true>;
export type Preferred<Flag extends boolean> = Not<Flag>;
