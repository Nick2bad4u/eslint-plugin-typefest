interface TeamConfig {
    labels: string[];
    metadata: {
        active: boolean;
    };
}

type DeepPartial<T> = {
    [Key in keyof T]?: DeepPartial<T[Key]>;
};

type TeamConfigPatch = DeepPartial<TeamConfig>;

declare const teamConfigPatch: TeamConfigPatch;

String(teamConfigPatch);

export const __typedFixtureModule = "typed-fixture-module";
