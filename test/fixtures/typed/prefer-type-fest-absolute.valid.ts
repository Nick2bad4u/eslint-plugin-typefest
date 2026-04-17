import type { Absolute } from "type-fest";

type AbsoluteFive = Absolute<-5>;
type AbsoluteNegativeThree = Absolute<-3>;

declare const n: AbsoluteFive;
String(n);

export const __typedFixtureModule = "typed-fixture-module";
