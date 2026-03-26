import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {(
    input: RequestInfo | URL,
    init?: RequestInit
) => Promise<Response>} FetchImplementation */

/**
 * @typedef {{
 *     readonly host: string;
 *     readonly key: string;
 *     readonly keyLocation: string;
 *     readonly urlList: readonly string[];
 * }} IndexNowPayload
 */

/**
 * @typedef {{
 *     readonly host: string;
 *     readonly keyFileUrl: string;
 *     readonly siteUrl: string;
 *     readonly sitemapUrl: string;
 * }} IndexNowSiteConfiguration
 */

const DIRECTORY_NAME = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(DIRECTORY_NAME, "..");
const DEFAULT_BATCH_SIZE = 10_000;
const DEFAULT_ENDPOINT = "https://www.bing.com/indexnow";
const DEFAULT_KEY_FILE_NAME = "indexnow-key.txt";
const DEFAULT_POLL_INTERVAL_MS = 15_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_WAIT_TIMEOUT_MS = 5 * 60 * 1000;
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9\-]{8,128}$/v;
const XML_ENTITY_PATTERN =
    /&(?:#(?<decimal>\d+)|#x(?<hexadecimal>[\dA-Fa-f]+)|(?<named>amp|apos|gt|lt|quot));/gu;
const LOC_ELEMENT_PATTERN = /<loc>\s*(?<loc>[\s\S]*?)\s*<\/loc>/gu;

/**
 * Pause for the provided number of milliseconds.
 *
 * @param {number} durationMs
 *
 * @returns {Promise<void>}
 */
const delay = async (durationMs) => {
    await new Promise((resolve) => {
        setTimeout(resolve, durationMs);
    });
};

/**
 * Parse `--flag value` and `--flag=value` style CLI options.
 *
 * @param {readonly string[]} argv
 *
 * @returns {{
 *     readonly command: string | undefined;
 *     readonly options: ReadonlyMap<string, string>;
 * }}
 */
const parseCliArguments = (argv) => {
    /** @type {Map<string, string>} */
    const options = new Map();
    const [command, ...rawArguments] = argv;

    for (let index = 0; index < rawArguments.length; index += 1) {
        const rawArgument = rawArguments.at(index);

        if (rawArgument === undefined || !rawArgument.startsWith("--")) {
            throw new Error(
                `Unexpected argument \`${rawArgument ?? "<missing>"}\`. Use --name value or --name=value options.`
            );
        }

        const argumentBody = rawArgument.slice(2);

        if (argumentBody.length === 0) {
            throw new Error("Encountered an empty CLI flag name.");
        }

        const separatorOffset = argumentBody.indexOf("=");

        if (separatorOffset !== -1) {
            const optionName = argumentBody.slice(0, separatorOffset);
            const optionValue = argumentBody.slice(separatorOffset + 1);

            if (optionValue.length === 0) {
                throw new Error(
                    `Option --${optionName} requires a non-empty value.`
                );
            }

            options.set(optionName, optionValue);
            continue;
        }

        const optionValue = rawArguments.at(index + 1);

        if (
            optionValue === undefined ||
            optionValue.length === 0 ||
            optionValue.startsWith("--")
        ) {
            throw new Error(
                `Option --${argumentBody} requires a following value.`
            );
        }

        options.set(argumentBody, optionValue);
        index += 1;
    }

    return {
        command,
        options,
    };
};

/**
 * Read an option value, preferring CLI arguments over environment variables.
 *
 * @param {ReadonlyMap<string, string>} options
 * @param {string} optionName
 * @param {string | undefined} environmentValue
 *
 * @returns {string | undefined}
 */
const readOption = (options, optionName, environmentValue) =>
    options.get(optionName) ?? environmentValue;

/**
 * Read a required option and fail with an actionable message when absent.
 *
 * @param {ReadonlyMap<string, string>} options
 * @param {string} optionName
 * @param {string | undefined} environmentValue
 * @param {string} environmentName
 *
 * @returns {string}
 */
const readRequiredOption = (
    options,
    optionName,
    environmentValue,
    environmentName
) => {
    const optionValue = readOption(options, optionName, environmentValue);

    if (optionValue === undefined || optionValue.trim().length === 0) {
        throw new Error(
            `Missing required option --${optionName} (or environment variable ${environmentName}).`
        );
    }

    return optionValue.trim();
};

/**
 * Parse a positive integer option.
 *
 * @param {string | undefined} rawValue
 * @param {number} defaultValue
 * @param {string} label
 *
 * @returns {number}
 */
const parsePositiveInteger = (rawValue, defaultValue, label) => {
    if (rawValue === undefined || rawValue.trim().length === 0) {
        return defaultValue;
    }

    const numericValue = Number.parseInt(rawValue, 10);

    if (!Number.isSafeInteger(numericValue) || numericValue <= 0) {
        throw new Error(`${label} must be a positive integer.`);
    }

    return numericValue;
};

/**
 * Validate the configured IndexNow key.
 *
 * @param {string} rawKey
 *
 * @returns {string}
 */
export const ensureValidIndexNowKey = (rawKey) => {
    const key = rawKey.trim();

    if (!INDEXNOW_KEY_PATTERN.test(key)) {
        throw new Error(
            "INDEXNOW_KEY must be 8-128 characters long and contain only letters, numbers, and dashes."
        );
    }

    return key;
};

/**
 * Normalize a public site URL for path joining.
 *
 * @param {string} rawSiteUrl
 *
 * @returns {string}
 */
export const normalizeSiteUrl = (rawSiteUrl) => {
    const siteUrl = new URL(rawSiteUrl);
    siteUrl.hash = "";
    siteUrl.search = "";
    siteUrl.pathname = siteUrl.pathname.endsWith("/")
        ? siteUrl.pathname
        : `${siteUrl.pathname}/`;

    return siteUrl.toString();
};

/**
 * Derive the public sitemap and key-file URLs from a deployed site URL.
 *
 * @param {string} rawSiteUrl
 * @param {string} [keyFileName] - Optional public key-file name. Defaults to
 *   `indexnow-key.txt`.
 *
 * @returns {IndexNowSiteConfiguration}
 */
export const deriveSiteConfiguration = (
    rawSiteUrl,
    keyFileName = DEFAULT_KEY_FILE_NAME
) => {
    const siteUrl = normalizeSiteUrl(rawSiteUrl);
    const normalizedSiteUrl = new URL(siteUrl);
    const normalizedKeyFileName = keyFileName.trim();

    if (normalizedKeyFileName.length === 0) {
        throw new Error("The IndexNow key file name must not be empty.");
    }

    return {
        host: normalizedSiteUrl.hostname,
        keyFileUrl: new URL(
            normalizedKeyFileName,
            normalizedSiteUrl
        ).toString(),
        sitemapUrl: new URL("sitemap.xml", normalizedSiteUrl).toString(),
        siteUrl,
    };
};

/**
 * Decode the XML entities that may appear inside sitemap URLs.
 *
 * @param {string} value
 *
 * @returns {string}
 */
export const decodeXmlEntities = (value) =>
    value.replaceAll(XML_ENTITY_PATTERN, (_, decimal, hexadecimal, named) => {
        if (decimal !== undefined) {
            return String.fromCodePoint(Number.parseInt(decimal, 10));
        }

        if (hexadecimal !== undefined) {
            return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
        }

        switch (named) {
            case "amp": {
                return "&";
            }

            case "apos": {
                return "'";
            }

            case "gt": {
                return ">";
            }

            case "lt": {
                return "<";
            }

            case "quot": {
                return '"';
            }

            default: {
                return "&";
            }
        }
    });

/**
 * Parse and deduplicate all `&lt;loc&gt;` entries from a sitemap.
 *
 * @remarks
 * Docusaurus emits a standard XML sitemap with raw URL text content inside
 * `&lt;loc&gt;` elements. We only need those URL values and deliberately keep
 * this parser constrained to the sitemap contract rather than introducing a
 * heavier XML dependency for one deterministic extraction step.
 *
 * @param {string} sitemapXml
 *
 * @returns {readonly string[]}
 */
export const parseSitemapUrls = (sitemapXml) => {
    /** @type {string[]} */
    const urls = [];
    const seenUrls = new Set();

    for (const match of sitemapXml.matchAll(LOC_ELEMENT_PATTERN)) {
        const rawLocation = match.groups?.["loc"]?.trim();

        if (rawLocation === undefined || rawLocation.length === 0) {
            continue;
        }

        const decodedLocation = decodeXmlEntities(rawLocation);

        if (seenUrls.has(decodedLocation)) {
            continue;
        }

        seenUrls.add(decodedLocation);
        urls.push(decodedLocation);
    }

    if (urls.length === 0) {
        throw new Error(
            "No <loc> entries were found in the sitemap. Verify that the deployed sitemap is valid and publicly reachable."
        );
    }

    return urls;
};

/**
 * Split a list into stable batches.
 *
 * @template T - Element type being chunked into stable submission batches.
 *
 * @param {readonly T[]} values
 * @param {number} batchSize
 *
 * @returns {readonly (readonly T[])[]}
 */
export const chunkValues = (values, batchSize) => {
    if (!Number.isSafeInteger(batchSize) || batchSize <= 0) {
        throw new Error("batchSize must be a positive integer.");
    }

    /** @type {T[][]} */
    const chunks = [];

    for (let index = 0; index < values.length; index += batchSize) {
        chunks.push(values.slice(index, index + batchSize));
    }

    return chunks;
};

/**
 * Build the JSON payloads submitted to the IndexNow endpoint.
 *
 * @param {{
 *     readonly batchSize?: number;
 *     readonly host: string;
 *     readonly key: string;
 *     readonly keyLocation: string;
 *     readonly urlList: readonly string[];
 * }} options
 *
 * @returns {readonly IndexNowPayload[]}
 */
export const createIndexNowPayloads = ({
    batchSize = DEFAULT_BATCH_SIZE,
    host,
    key,
    keyLocation,
    urlList,
}) =>
    chunkValues(urlList, batchSize).map((urls) => ({
        host,
        key,
        keyLocation,
        urlList: urls,
    }));

/**
 * Fetch text content from a URL with a bounded timeout.
 *
 * @param {FetchImplementation} fetchImplementation
 * @param {string} url
 *
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = async (fetchImplementation, url) =>
    fetchImplementation(url, {
        headers: { accept: "application/json, application/xml, text/plain" },
        method: "GET",
        signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
    });

/**
 * Wait until the deployed key file is publicly reachable and contains the
 * expected key.
 *
 * @param {{
 *     readonly fetchImplementation?: FetchImplementation;
 *     readonly intervalMs?: number;
 *     readonly key: string;
 *     readonly keyFileUrl: string;
 *     readonly sitemapUrl: string;
 *     readonly timeoutMs?: number;
 * }} options
 *
 * @returns {Promise<string>}
 */
const waitForPublishedSiteArtifacts = async ({
    fetchImplementation = globalThis.fetch,
    intervalMs = DEFAULT_POLL_INTERVAL_MS,
    key,
    keyFileUrl,
    sitemapUrl,
    timeoutMs = DEFAULT_WAIT_TIMEOUT_MS,
}) => {
    const startedAt = Date.now();
    let attemptNumber = 1;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const keyResponse = await fetchWithTimeout(
                fetchImplementation,
                keyFileUrl
            );

            if (keyResponse.ok) {
                const publishedKey = (await keyResponse.text()).trim();

                if (publishedKey === key) {
                    const sitemapResponse = await fetchWithTimeout(
                        fetchImplementation,
                        sitemapUrl
                    );

                    if (sitemapResponse.ok) {
                        return await sitemapResponse.text();
                    }
                }
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            console.info(
                `IndexNow readiness check attempt ${String(attemptNumber)} failed: ${message}`
            );
        }

        console.info(
            `Waiting for GitHub Pages to publish IndexNow assets (attempt ${String(
                attemptNumber
            )}).`
        );
        attemptNumber += 1;
        await delay(intervalMs);
    }

    throw new Error(
        `Timed out after ${String(timeoutMs)}ms waiting for ${keyFileUrl} and ${sitemapUrl} to become publicly reachable.`
    );
};

/**
 * Submit the prepared IndexNow payloads.
 *
 * @param {{
 *     readonly endpoint: string;
 *     readonly fetchImplementation?: FetchImplementation;
 *     readonly payloads: readonly IndexNowPayload[];
 * }} options
 *
 * @returns {Promise<void>}
 */
const submitPayloads = async ({
    endpoint,
    fetchImplementation = globalThis.fetch,
    payloads,
}) => {
    for (const [payloadIndex, payload] of payloads.entries()) {
        const response = await fetchImplementation(endpoint, {
            body: JSON.stringify(payload),
            headers: {
                "content-type": "application/json; charset=utf-8",
            },
            method: "POST",
            signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
            const responseText = (await response.text()).trim();
            const responseBodySuffix =
                responseText.length === 0
                    ? ""
                    : ` Response body: ${responseText}`;

            throw new Error(
                `IndexNow rejected batch ${String(payloadIndex + 1)}/${String(payloads.length)} with HTTP ${String(response.status)}.${responseBodySuffix}`
            );
        }

        console.info(
            `Submitted IndexNow batch ${String(payloadIndex + 1)}/${String(payloads.length)} containing ${String(payload.urlList.length)} URLs.`
        );
    }
};

/**
 * Write the public key verification file into the already-built site output.
 *
 * @param {ReadonlyMap<string, string>} options
 *
 * @returns {Promise<void>}
 */
const writeKeyFile = async (options) => {
    const key = ensureValidIndexNowKey(
        readRequiredOption(
            options,
            "key",
            process.env["INDEXNOW_KEY"],
            "INDEXNOW_KEY"
        )
    );
    const outputPath = readRequiredOption(
        options,
        "output",
        process.env["INDEXNOW_OUTPUT_PATH"],
        "INDEXNOW_OUTPUT_PATH"
    );
    const resolvedOutputPath = path.resolve(REPOSITORY_ROOT, outputPath);

    await fs.mkdir(path.dirname(resolvedOutputPath), { recursive: true });
    await fs.writeFile(resolvedOutputPath, key, "utf8");

    console.info(`Wrote IndexNow key file to ${resolvedOutputPath}.`);
};

/**
 * Fetch the deployed sitemap, derive the IndexNow payloads, and submit them.
 *
 * @param {ReadonlyMap<string, string>} options
 *
 * @returns {Promise<void>}
 */
const submitSitemap = async (options) => {
    const key = ensureValidIndexNowKey(
        readRequiredOption(
            options,
            "key",
            process.env["INDEXNOW_KEY"],
            "INDEXNOW_KEY"
        )
    );
    const endpoint =
        readOption(
            options,
            "endpoint",
            process.env["INDEXNOW_ENDPOINT"]
        )?.trim() ?? DEFAULT_ENDPOINT;
    const keyFileName =
        readOption(
            options,
            "key-file-name",
            process.env["INDEXNOW_KEY_FILE_NAME"]
        )?.trim() ?? DEFAULT_KEY_FILE_NAME;
    const siteUrl = readRequiredOption(
        options,
        "site-url",
        process.env["INDEXNOW_SITE_URL"],
        "INDEXNOW_SITE_URL"
    );
    const batchSize = parsePositiveInteger(
        readOption(options, "batch-size", process.env["INDEXNOW_BATCH_SIZE"]),
        DEFAULT_BATCH_SIZE,
        "IndexNow batch size"
    );
    const intervalMs = parsePositiveInteger(
        readOption(
            options,
            "poll-interval-ms",
            process.env["INDEXNOW_POLL_INTERVAL_MS"]
        ),
        DEFAULT_POLL_INTERVAL_MS,
        "IndexNow poll interval"
    );
    const timeoutMs = parsePositiveInteger(
        readOption(options, "timeout-ms", process.env["INDEXNOW_TIMEOUT_MS"]),
        DEFAULT_WAIT_TIMEOUT_MS,
        "IndexNow readiness timeout"
    );

    const siteConfiguration = deriveSiteConfiguration(siteUrl, keyFileName);
    console.info(
        `Preparing IndexNow submission for ${siteConfiguration.siteUrl} via ${endpoint}.`
    );

    const sitemapXml = await waitForPublishedSiteArtifacts({
        intervalMs,
        key,
        keyFileUrl: siteConfiguration.keyFileUrl,
        sitemapUrl: siteConfiguration.sitemapUrl,
        timeoutMs,
    });
    const urlList = parseSitemapUrls(sitemapXml);
    const payloads = createIndexNowPayloads({
        batchSize,
        host: siteConfiguration.host,
        key,
        keyLocation: siteConfiguration.keyFileUrl,
        urlList,
    });

    console.info(
        `Submitting ${String(urlList.length)} sitemap URLs across ${String(payloads.length)} IndexNow batch(es).`
    );
    await submitPayloads({ endpoint, payloads });
};

/**
 * Execute the CLI entrypoint.
 *
 * @returns {Promise<void>}
 */
const main = async () => {
    const { command, options } = parseCliArguments(process.argv.slice(2));

    switch (command) {
        case "submit-sitemap": {
            await submitSitemap(options);
            return;
        }

        case "write-key-file": {
            await writeKeyFile(options);
            return;
        }

        default: {
            throw new Error(
                "Unknown command. Use `write-key-file` or `submit-sitemap`."
            );
        }
    }
};

if (
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
    await main().catch((error) => {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error(`IndexNow automation failed: ${errorMessage}`);
        process.exitCode = 1;
    });
}
