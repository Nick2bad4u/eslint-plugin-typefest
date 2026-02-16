import type * as Legacy from "type-fest";

interface UserProfile {
    readonly id: string;
    readonly metadata: {
        readonly active: boolean;
        readonly displayName: string;
    };
}

type UsesNamespaceSimplify = Legacy.Expand<UserProfile>;

declare const usesNamespaceSimplify: UsesNamespaceSimplify;

String(usesNamespaceSimplify);

export const __typedFixtureModule = "typed-fixture-module";
