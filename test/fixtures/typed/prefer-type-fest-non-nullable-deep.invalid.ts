interface Config {
    host: string | null;
    port: number | null | undefined;
    options: {
        retry: boolean | null;
    } | null;
}

type DeepNonNullable<T> = {
    [K in keyof T]: NonNullable<T[K]>;
};

type StrictConfig = DeepNonNullable<Config>;

declare const config: StrictConfig;
String(config.host);

export const __typedFixtureModule = "typed-fixture-module";
