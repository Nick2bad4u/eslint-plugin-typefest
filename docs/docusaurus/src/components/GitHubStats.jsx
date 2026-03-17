import Link from "@docusaurus/Link";

import styles from "../pages/index.module.css";

const liveBadges = [
    {
        alt: "npm license",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/LICENSE",
        src: "https://flat.badgen.net/npm/license/eslint-plugin-typefest?color=purple",
    },
    {
        alt: "npm total downloads",
        href: "https://www.npmjs.com/package/eslint-plugin-typefest",
        src: "https://flat.badgen.net/npm/dt/eslint-plugin-typefest?color=pink",
    },
    {
        alt: "latest GitHub release",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/releases",
        src: "https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-typefest?color=cyan",
    },
    {
        alt: "GitHub stars",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/stargazers",
        src: "https://flat.badgen.net/github/stars/Nick2bad4u/eslint-plugin-typefest?color=yellow",
    },
    {
        alt: "GitHub forks",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/forks",
        src: "https://flat.badgen.net/github/forks/Nick2bad4u/eslint-plugin-typefest?color=green",
    },
    {
        alt: "GitHub open issues",
        href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/issues",
        src: "https://flat.badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-typefest?color=red",
    },
    {
        alt: "mutation testing badge",
        href: "https://dashboard.stryker-mutator.io/reports/github.com/Nick2bad4u/eslint-plugin-typefest/main",
        src: "https://img.shields.io/endpoint?style=flat-square&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FNick2bad4u%2Feslint-plugin-typefest%2Fmain",
    },
];

/**
 * Renders live repository, package, and mutation badges.
 *
 * @param {{ className?: string }} [props] - Optional list class override.
 *
 * @returns {JSX.Element} Badge strip with links to package/repository metadata.
 */
export default function GitHubStats({ className = "" } = {}) {
    const badgeListClassName = [styles.liveBadgeList, className]
        .filter(Boolean)
        .join(" ");

    return (
        <ul className={badgeListClassName}>
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
    );
}
