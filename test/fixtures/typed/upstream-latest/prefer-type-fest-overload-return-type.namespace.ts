import type * as TF from "type-fest";

import type { convert } from "./prefer-type-fest-overload-return-type.js";

export type All = ReturnType<TF.Overloads<typeof convert>[number]>;
