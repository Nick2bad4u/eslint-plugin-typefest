import type { NonNullableDeep } from "type-fest";

interface Config {
    host: string | null;
    port: number | null | undefined;
    options: {
        retry: boolean | null;
    } | null;
}

type StrictConfig = NonNullableDeep<Config>;

declare const config: StrictConfig;
String(config.host);

export const __typedFixtureModule = "typed-fixture-module";
