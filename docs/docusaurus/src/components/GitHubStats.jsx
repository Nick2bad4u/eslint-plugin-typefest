import Link from "@docusaurus/Link";

import styles from "../pages/index.module.css";

const liveBadges = [
    {
        alt: "npm license",
        href: "https://www.npmjs.com/package/eslint-plugin-typefest",
        src: "https://badgen.net/npm/license/eslint-plugin-typefest?icon=npm",
    },
    {
        alt: "npm total downloads",
        href: "https://www.npmjs.com/package/eslint-plugin-typefest",
        src: "https://badgen.net/npm/dt/eslint-plugin-typefest?icon=npm",
    },
    {
        alt: "latest GitHub release",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/releases",
        src: "https://badgen.net/github/release/Nick2bad4u/eslint-plugin-typefest?icon=github",
    },
    {
        alt: "GitHub stars",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/stargazers",
        src: "https://badgen.net/github/stars/Nick2bad4u/eslint-plugin-typefest?icon=github",
    },
    {
        alt: "GitHub forks",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/forks",
        src: "https://badgen.net/github/forks/Nick2bad4u/eslint-plugin-typefest?icon=github",
    },
    {
        alt: "GitHub open issues",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/issues",
        src: "https://badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-typefest?icon=github",
    },
];

/**
 * Renders live repository and package badges powered by badgen.net.
 *
 * @returns {JSX.Element} Badge strip with links to package/repository metadata.
 */
export default function GitHubStats() {
    return (
        <section className={styles.liveStatsSection}>
            <div className={styles.liveStatsHeader}>
                <p className={styles.liveStatsKicker}>Live project health</p>
                <p className={styles.liveStatsDescription}>
                    Real-time repository and package stats for this plugin.
                </p>
                <Link
                    className={styles.liveStatsLink}
                    href="https://github.com/Nick2bad4u/eslint-plugin-typefest"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open on GitHub →
                </Link>
            </div>

            <ul className={styles.liveBadgeList}>
                {liveBadges.map((badge) => (
                    <li key={badge.src} className={styles.liveBadgeListItem}>
                        <Link
                            className={styles.liveBadgeAnchor}
                            href={badge.href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                alt={badge.alt}
                                className={styles.liveBadgeImage}
                                src={badge.src}
                                loading="lazy"
                                decoding="async"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
