import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

const homeCards = [
    {
        title: "Get Started",
        description:
            "Install the plugin, enable a preset, and start enforcing type-safe ts-extras and type-fest patterns.",
        to: "/docs/rules/getting-started",
    },
    {
        title: "Presets",
        description:
            "Choose the right preset for your team, from minimal baseline to full strict coverage.",
        to: "/docs/rules/presets",
    },
    {
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
                <div className="container">
                    <Heading as="h1" className={styles.heroTitle}>
                        eslint-plugin-typefest
                    </Heading>
                    <p className={styles.heroSubtitle}>
                        Opinionated ESLint rules for safer, clearer TypeScript
                        patterns with type-fest and ts-extras.
                    </p>
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
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {homeCards.map((card) => (
                            <article key={card.title} className={styles.card}>
                                <Heading as="h2" className={styles.cardTitle}>
                                    {card.title}
                                </Heading>
                                <p className={styles.cardDescription}>
                                    {card.description}
                                </p>
                                <Link
                                    className={styles.cardLink}
                                    to={card.to}
                                >
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
