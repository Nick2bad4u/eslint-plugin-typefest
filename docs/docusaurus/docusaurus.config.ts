import type { Options as DocsPluginOptions } from "@docusaurus/plugin-content-docs";
import type * as Preset from "@docusaurus/preset-classic";
import type { Config, PluginModule } from "@docusaurus/types";

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { themes as prismThemes } from "prism-react-renderer";

/** Route base path where docs site is deployed (GitHub Pages project path). */
const baseUrl =
    globalThis.process.env["DOCUSAURUS_BASE_URL"] ?? "/eslint-plugin-typefest/";
/** Opt-in flag for experimental Docusaurus performance features. */
const enableExperimentalFaster =
    globalThis.process.env["DOCUSAURUS_ENABLE_EXPERIMENTAL"] === "true";

/** GitHub organization used for edit links and project metadata. */
const organizationName = "Nick2bad4u";
/** Repository name used for edit links and project metadata. */
const projectName = "eslint-plugin-typefest";
/** Public origin for the published documentation site. */
const siteOrigin = "https://nick2bad4u.github.io";
/** Canonical public site URL including the GitHub Pages project path. */
const siteUrl = `${siteOrigin}${baseUrl}`;
/** Global site description used for SEO and social cards. */
const siteDescription =
    "Type-safe ESLint rules for adopting type-fest and ts-extras patterns in modern TypeScript codebases.";
/** Global blog description used for SEO and social cards. */
const projectBlogDescription = `Updates, architecture notes, and practical guidance for ${projectName} users.`;
/** Global project tagline used for SEO metadata. */
const projectTagline = `Type-safe ESLint rules for adopting type-fest and ts-extras patterns in modern TypeScript codebases.`;
/** Global project keywords used for SEO metadata. */
const projectKeywords =
    "eslint, eslint-plugin, type-fest, ts-extras, typescript, flat config, static analysis";
/** Social preview image used for Open Graph and Twitter cards. */
const socialCardImagePath = "img/logo.png";
/** Absolute social preview image URL. */
const socialCardImageUrl = new URL(socialCardImagePath, siteUrl).toString();
/** Client module path for runtime DOM enhancement bootstrap script. */
const modernEnhancementsClientModule = fileURLToPath(
    new URL("src/js/modern-enhancements.ts", import.meta.url)
);

/** PWA theme-color meta value for Chromium-based browsers. */
const pwaThemeColor = "#2E2A33";
/** Windows tile color for pinned-site metadata. */
const pwaTileColor = "#2E2A33";
/** Safari pinned-tab mask icon color. */
const pwaMaskIconColor = "#71B041";
/** Footer copyright HTML used by the site theme config. */
const footerCopyright =
    `© ${new Date().getFullYear()} ` +
    '<a href="https://github.com/Nick2bad4u/" target="_blank" rel="noopener noreferrer">Nick2bad4u</a> 💻 Built with ' +
    '<a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">🦖 Docusaurus</a>.';

/** Obfuscated key for the v4 legacy post-build head attribute removal flag. */
const removeHeadAttrFlagKey = [
    "remove",
    "Le",
    "gacyPostBuildHeadAttribute",
].join("");

/** Local require helper rooted at the docs workspace config file location. */
const requireFromDocsWorkspace = createRequire(import.meta.url);

/** Resolve an optional module specifier without throwing when absent. */
const resolveOptionalModule = (moduleSpecifier: string): string | undefined => {
    try {
        return requireFromDocsWorkspace.resolve(moduleSpecifier);
    } catch {
        return undefined;
    }
};

/** Check whether a dynamic value can be read as an object record. */
const isRecordLike = (
    candidate: unknown
): candidate is Readonly<Record<string, unknown>> =>
    typeof candidate === "object" && candidate !== null;

/**
 * Optional ESM entry used to avoid webpack warnings from VS Code CSS language
 * service packages.
 */
const vscodeCssLanguageServiceEsmEntry = resolveOptionalModule(
    "vscode-css-languageservice/lib/esm/cssLanguageService.js"
);
/**
 * Optional ESM entry used to avoid webpack warnings from VS Code language
 * server type packages.
 */
const vscodeLanguageServerTypesEsmEntry = resolveOptionalModule(
    "vscode-languageserver-types/lib/esm/main.js"
);

/**
 * Alias VS Code language-service packages to their ESM entries when they are
 * present.
 *
 * @remarks
 * Some transitive editor-style dependencies resolve the UMD build of
 * `vscode-languageserver-types`, which causes noisy webpack critical-dependency
 * warnings inside Docusaurus. This plugin only activates when those optional
 * packages are actually installed in the current workspace.
 */
const suppressKnownWebpackWarningsPlugin: PluginModule = () => ({
    configureWebpack() {
        return {
            ignoreWarnings: [
                /**
                 * Suppress the known webpack critical-dependency warning
                 * emitted by the UMD build of vscode-languageserver-types.
                 *
                 * We already alias to the ESM entry when available, but some
                 * transitive resolution paths still surface the UMD warning
                 * during docs builds. This is third-party noise, not a
                 * site-level problem.
                 */
                (warning: unknown) => {
                    const warningMessage =
                        isRecordLike(warning) &&
                        typeof warning["message"] === "string"
                            ? warning["message"]
                            : undefined;

                    return (
                        typeof warningMessage === "string" &&
                        warningMessage.includes(
                            "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted"
                        )
                    );
                },
            ],
            resolve: {
                alias: {
                    ...(vscodeCssLanguageServiceEsmEntry === undefined
                        ? {}
                        : {
                              "vscode-css-languageservice$":
                                  vscodeCssLanguageServiceEsmEntry,
                          }),
                    ...(vscodeLanguageServerTypesEsmEntry === undefined
                        ? {}
                        : {
                              "vscode-languageserver-types$":
                                  vscodeLanguageServerTypesEsmEntry,
                              "vscode-languageserver-types/lib/umd/main.js$":
                                  vscodeLanguageServerTypesEsmEntry,
                          }),
                },
            },
        };
    },
    name: "suppress-known-webpack-warnings",
});

/** Docusaurus future flags, including optional experimental fast path. */
const futureConfig = {
    ...(enableExperimentalFaster
        ? {
              faster: {
                  mdxCrossCompilerCache: true,
                  rspackBundler: true,
                  rspackPersistentCache: true,
                  ssgWorkerThreads: true,
              },
          }
        : {}),
    v4: {
        // Keep Faster opt-in only. The docs workspace already exposes
        // `build:fast` for the experimental native/Rspack path, and making it
        // the default causes plain CI builds to require extra platform-native
        // bindings such as `@swc/html-linux-x64-gnu`.
        //
        // Without this guard, `docusaurus build` can unexpectedly fail on
        // Linux even when `DOCUSAURUS_ENABLE_EXPERIMENTAL` is not set.
        fasterByDefault: false,
        mdx1CompatDisabledByDefault: true,
        [removeHeadAttrFlagKey]: true,
        removeLegacyPostBuildHeadAttribute: true,
        // NOTE: Enabling cascade layers currently breaks our production CSS output
        // (CssMinimizer parsing errors -> large chunks of CSS dropped), which
        // makes many Infima (--ifm-*) variables undefined across the site.
        // Re-enable only after verifying the build output CSS is valid.
        siteStorageNamespacing: true,
        useCssCascadeLayers: false,
    },
} satisfies Config["future"];

/** Full Docusaurus site configuration exported to the build/runtime. */
const config = {
    baseUrl,
    baseUrlIssueBanner: true,
    clientModules: [modernEnhancementsClientModule],
    deploymentBranch: "gh-pages",
    favicon: "img/favicon.ico",
    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: futureConfig,
    headTags: [
        {
            attributes: {
                href: siteOrigin,
                rel: "preconnect",
            },
            tagName: "link",
        },
        {
            attributes: {
                href: "https://github.com",
                rel: "preconnect",
            },
            tagName: "link",
        },
        {
            attributes: {
                type: "application/ld+json",
            },
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                description: siteDescription,
                image: socialCardImageUrl,
                name: `${projectName} Documentation`,
                publisher: {
                    "@type": "Person",
                    name: "Nick2bad4u",
                    url: "https://github.com/Nick2bad4u",
                },
                url: siteUrl,
            }),
            tagName: "script",
        },
    ],
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
        suppressKnownWebpackWarningsPlugin,
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
                        href: `${baseUrl}img/logo_192x192.png`,
                        rel: "apple-touch-icon",
                        tagName: "link",
                    },
                    {
                        color: pwaMaskIconColor,
                        href: `${baseUrl}img/logo.svg`,
                        rel: "mask-icon",
                        tagName: "link",
                    },
                    {
                        content: `${baseUrl}img/logo_192x192.png`,
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
                editUrl: `https://github.com/${organizationName}/${projectName}/blob/main/docs/`,
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
                blog: {
                    blogDescription: projectBlogDescription,
                    blogSidebarCount: "ALL",
                    blogSidebarTitle: "All posts",
                    blogTitle: `${projectName} Blog`,
                    editUrl: `https://github.com/${organizationName}/${projectName}/blob/main/docs/docusaurus/`,
                    feedOptions: {
                        copyright: `© ${new Date().getFullYear()} Nick2bad4u`,
                        description: projectBlogDescription,
                        language: "en",
                        title: `${projectName} Blog`,
                        type: ["rss", "atom"],
                        xslt: true,
                    },
                    onInlineAuthors: "warn",
                    onInlineTags: "warn",
                    onUntruncatedBlogPosts: "warn",
                    path: "blog",
                    postsPerPage: 10,
                    routeBasePath: "blog",
                    showReadingTime: true,
                },
                debug:
                    globalThis.process.env[
                        "DOCUSAURUS_PRESET_CLASSIC_DEBUG"
                    ] === "true",
                docs: {
                    breadcrumbs: true,
                    editUrl: `https://github.com/${organizationName}/${projectName}/blob/main/docs/docusaurus/`,
                    includeCurrentVersion: true,
                    onInlineTags: "ignore",
                    path: "site-docs",
                    routeBasePath: "docs",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    sidebarCollapsed: true,
                    sidebarCollapsible: true,
                    sidebarPath: "./sidebars.ts",
                },
                googleTagManager: {
                    containerId: "GTM-T8J6HPLF",
                },
                gtag: {
                    trackingID: "G-18DR1S6R1T",
                },
                pages: {
                    editUrl: `https://github.com/${organizationName}/${projectName}/blob/main/docs/docusaurus/`,
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
                    filename: "sitemap.xml",
                    ignorePatterns: ["/tests/**"],
                    lastmod: "datetime",
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
    staticDirectories: ["static"],
    storage: {
        namespace: true,
        type: "localStorage",
    },
    tagline: projectTagline,
    themeConfig: {
        colorMode: {
            defaultMode: "dark",
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        footer: {
            copyright: footerCopyright,
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
                            label: "🛠️ Presets",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "📏 Rule Reference",
                            to: "/docs/rules",
                        },
                    ],
                    title: "📚 Explore",
                },
                {
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}/releases`,
                            label: "\uEB09 Releases",
                        },
                        {
                            href: `https://nick2bad4u.github.io/${projectName}/eslint-inspector/`,
                            label: "\uE7D2 ESLint Inspector",
                        },
                        {
                            href: `https://www.npmjs.com/package/ts-extras`,
                            label: "\uF113 ts-extras",
                        },
                        {
                            href: `https://www.npmjs.com/package/type-fest`,
                            label: "\uE65B type-fest",
                        },
                    ],
                    title: "📁 Project",
                },
                {
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "\uEA84 GitHub Repository",
                        },
                        {
                            href: `https://nick2bad4u.github.io/${projectName}/stylelint-inspector/`,
                            label: "\uE7D2 Stylelint Inspector",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}/issues`,
                            label: "\uF188 Report Issues",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "\uE616 NPM",
                        },
                    ],
                    title: "⚙️ Support",
                },
            ],
            logo: {
                alt: `${projectName} logo`,
                height: 60,
                href: `https://github.com/${organizationName}/${projectName}`,
                src: "img/logo.svg",
                width: 60,
            },
            style: "dark",
        },
        image: socialCardImagePath,
        metadata: [
            {
                content: projectKeywords,
                name: "keywords",
            },
            {
                content: "summary_large_image",
                name: "twitter:card",
            },
            {
                content: projectName,
                property: "og:site_name",
            },
        ],
        navbar: {
            hideOnScroll: true,
            items: [
                {
                    activeBaseRegex: "^/docs/rules/overview/?$",
                    items: [
                        {
                            label: "• Overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "• Getting Started",
                            to: "/docs/rules/getting-started",
                        },
                        {
                            label: "• Adoption & Rollout",
                            to: "/docs/rules/category/-adoption--rollout",
                        },
                    ],
                    label: "📚 Docs",
                    position: "left",
                    to: "/docs/rules/overview",
                    type: "dropdown",
                },
                {
                    activeBaseRegex: "^/docs/rules(?:/(?!presets(?:/|$)).*)?$",
                    items: [
                        {
                            label: "• Rule Reference",
                            to: "/docs/rules",
                        },
                        {
                            label: "💠 Rules for ts-extras",
                            to: "/docs/rules/category/ts-extras",
                        },
                        {
                            label: "✴️ Rules for type-fest",
                            to: "/docs/rules/category/type-fest",
                        },
                    ],
                    label: "📜 Rules",
                    position: "left",
                    to: "/docs/rules",
                    type: "dropdown",
                },
                {
                    activeBaseRegex: "^/docs/rules/presets(?:/.*)?$",
                    items: [
                        {
                            label: "• Preset Reference",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "🟢 Minimal",
                            to: "/docs/rules/presets/minimal",
                        },
                        {
                            label: "🟡 Recommended",
                            to: "/docs/rules/presets/recommended",
                        },
                        {
                            label: "🔴 Strict",
                            to: "/docs/rules/presets/strict",
                        },
                        {
                            label: "🟣 All",
                            to: "/docs/rules/presets/all",
                        },
                        {
                            label: "🧪 Experimental",
                            to: "/docs/rules/presets/experimental",
                        },
                        {
                            label: "💠 type-fest",
                            to: "/docs/rules/presets/type-fest-types",
                        },
                        {
                            label: "✴️ ts-extras",
                            to: "/docs/rules/presets/ts-extras-type-guards",
                        },
                    ],
                    label: "🛠️ Presets",
                    position: "left",
                    to: "/docs/rules/presets",
                    type: "dropdown",
                },
                {
                    href: `https://github.com/${organizationName}/${projectName}`,
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "• \uE709 GitHub",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "• \uE616 NPM",
                        },
                        {
                            className: "navbar-dropdown-divider-before",
                            href: `https://github.com/sindresorhus/type-fest`,
                            label: "💠 \uE709 type-fest",
                        },
                        {
                            href: `https://www.npmjs.com/package/type-fest`,
                            label: "💠 \uE616 type-fest",
                        },
                        {
                            className: "navbar-dropdown-divider-before",
                            href: `https://github.com/sindresorhus/ts-extras`,
                            label: "✴️ \uE709 ts-extras",
                        },
                        {
                            href: `https://www.npmjs.com/package/ts-extras`,
                            label: "✴️ \uE616 ts-extras",
                        },
                    ],
                    label: "\uE65B GitHub",
                    position: "right",
                    type: "dropdown",
                },
                {
                    items: [
                        {
                            label: "• Development Guide",
                            to: "/docs/developer",
                        },
                        {
                            label: "• API Reference",
                            to: "/docs/developer/api",
                        },
                        {
                            label: "• ADRs",
                            to: "/docs/developer/adr",
                        },
                        {
                            label: "• Types",
                            to: "/docs/category/types",
                        },
                        {
                            label: "• Charts",
                            to: "/docs/developer/charts",
                        },
                        {
                            label: "• Internals",
                            to: "/docs/category/runtime",
                        },
                    ],
                    label: "\uDB80\uDE19 Dev",
                    position: "right",
                    to: "/docs/developer",
                    type: "dropdown",
                },
                {
                    items: [
                        {
                            label: "• Latest Posts",
                            to: "/blog",
                        },
                        {
                            label: "• All Posts",
                            to: "/blog/archive",
                        },
                    ],
                    label: "\uEAA4 Blog",
                    position: "right",
                    to: "/blog",
                    type: "dropdown",
                },
            ],
            logo: {
                alt: `${projectName} logo`,
                height: 48,
                href: baseUrl,
                src: "img/logo.svg",
                width: 48,
            },
            style: "dark",
            title: projectName,
        },
        prism: {
            additionalLanguages: ["bash", "json", "yaml", "typescript"],
            darkTheme: prismThemes.dracula,
            defaultLanguage: "typescript",
            theme: prismThemes.github,
        },
        tableOfContents: {
            maxHeadingLevel: 4,
            minHeadingLevel: 2,
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
                searchBarPosition: "left",
                searchBarShortcut: true,
                searchBarShortcutHint: true,
                searchBarShortcutKeymap: "ctrl+k",
                searchResultContextMaxLength: 96,
                searchResultLimits: 8,
                useAllContextsWithNoSearchContext: false,
            },
        ],
    ],
    title: projectName,
    titleDelimiter: "|",
    trailingSlash: true,
    url: siteOrigin,
} satisfies Config;

export default config;
