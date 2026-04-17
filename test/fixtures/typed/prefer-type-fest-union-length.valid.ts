import type { UnionLength } from "type-fest";

type Colors = "red" | "green" | "blue";

type ColorCount = UnionLength<Colors>;

declare const count: ColorCount;
String(count);

export const __typedFixtureModule = "typed-fixture-module";
