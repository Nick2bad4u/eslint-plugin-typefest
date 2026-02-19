import { themes as prismThemes } from "prism-react-renderer";

import type { Config } from "@docusaurus/types";
import type { Options as DocsPluginOptions } from "@docusaurus/plugin-content-docs";
import type * as Preset from "@docusaurus/preset-classic";
import { fileURLToPath } from "node:url";

const siteUrl =
    process.env["DOCUSAURUS_SITE_URL"] ?? "https://nick2bad4u.github.io";
const baseUrl =
    process.env["DOCUSAURUS_BASE_URL"] ?? "/eslint-plugin-typefest/";
const enableExperimentalFaster =
    process.env["DOCUSAURUS_ENABLE_EXPERIMENTAL"] === "true";

const organizationName = "Nick2bad4u";
const projectName = "eslint-plugin-typefest";
const modernEnhancementsClientModule = fileURLToPath(
    new URL("src/js/modernEnhancements.ts", import.meta.url)
);

const pwaThemeColor = "#2E2A33";
const pwaTileColor = "#2E2A33";
const pwaMaskIconColor = "#71B041";

const removeHeadAttrFlagKey = [
    "remove",
    "Le",
    "gacyPostBuildHeadAttribute",
].join("");

const futureConfig = {
    ...(enableExperimentalFaster
        ? {
              experimental_faster: {
                  mdxCrossCompilerCache: true,
                  rspackBundler: true,
                  rspackPersistentCache: true,
                  ssgWorkerThreads: true,
              },
          }
        : {}),
    v4: {
        [removeHeadAttrFlagKey]: true,
        // NOTE: Enabling cascade layers currently breaks our production CSS output
        // (CssMinimizer parsing errors -> large chunks of CSS dropped), which
        // makes many Infima (--ifm-*) variables undefined across the site.
        // Re-enable only after verifying the build output CSS is valid.
        useCssCascadeLayers: false,
    },
} satisfies Config["future"];

const config: Config = {
    baseUrl: "/eslint-plugin-typefest/",
    baseUrlIssueBanner: true,
    deploymentBranch: "gh-pages",
    favicon: "img/logo.svg",
    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: futureConfig,
    clientModules: [modernEnhancementsClientModule],
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
    markdown: {
        anchors: {
            maintainCase: true,
        },
        emoji: true,
        format: "detect",
        hooks: {
            onBrokenMarkdownImages: "warn",
            onBrokenMarkdownLinks: "warn",
        },
        mermaid: true,
    },
    noIndex: false,
    onBrokenAnchors: "warn",
    onBrokenLinks: "warn",
    onDuplicateRoutes: "warn",
    organizationName,
    plugins: [
        "docusaurus-plugin-image-zoom",
        [
            "@docusaurus/plugin-pwa",
            {
                debug: process.env["DOCUSAURUS_PWA_DEBUG"] === "true",
                offlineModeActivationStrategies: [
                    "appInstalled",
                    "standalone",
                    "queryString",
                ],
                pwaHead: [
                    {
                        href: `${baseUrl}manifest.json`,
                        rel: "manifest",
                        tagName: "link",
                    },
                    {
                        content: pwaThemeColor,
                        name: "theme-color",
                        tagName: "meta",
                    },
                    {
                        content: "yes",
                        name: "apple-mobile-web-app-capable",
                        tagName: "meta",
                    },
                    {
                        content: "default",
                        name: "apple-mobile-web-app-status-bar-style",
                        tagName: "meta",
                    },
                    {
                        href: `${baseUrl}img/icon-192.png`,
                        rel: "apple-touch-icon",
                        tagName: "link",
                    },
                    {
                        color: pwaMaskIconColor,
                        href: `${baseUrl}img/icon-512.svg`,
                        rel: "mask-icon",
                        tagName: "link",
                    },
                    {
                        content: `${baseUrl}img/icon-192.png`,
                        name: "msapplication-TileImage",
                        tagName: "meta",
                    },
                    {
                        content: pwaTileColor,
                        name: "msapplication-TileColor",
                        tagName: "meta",
                    },
                ],
            },
        ],
        [
            "@docusaurus/plugin-content-docs",
            {
                editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
                id: "rules",
                path: "../rules",
                routeBasePath: "docs/rules",
                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                sidebarPath: "./sidebars.rules.ts",
            } satisfies DocsPluginOptions,
        ],
    ],
    presets: [
        [
            "classic",
            {
                blog: false,
                docs: {
                    breadcrumbs: true,
                    editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
                    path: "site-docs",
                    includeCurrentVersion: true,
                    onInlineTags: "ignore",
                    routeBasePath: "docs",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    sidebarCollapsed: false,
                    sidebarCollapsible: true,
                    sidebarPath: "./sidebars.ts",
                },
                pages: {
                    editUrl:
                        "https://github.com/Nick2bad4u/eslint-plugin-typefest/issues/new?template=custom-issue.md#",
                    exclude: [
                        // Declarations (often generated next to CSS modules)
                        // must never become routable pages.
                        "**/*.d.ts",
                        "**/*.d.tsx",
                        "**/__tests__/**",
                        "**/*.test.{js,jsx,ts,tsx}",
                        "**/*.spec.{js,jsx,ts,tsx}",
                    ],
                    include: ["**/*.{js,jsx,ts,tsx,md,mdx}"],
                    mdxPageComponent: "@theme/MDXPage",
                    path: "src/pages",
                    routeBasePath: "/",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                },
                sitemap: {
                    changefreq: "weekly",
                    filename: "sitemap.xml",
                    ignorePatterns: ["/tests/**"],
                    lastmod: "datetime",
                    priority: 0.5,
                },
                svgr: {
                    svgrConfig: {
                        dimensions: false, // Remove width/height so CSS controls size
                        expandProps: "start", // Spread props at the start: <svg {...props}>
                        icon: true, // Treat SVGs as icons (scales via viewBox)
                        memo: true, // Wrap component with React.memo
                        native: false, // Produce web React components (not React Native)
                        prettier: true, // Run Prettier on output
                        prettierConfig: "../../.prettierrc",
                        replaceAttrValues: {
                            "#000": "currentColor",
                            "#000000": "currentColor",
                        }, // Inherit color
                        svgo: true, // Enable SVGO optimizations
                        svgoConfig: {
                            plugins: [
                                { active: false, name: "removeViewBox" }, // Keep viewBox for scalability
                            ],
                        },
                        svgProps: { focusable: "false", role: "img" }, // Default SVG props
                        titleProp: true, // Allow passing a title prop for accessibility
                        typescript: true, // Generate TypeScript-friendly output (.tsx)
                    },
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],
    projectName,
    tagline:
        "Type-safe ESLint rules for preferring type-fest and ts-extras patterns.",
    themeConfig: {
        copyright: `© ${new Date().getFullYear()} <a href="https://github.com/Nick2bad4u/" target="_blank" rel="noopener noreferrer">Nick2bad4u</a> 💻 Built with <a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">🦖 Docusaurus</a>.`,
        footer: {
            links: [
                {
                    items: [
                        {
                            label: "🏁 Overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "📖 Getting Started",
                            to: "/docs/rules/getting-started",
                        },
                        {
                            label: "🎛 Presets",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "📏 Rule Reference",
                            to: "/docs/rules",
                        },
                    ],
                    title: "📚 Documentation",
                },
                {
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "🔗 Repository",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}/issues`,
                            label: "🐛 Report Issues",
                        },
                    ],
                    title: "🧠 Deep Dive",
                },
                {
                    items: [
                        {
                            href: `${siteUrl}${baseUrl}eslint-inspector/`,
                            label: "🔍 ESLint Inspector",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "🎁 NPM",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}/releases`,
                            label: "📦 Download Latest",
                        },
                    ],
                    title: "🚀 Latest",
                },
            ],
            style: "dark",
        },
        image: "img/logo.svg",
        navbar: {
            items: [
                {
                    label: "Docs",
                    position: "left",
                    to: "/docs/rules/overview",
                },
                {
                    label: "Rules",
                    position: "left",
                    to: "/docs/rules",
                },
                {
                    label: "Presets",
                    position: "left",
                    to: "/docs/rules/presets",
                },
                {
                    label: "Dev",
                    position: "right",
                    to: "/docs/developer",
                },
                {
                    href: `https://github.com/${organizationName}/${projectName}`,
                    label: "GitHub",
                    position: "right",
                },
            ],
            logo: {
                alt: "eslint-plugin-typefest logo",
                height: 48,
                href: baseUrl,
                src: "img/logo.svg",
                width: 48,
            },
            title: "eslint-plugin-typefest",
        },
        prism: {
            additionalLanguages: [
                "bash",
                "json",
                "yaml",
                "typescript",
            ],
            darkTheme: prismThemes.dracula,
            defaultLanguage: "typescript",
            theme: prismThemes.github,
        },
        zoom: {
            background: {
                dark: "rgb(50, 50, 50)",
                light: "rgb(255, 255, 255)",
            },
            config: {
                // Options you can specify via https://github.com/francoischalifour/medium-zoom#usage
            },
            selector: ".markdown > img",
        },
    } satisfies Preset.ThemeConfig,
    themes: [
        "@docusaurus/theme-mermaid",
        [
            "@easyops-cn/docusaurus-search-local",
            {
                blogDir: "blog",
                blogRouteBasePath: "blog",
                docsDir: "docs",
                docsRouteBasePath: "docs",
                explicitSearchResultPath: false,
                forceIgnoreNoIndex: true,
                fuzzyMatchingDistance: 1,
                hashed: true,
                hideSearchBarWithNoSearchContext: false,
                highlightSearchTermsOnTargetPage: true,
                indexBlog: true,
                indexDocs: true,
                indexPages: false,
                language: ["en"],
                removeDefaultStemmer: true,
                removeDefaultStopWordFilter: false,
                searchBarPosition: "right",
                searchBarShortcut: true,
                searchBarShortcutHint: true,
                searchBarShortcutKeymap: "ctrl+k",
                searchResultContextMaxLength: 96,
                searchResultLimits: 8,
                useAllContextsWithNoSearchContext: false,
            },
        ],
    ],
    title: "eslint-plugin-typefest",
    trailingSlash: false,
    url: "https://nick2bad4u.github.io",
};

export default config;
