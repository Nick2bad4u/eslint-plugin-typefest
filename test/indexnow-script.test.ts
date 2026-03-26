import { describe, expect, it } from "vitest";

import {
    chunkValues,
    createIndexNowPayloads,
    decodeXmlEntities,
    deriveSiteConfiguration,
    ensureValidIndexNowKey,
    normalizeSiteUrl,
    parseSitemapUrls,
} from "../scripts/indexnow.mjs";

describe("indexnow script helpers", () => {
    it("validates accepted IndexNow keys", () => {
        expect(ensureValidIndexNowKey("abcd1234-XYZ")).toBe("abcd1234-XYZ");
    });

    it("rejects invalid IndexNow keys", () => {
        expect(() => ensureValidIndexNowKey("bad key")).toThrow(
            /INDEXNOW_KEY must be 8-128 characters long/v
        );
        expect(() => ensureValidIndexNowKey("short")).toThrow(
            /INDEXNOW_KEY must be 8-128 characters long/v
        );
    });

    it("normalizes deployed site URLs for relative asset resolution", () => {
        expect(
            normalizeSiteUrl(
                "https://nick2bad4u.github.io/eslint-plugin-typefest?ref=main#docs"
            )
        ).toBe("https://nick2bad4u.github.io/eslint-plugin-typefest/");
    });

    it("derives sitemap and key-file URLs from a project site URL", () => {
        expect(
            deriveSiteConfiguration(
                "https://nick2bad4u.github.io/eslint-plugin-typefest/"
            )
        ).toStrictEqual({
            host: "nick2bad4u.github.io",
            keyFileUrl:
                "https://nick2bad4u.github.io/eslint-plugin-typefest/indexnow-key.txt",
            sitemapUrl:
                "https://nick2bad4u.github.io/eslint-plugin-typefest/sitemap.xml",
            siteUrl: "https://nick2bad4u.github.io/eslint-plugin-typefest/",
        });
    });

    it("decodes sitemap XML entities", () => {
        expect(
            decodeXmlEntities(
                "https://example.com/docs?x=1&amp;y=2&amp;title=Tom&#39;s%20Guide"
            )
        ).toBe("https://example.com/docs?x=1&y=2&title=Tom's%20Guide");
    });

    it("parses and deduplicates sitemap URLs", () => {
        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                    <loc>https://example.com/</loc>
                </url>
                <url>
                    <loc>https://example.com/docs?x=1&amp;y=2</loc>
                </url>
                <url>
                    <loc>https://example.com/</loc>
                </url>
            </urlset>`;

        expect(parseSitemapUrls(sitemapXml)).toStrictEqual([
            "https://example.com/",
            "https://example.com/docs?x=1&y=2",
        ]);
    });

    it("splits URL lists into stable batches", () => {
        expect(
            chunkValues(
                [
                    1,
                    2,
                    3,
                    4,
                    5,
                ],
                2
            )
        ).toStrictEqual([
            [1, 2],
            [3, 4],
            [5],
        ]);
    });

    it("builds IndexNow payload batches with the expected metadata", () => {
        expect(
            createIndexNowPayloads({
                batchSize: 2,
                host: "nick2bad4u.github.io",
                key: "abcd1234-XYZ",
                keyLocation:
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/indexnow-key.txt",
                urlList: [
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/",
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/foo",
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/blog/bar",
                ],
            })
        ).toStrictEqual([
            {
                host: "nick2bad4u.github.io",
                key: "abcd1234-XYZ",
                keyLocation:
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/indexnow-key.txt",
                urlList: [
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/",
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/foo",
                ],
            },
            {
                host: "nick2bad4u.github.io",
                key: "abcd1234-XYZ",
                keyLocation:
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/indexnow-key.txt",
                urlList: [
                    "https://nick2bad4u.github.io/eslint-plugin-typefest/blog/bar",
                ],
            },
        ]);
    });
});
