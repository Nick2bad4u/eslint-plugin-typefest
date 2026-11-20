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

const mergedMonitor = Object.assign(monitorState, monitorMetadata);
const secondMergedMonitor = Object.assign(monitorMetadata, monitorState, {
    owner: "operations",
});
const typedMergedMonitor = objectAssign({ ...monitorState }, monitorMetadata);

if (
    monitorMetadata.owner !== "operations" ||
    mergedMonitor.statusCode +
        secondMergedMonitor.statusCode +
        typedMergedMonitor.statusCode >
        599
) {
    throw new TypeError("Unexpected merged monitor state");
}

export const typedFixtureModule = "typed-fixture-module";
