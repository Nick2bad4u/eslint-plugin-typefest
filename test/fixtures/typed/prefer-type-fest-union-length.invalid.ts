import type { UnionToTuple } from "type-fest";

type Colors = "red" | "green" | "blue";

type ColorCount = UnionToTuple<Colors>["length"];

declare const count: ColorCount;
String(count);

export const __typedFixtureModule = "typed-fixture-module";
