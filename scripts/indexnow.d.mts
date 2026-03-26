export interface IndexNowPayload {
    readonly host: string;
    readonly key: string;
    readonly keyLocation: string;
    readonly urlList: readonly string[];
}

export interface IndexNowSiteConfiguration {
    readonly host: string;
    readonly keyFileUrl: string;
    readonly siteUrl: string;
    readonly sitemapUrl: string;
}

export function ensureValidIndexNowKey(rawKey: string): string;

export function normalizeSiteUrl(rawSiteUrl: string): string;

export function deriveSiteConfiguration(
    rawSiteUrl: string,
    keyFileName?: string
): IndexNowSiteConfiguration;

export function decodeXmlEntities(value: string): string;

export function parseSitemapUrls(sitemapXml: string): readonly string[];

export function chunkValues<T>(
    values: readonly T[],
    batchSize: number
): readonly (readonly T[])[];

export function createIndexNowPayloads(input: {
    readonly batchSize?: number;
    readonly host: string;
    readonly key: string;
    readonly keyLocation: string;
    readonly urlList: readonly string[];
}): readonly IndexNowPayload[];
