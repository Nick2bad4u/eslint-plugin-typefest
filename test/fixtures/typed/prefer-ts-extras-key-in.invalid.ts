interface MonitorPayload {
    readonly id: string;
    readonly status: "down" | "up";
}

declare function keyIn<TObject extends object>(
    key: PropertyKey,
    object: TObject
): key is keyof TObject;

const monitorPayload: MonitorPayload = {
    id: "monitor-1",
    status: "up",
};

declare const dynamicKey: string;

const hasStatusKey = "status" in monitorPayload;
const hasDynamicKey = dynamicKey in monitorPayload;
const typedHasDynamicKey = keyIn(dynamicKey, monitorPayload);

if ((hasStatusKey || hasDynamicKey) && typedHasDynamicKey) {
    throw new TypeError("Unexpected key membership in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
