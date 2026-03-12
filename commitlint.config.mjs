/**
 * Commitlint configuration for eslint-plugin-typefest.
 *
 * Enforces Gitmoji commit format, e.g., ":sparkles: feat(core): add feature".
 *
 * Structure: `:gitmoji: type(scope?): subject`
 *
 * Example: `:bug: fix(rule): avoid false positive`
 *
 * @type {import("@commitlint/types").UserConfig}
 *
 * @typedef {import("@commitlint/types").UserConfig} CommitlintConfig
 *
 * @see {@link https://commitlint.js.org/ | Commitlint Documentation}
 * @see {@link https://www.conventionalcommits.org/ | Conventional Commits Specification}
 */

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isDependencyBumpCommit(commit) {
    return /^build\(deps.*\): bump/v.test(commit);
}

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isMergeCommit(commit) {
    return commit.includes("Merge");
}

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isReleaseCommit(commit) {
    return commit.startsWith("chore(release)");
}

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isRevertCommit(commit) {
    return commit.includes("Revert");
}

const commitlintConfig = /** @type {CommitlintConfig} */ ({
    $schema: "https://www.schemastore.org/commitlintrc.json",

    /**
     * Default ignore patterns.
     */
    defaultIgnores: true,

    /**
     * Extends the Gitmoji commitlint shareable configuration.
     */
    extends: ["commitlint-config-gitmoji"],

    /**
     * Help URL for commit format guidance.
     */
    helpUrl: "https://gitmoji.dev/",

    /**
     * Ignore certain commit patterns.
     */
    ignores: [
        isMergeCommit,
        isRevertCommit,
        isReleaseCommit,
        isDependencyBumpCommit,
    ],

    /**
     * Prompt configuration for interactive usage.
     */
    prompt: {
        questions: {
            body: {
                description: "Provide a longer description of the change",
            },
            breaking: {
                description: "Describe the breaking changes",
            },
            breakingBody: {
                description:
                    "A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
            },
            isBreaking: {
                description: "Are there any breaking changes?",
            },
            isIssueAffected: {
                description: "Does this change affect any open issues?",
            },
            issues: {
                description:
                    'Add issue references (e.g. "fix #123", "re #123")',
            },
            issuesBody: {
                description:
                    "If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
            },
            scope: {
                description:
                    "What is the scope of this change (e.g. component, service, utils)",
            },
            subject: {
                description:
                    "Write a short, imperative tense description of the change",
            },
            type: {
                description:
                    "Select the Gitmoji + type prefix for your commit (e.g., ':sparkles: feat'). Final header format: ':gitmoji: type(scope?): subject'.",
                enum: {
                    ":art: style": {
                        description:
                            "Changes that do not affect the meaning of the code",
                        emoji: "🎨",
                        title: "Styles",
                    },
                    ":broom: chore": {
                        description:
                            "Other changes that don't modify src or test files",
                        emoji: "🧹",
                        title: "Chores",
                    },
                    ":bug: fix": {
                        description: "A bug fix",
                        emoji: "🐛",
                        title: "Bug Fixes",
                    },
                    ":construction_worker: ci": {
                        description:
                            "Changes to our CI configuration files and scripts",
                        emoji: "👷",
                        title: "Continuous Integrations",
                    },
                    ":memo: docs": {
                        description: "Documentation only changes",
                        emoji: "📝",
                        title: "Documentation",
                    },
                    ":recycle: refactor": {
                        description:
                            "A code change that neither fixes a bug nor adds a feature",
                        emoji: "♻️",
                        title: "Code Refactoring",
                    },
                    ":rewind: revert": {
                        description: "Reverts a previous commit",
                        emoji: "⏪️",
                        title: "Reverts",
                    },
                    ":sparkles: feat": {
                        description: "A new feature",
                        emoji: "✨",
                        title: "Features",
                    },
                    ":white_check_mark: test": {
                        description:
                            "Adding missing tests or correcting existing tests",
                        emoji: "✅",
                        title: "Tests",
                    },

                    ":wrench: build": {
                        description:
                            "Changes that affect the build system or external dependencies",
                        emoji: "🔧",
                        title: "Builds",
                    },
                    ":zap: perf": {
                        description: "A code change that improves performance",
                        emoji: "⚡",
                        title: "Performance Improvements",
                    },
                },
            },
        },
    },

    /**
     * Custom rules for enhanced commit message validation.
     */
    rules: {
        "body-case": [
            1,
            "always",
            "sentence-case",
        ],

        // Body rules for detailed commits
        "body-leading-blank": [1, "always"],

        "body-max-line-length": [
            2,
            "always",
            160,
        ],

        // Footer rules for breaking changes and issue references
        "footer-leading-blank": [1, "always"],
        "footer-max-line-length": [
            2,
            "always",
            100,
        ],
        // Header rules
        "header-max-length": [
            2,
            "always",
            100,
        ],
        "header-min-length": [
            2,
            "always",
            10,
        ],

        "header-trim": [2, "always"],
        // References for issue tracking integration
        "references-empty": [0, "never"],
        // Scope case enforcement
        "scope-case": [
            2,
            "always",
            "kebab-case",
        ],

        // Scope validation - project-specific scopes
        "scope-enum": [
            2,
            "always",
            [
                // Frontend scopes
                "ui", // User interface components
                "components", // React components
                "stores", // Zustand state management
                "hooks", // React hooks
                "services", // Frontend services
                "utils", // Frontend utilities
                "theme", // Styling and theming
                "constants", // Frontend constants
                "types", // TypeScript type definitions

                // Electron scopes
                "main", // Electron main process
                "preload", // Preload scripts
                "ipc", // Inter-process communication
                "managers", // Business logic managers
                "database", // Database operations
                "events", // Event system
                "orchestrator", // UptimeOrchestrator

                // Core functionality scopes
                "monitoring", // Website monitoring features
                "notifications", // Notification system
                "analytics", // Analytics and reporting
                "settings", // Application settings
                "auth", // Authentication (if applicable)

                // Development scopes
                "config", // Configuration files
                "build", // Build system
                "deps", // Dependencies
                "test", // Testing
                "docs", // Documentation
                "scripts", // Build/deployment scripts
                "lint", // Linting configuration
                "format", // Code formatting
                "security", // Security configuration

                // Infrastructure scopes
                "docker", // Docker configuration
                "ci", // Continuous integration
                "cd", // Continuous deployment
                "release", // Release process
                "repo", // Repository-wide changes
            ],
        ],
        // Signed-off-by for contribution tracking (optional)
        //        "signed-off-by": [0, "never"],
        // Subject rules
        "subject-case": [
            2,
            "never",
            [
                "sentence-case",
                "start-case",
                "pascal-case",
                "upper-case",
            ],
        ],

        "subject-empty": [0, "never"],
        "subject-full-stop": [
            2,
            "never",
            ".",
        ],

        "subject-max-length": [
            2,
            "always",
            100,
        ],
        "subject-min-length": [
            2,
            "always",
            3,
        ],
        // Type and case enforcement
        "type-case": [
            2,
            "always",
            "lower-case",
        ],
        "type-empty": [0, "never"],
        // Type validation - allowed commit types
        "type-enum": [
            2,
            "always",
            [
                "build",
                "chore",
                "ci",
                "docs",
                "feat",
                "fix",
                "perf",
                "refactor",
                "revert",
                "style",
                "test",
                "wip",
            ],
        ],
        "type-max-length": [
            2,
            "always",
            20,
        ],
        "type-min-length": [
            2,
            "always",
            3,
        ],
    },
});

export default commitlintConfig;
