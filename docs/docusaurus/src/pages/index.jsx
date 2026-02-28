import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import GitHubStats from "../components/GitHubStats";

import styles from "./index.module.css";

const heroBadges = [
    {
        description: "Drop-in config for ESLint v9+ and modern repos.",
        icon: "⚙️",
        label: "Flat Config native",
    },
    {
        description: "Type-aware guidance without sacrificing readability.",
        icon: "🧠",
        label: "TypeScript-first",
    },
    {
        description: "Clear diagnostics with safe autofixes and suggestions.",
        icon: "🛠️",
        label: "Actionable rule docs",
    },
];

const heroChecklist = [
    "Phase adoption with focused presets.",
    "Keep migration practical and predictable.",
    "Improve consistency without boilerplate.",
];

const heroStats = [
    {
        description: "Type-safe patterns from type-fest and ts-extras.",
        icon: "📏",
        label: "Rules",
        value: "70+",
    },
    {
        description: "Start small, then scale to stricter coverage.",
        icon: "🎛️",
        label: "Presets",
        value: "6",
    },
    {
        description: "Safe rewrites where semantics are preserved.",
        icon: "✨",
        label: "Autofix & suggestions",
        value: "DX-first",
    },
];

const homeCards = [
    {
        icon: "🚀",
        title: "Get Started",
        description:
            "Install the plugin, enable a preset, and start enforcing type-safe ts-extras and type-fest patterns.",
        to: "/docs/rules/getting-started",
    },
    {
        icon: "🧭",
        title: "Presets",
        description:
            "Choose the right preset for your team, from minimal baseline to full strict coverage.",
        to: "/docs/rules/presets",
    },
    {
        icon: "📚",
        title: "Rule Reference",
        description:
            "Browse every rule with concrete incorrect/correct examples and migration guidance.",
        to: "/docs/rules",
    },
];

export default function Home() {
    return (
        <Layout
            title="eslint-plugin-typefest docs"
            description="Documentation for eslint-plugin-typefest"
        >
            <header className={styles.heroBanner}>
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroGrid}>
                        <div>
                            <p className={styles.heroKicker}>
                                ESLint plugin for modern TypeScript teams
                            </p>
                            <Heading as="h1" className={styles.heroTitle}>
                                eslint-plugin-typefest
                            </Heading>
                            <p className={styles.heroSubtitle}>
                                Opinionated ESLint rules for safer, clearer
                                TypeScript patterns with type-fest and
                                ts-extras.
                            </p>

                            <div className={styles.heroBadgeRow}>
                                {heroBadges.map((badge) => (
                                    <article
                                        key={badge.label}
                                        className={styles.heroBadge}
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
                                    className="button button--primary button--lg"
                                    to="/docs/rules/overview"
                                >
                                    Start with Overview
                                </Link>
                                <Link
                                    className="button button--secondary button--lg"
                                    to="/docs/rules/presets"
                                >
                                    Compare Presets
                                </Link>
                            </div>
                        </div>

                        <aside className={styles.heroPanel}>
                            <p className={styles.heroPanelKicker}>
                                Built for adoption
                            </p>
                            <Heading as="h2" className={styles.heroPanelTitle}>
                                Ship safer patterns without slowing teams down
                            </Heading>
                            <ul className={styles.heroChecklist}>
                                {heroChecklist.map((item) => (
                                    <li
                                        key={item}
                                        className={styles.heroChecklistItem}
                                    >
                                        <span aria-hidden="true">✅</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                className={styles.heroPanelLink}
                                to="/docs/rules"
                            >
                                Explore all rules →
                            </Link>
                        </aside>
                    </div>

                    <div className={styles.heroStats}>
                        {heroStats.map((stat) => (
                            <article
                                key={stat.label}
                                className={styles.heroStatCard}
                            >
                                <p className={styles.heroStatIcon}>
                                    {stat.icon}
                                </p>
                                <p className={styles.heroStatValue}>
                                    {stat.value}
                                </p>
                                <p className={styles.heroStatLabel}>
                                    {stat.label}
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
                    <Heading as="h2" className={styles.sectionTitle}>
                        Start where your team is today
                    </Heading>
                    <p className={styles.sectionSubtitle}>
                        Pick the path you need right now—quick onboarding,
                        preset comparison, or full rule-by-rule migration.
                    </p>
                    <GitHubStats />
                    <div className={styles.cardGrid}>
                        {homeCards.map((card) => (
                            <article key={card.title} className={styles.card}>
                                <p className={styles.cardIcon}>{card.icon}</p>
                                <Heading as="h2" className={styles.cardTitle}>
                                    {card.title}
                                </Heading>
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
