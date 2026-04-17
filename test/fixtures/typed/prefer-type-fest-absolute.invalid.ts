type Abs<N extends number> = `${N}` extends `-${infer Pos extends number}`
    ? Pos
    : N;

type AbsoluteValue<N extends number> =
    `${N}` extends `-${infer Pos extends number}` ? Pos : N;

type FiveAbs = Abs<-5>;
type ThreeAbsoluteValue = AbsoluteValue<-3>;

declare const a: FiveAbs;
declare const b: ThreeAbsoluteValue;

String(a + b);

export const __typedFixtureModule = "typed-fixture-module";
