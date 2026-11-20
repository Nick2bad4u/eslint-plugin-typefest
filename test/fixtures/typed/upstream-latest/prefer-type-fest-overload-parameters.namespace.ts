import type * as TF from "type-fest";

import type { convert } from "./prefer-type-fest-overload-parameters.js";

export type All = TF.FunctionParameters<TF.Overloads<typeof convert>[number]>;
