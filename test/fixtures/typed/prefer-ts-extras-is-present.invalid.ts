declare const maybeValue:
    | null
    | string
    | undefined;

if (maybeValue != null) {
    maybeValue.toUpperCase();
}

if (null != maybeValue) {
    maybeValue.toUpperCase();
}

if (maybeValue == null) {
    String(maybeValue);
}

if (maybeValue !== null && maybeValue !== undefined) {
    maybeValue.toUpperCase();
}

if (maybeValue !== undefined && maybeValue !== null) {
    maybeValue.toUpperCase();
}

if (maybeValue === null || maybeValue === undefined) {
    String(maybeValue);
}

export const __typedFixtureModule = "typed-fixture-module";
