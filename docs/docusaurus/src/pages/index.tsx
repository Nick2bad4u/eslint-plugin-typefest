import type { JSX } from "react";

import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";

import GitHubStats from "../components/GitHubStats";
import styles from "./index.module.css";

interface HeroBadge {
    readonly description: string;
    readonly icon: string;
    readonly label: string;
}

interface HeroStat {
    readonly description: string;
    readonly headline: string;
}

interface HomeCard {
    readonly description: string;
    readonly icon: string;
    readonly title: string;
    readonly to: string;
}

/**
 * Hero badges Note: These icons are from the "Nerd Font Symbols" font.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const heroBadges = [
    {
        description: "Drop-in config for ESLint v9+ and modern repos.",
        icon: "\uF013",
        label: "Flat Config native",
    },
    {
        description: "Type-aware guidance without sacrificing readability.",
        icon: "\uE628",
        label: "TypeScript-first",
    },
    {
        description: "Clear diagnostics with safe autofixes and suggestions.",
        icon: "\uF0AD",
        label: "Actionable rule docs",
    },
] as const satisfies readonly HeroBadge[];

/**
 * Hero stats Note: These icons are from the "Nerd Font Symbols" font.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const heroStats = [
    {
        description: "Type-safe patterns from type-fest and ts-extras.",
        headline: "\uF0CA 70+ Rules",
    },
    {
        description: "Start small, then scale to stricter coverage.",
        headline: "\uE690 6 Presets",
    },
    {
        description: "Safe rewrites where semantics are preserved.",
        headline: "\uDB80\uDC68 DX-first Autofix & Suggestions",
    },
] as const satisfies readonly HeroStat[];

/**
 * Button icons Note: These icons are from the "Nerd Font Symbols" font.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const overviewButtonIcon = "\uDB81\uDF1D";
const comparePresetsButtonIcon = "\uDB85\uDC92";
const heroKickerIcon = "\uF0AD";
const heroKickerIcon2 = "\uF135";
const packageName = "eslint-plugin-typefest";
const homepageDescription = `Explore ${packageName} documentation, presets, and rule references for adopting type-fest and ts-extras patterns in modern TypeScript projects.`;
const homepageKeywords = `${packageName}, type-fest, ts-extras, eslint rules, typescript linting, flat config`;
const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: `https://github.com/Nick2bad4u/${packageName}`,
    description: homepageDescription,
    image: `https://nick2bad4u.github.io/${packageName}/img/logo.png`,
    license: `https://github.com/Nick2bad4u/${packageName}/blob/main/LICENSE`,
    name: packageName,
    programmingLanguage: "TypeScript",
    runtimePlatform: "Node.js",
    url: `https://nick2bad4u.github.io/${packageName}/`,
} as const;
const homepageSocialImageUrl = `https://nick2bad4u.github.io/${packageName}/img/logo.png`;

/**
 * Home card icons Note: These icons are from the "Nerd Font Symbols" font,
 * which is included in the site styles. If you change these icons, make sure to
 * choose ones that exist in that font or adjust the font-family in the CSS
 * accordingly.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const homeCards = [
    {
        description:
            "Install the plugin, enable a preset, and start enforcing type-safe ts-extras and type-fest patterns.",
        icon: "\uF135",
        title: "Get Started",
        to: "/docs/rules/getting-started",
    },
    {
        description:
            "Choose the right preset for your team, from minimal baseline to full strict coverage.",
        icon: "\uE690",
        title: "Presets",
        to: "/docs/rules/presets",
    },
    {
        description:
            "Browse every rule with concrete incorrect/correct examples and migration guidance.",
        icon: "\uF02D",
        title: "Rule Reference",
        to: "/docs/rules",
    },
] as const satisfies readonly HomeCard[];

/**
 * Render the Docusaurus landing page for the documentation site.
 */
export default function Home(): JSX.Element {
    const logoSrc = useBaseUrl("/img/logo.svg");

    return (
        <Layout
            description={homepageDescription}
            title="Type-safe ESLint rules for type-fest and ts-extras"
        >
            <Head>
                <meta content={homepageKeywords} name="keywords" />
                <meta content={homepageSocialImageUrl} property="og:image" />
                <meta content="summary_large_image" name="twitter:card" />
                <meta content={homepageSocialImageUrl} name="twitter:image" />
                <script type="application/ld+json">
                    {JSON.stringify(homepageStructuredData)}
                </script>
            </Head>
            <header className={styles.heroBanner}>
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroGrid}>
                        <div>
                            <p className={styles.heroKicker}>
                                {`${heroKickerIcon} ESLint plugin for modern TypeScript teams ${heroKickerIcon2}`}
                            </p>
                            <Heading as="h1" className={styles.heroTitle}>
                                {packageName}
                            </Heading>
                            <p className={styles.heroSubtitle}>
                                ESLint rules that recommend safer, clearer
                                TypeScript types, type guards, and other
                                patterns by utilizing{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkTypeFest}`}
                                    href="https://github.com/sindresorhus/type-fest"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    type-fest
                                </Link>{" "}
                                and{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkTsExtras}`}
                                    href="https://github.com/sindresorhus/ts-extras"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    ts-extras
                                </Link>
                            </p>

                            <div className={styles.heroBadgeRow}>
                                {heroBadges.map((badge) => (
                                    <article
                                        className={styles.heroBadge}
                                        key={badge.label}
                                    >
                                        <p className={styles.heroBadgeLabel}>
                                            <span
                                                aria-hidden="true"
                                                className={styles.heroBadgeIcon}
                                            >
                                                {badge.icon}
                                            </span>
                                            {badge.label}
                                        </p>
                                        <p
                                            className={
                                                styles.heroBadgeDescription
                                            }
                                        >
                                            {badge.description}
                                        </p>
                                    </article>
                                ))}
                            </div>

                            <div className={styles.heroActions}>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionPrimary}`}
                                    to="/docs/rules/overview"
                                >
                                    {overviewButtonIcon} Start with Overview
                                </Link>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionSecondary}`}
                                    to="/docs/rules/presets"
                                >
                                    {comparePresetsButtonIcon} Compare Presets
                                </Link>
                            </div>
                        </div>

                        <aside className={styles.heroPanel}>
                            <img
                                alt={`${packageName} logo`}
                                className={styles.heroPanelLogo}
                                decoding="async"
                                height="240"
                                loading="eager"
                                src={logoSrc}
                                width="240"
                            />
                        </aside>
                    </div>

                    <GitHubStats className={styles.heroLiveBadges} />

                    <div className={styles.heroStats}>
                        {heroStats.map((stat) => (
                            <article
                                className={styles.heroStatCard}
                                key={stat.headline}
                            >
                                <p className={styles.heroStatHeading}>
                                    {stat.headline}
                                </p>
                                <p className={styles.heroStatDescription}>
                                    {stat.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {homeCards.map((card) => (
                            <article className={styles.card} key={card.title}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.cardIcon}>
                                        {card.icon}
                                    </p>
                                    <Heading
                                        as="h2"
                                        className={styles.cardTitle}
                                    >
                                        {card.title}
                                    </Heading>
                                </div>
                                <p className={styles.cardDescription}>
                                    {card.description}
                                </p>
                                <Link className={styles.cardLink} to={card.to}>
                                    Open section →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}
