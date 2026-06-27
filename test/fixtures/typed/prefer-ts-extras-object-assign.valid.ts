interface MonitorState {
    readonly isUp: boolean;
    readonly statusCode: number;
}

interface MonitorMetadata {
    readonly owner: string;
}

declare function objectAssign<Target extends object, Source extends object>(
    target: Target,
    source: Source
): Target & Partial<Source>;

const monitorState: MonitorState = {
    isUp: true,
    statusCode: 200,
};

const monitorMetadata: MonitorMetadata = {
    owner: "platform",
};

const mergedMonitor = objectAssign({ ...monitorState }, monitorMetadata);

if (mergedMonitor.statusCode > 599) {
    throw new TypeError("Unexpected status code");
}

export const typedFixtureModule = "typed-fixture-module";
