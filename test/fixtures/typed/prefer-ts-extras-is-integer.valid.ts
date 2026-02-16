declare function isInteger(value: unknown): value is number;

const maybeRetryCount: unknown = Math.random() > 0.5 ? 3 : 4;
if (isInteger(maybeRetryCount)) {
    const nextRetryCount = maybeRetryCount + 1;
    if (nextRetryCount > 1000) {
        throw new TypeError("Unexpectedly large retry count");
    }
}

export const typedFixtureModule = "typed-fixture-module";
