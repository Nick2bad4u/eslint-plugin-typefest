import type * as Legacy from "legacy-type-utils";

type DeploymentByNamespaceAlias = Legacy.RequiredBy<
    DeploymentPayload,
    "region"
>;

interface DeploymentPayload {
    environment: string;
    region?: string;
}

declare const deploymentByNamespaceAlias: DeploymentByNamespaceAlias;

String(deploymentByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
