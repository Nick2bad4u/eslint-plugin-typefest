import type { JSX } from "react";

import Link from "@docusaurus/Link";

import styles from "./GitHubStats.module.css";

interface GitHubStatsProps {
    readonly className?: string;
}

interface LiveBadge {
    readonly alt: string;
    readonly href: string;
    readonly src: string;
}

const packageName = "eslint-plugin-typefest";
const repositorySlug = "Nick2bad4u/eslint-plugin-typefest";
const badgeBaseUrl = "https://flat.badgen.net";

const liveBadges = [
    {
        alt: "npm license",
        href: `https://github.com/${repositorySlug}/blob/main/LICENSE`,
        src: `${badgeBaseUrl}/npm/license/${packageName}?color=purple`,
    },
    {
        alt: "npm total downloads",
        href: `https://www.npmjs.com/package/${packageName}`,
        src: `${badgeBaseUrl}/npm/dt/${packageName}?color=pink`,
    },
    {
        alt: "latest GitHub release",
        href: `https://github.com/${repositorySlug}/releases`,
        src: `${badgeBaseUrl}/github/release/${repositorySlug}?color=cyan`,
    },
    {
        alt: "GitHub stars",
        href: `https://github.com/${repositorySlug}/stargazers`,
        src: `${badgeBaseUrl}/github/stars/${repositorySlug}?color=yellow`,
    },
    {
        alt: "GitHub forks",
        href: `https://github.com/${repositorySlug}/forks`,
        src: `${badgeBaseUrl}/github/forks/${repositorySlug}?color=green`,
    },
    {
        alt: "GitHub open issues",
        href: `https://github.com/${repositorySlug}/issues`,
        src: `${badgeBaseUrl}/github/open-issues/${repositorySlug}?color=red`,
    },
    {
        alt: "Codecov",
        href: `https://app.codecov.io/gh/${repositorySlug}`,
        src: `${badgeBaseUrl}/codecov/github/${repositorySlug}?color=blue`,
    },
] as const satisfies readonly LiveBadge[];

/**
 * Renders live repository, package, and mutation badges.
 *
 * @param props - Optional list class override.
 *
 * @returns Badge strip with links to package/repository metadata.
 */
export default function GitHubStats({
    className = "",
}: GitHubStatsProps): JSX.Element {
    const badgeListClassName = [styles.liveBadgeList, className]
        .filter(Boolean)
        .join(" ");

    return (
        <ul className={badgeListClassName}>
            {liveBadges.map((badge) => (
                <li className={styles.liveBadgeListItem} key={badge.src}>
                    <Link
                        className={styles.liveBadgeAnchor}
                        href={badge.href}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <img
                            alt={badge.alt}
                            className={styles.liveBadgeImage}
                            decoding="async"
                            loading="lazy"
                            src={badge.src}
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
