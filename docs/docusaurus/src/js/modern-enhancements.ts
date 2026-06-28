/**
 * @packageDocumentation
 * Subtle client-side interaction enhancements for the Docusaurus site.
 */

/** Teardown callback returned by enhancement initializers. */
type CleanupFunction = () => void;

/** Mutable holder used to swap active cleanup handlers between route refreshes. */
interface CleanupRef {
    current: CleanupFunction | null;
}

declare global {
    interface Window {
        initializeAdvancedFeatures?: typeof initializeAdvancedFeatures;
    }
}

/** Delay before re-initializing effects after client-side route transitions. */
const ROUTE_REFRESH_DELAY_MS = 100;

/** Delay used to let initial React hydration finish before mutating the DOM. */
const INITIAL_HYDRATION_DELAY_MS = 0;

/** Supported TypeDoc runtime item prefixes rendered in sidebar labels. */
const runtimeSidebarKindPrefixes = [
    "Accessor:",
    "Class:",
    "Enum:",
    "Function:",
    "Interface:",
    "Method:",
    "Namespace:",
    "Property:",
    "Type:",
    "Type Alias:",
    "Variable:",
] as const;

/** Stored mutation record used to restore labels during cleanup. */
interface SidebarLabelMutation {
    element: HTMLAnchorElement;
    originalLabel: string;
}

/** Dataset key used to mark links already tokenized by this enhancer. */
const SIDEBAR_TOKENIZED_DATA_KEY = "sbTokenized";

/**
 * Enhance sidebar readability by tinting leading label tokens.
 *
 * @returns Cleanup callback that restores original labels.
 */
function applySidebarLabelTokenColoring(): CleanupFunction {
    const mutations: SidebarLabelMutation[] = [];

    const processLinks = (sidebarLinks: readonly HTMLAnchorElement[]): void => {
        for (const link of sidebarLinks) {
            if (isSidebarLinkTokenized(link)) {
                continue;
            }

            const linkLabel = link.textContent.trim();

            if (!linkLabel) {
                continue;
            }

            if (isRuntimeSidebarLink(link)) {
                const runtimePrefix = getRuntimeSidebarKindPrefix(linkLabel);

                if (runtimePrefix !== null) {
                    const remainderText = linkLabel
                        .slice(runtimePrefix.length)
                        .trimStart();

                    if (remainderText.length > 0) {
                        mutations.push({
                            element: link,
                            originalLabel: linkLabel,
                        });

                        setSidebarLeadingToken({
                            link,
                            remainderText,
                            separator: "",
                            tokenClassName: "sb-inline-runtime-kind",
                            tokenText: `${runtimePrefix}\u00A0`,
                        });
                    }

                    continue;
                }
            }

            if (isNumberedRuleSidebarLink(link)) {
                const ruleNumberPrefix = getRuleNumberPrefix(linkLabel);

                if (ruleNumberPrefix !== null) {
                    mutations.push({
                        element: link,
                        originalLabel: linkLabel,
                    });

                    setSidebarLeadingToken({
                        link,
                        remainderText: ruleNumberPrefix.remainder,
                        tokenClassName: "sb-inline-rule-number",
                        tokenText: ruleNumberPrefix.numberToken,
                    });
                }
            }
        }
    };

    const processSidebarMenuLinks = (): void => {
        const sidebarLinks = document.querySelectorAll<HTMLAnchorElement>(
            ".theme-doc-sidebar-menu .menu__link"
        );

        processLinks([...sidebarLinks]);
    };

    processSidebarMenuLinks();

    const sidebarMenu = document.querySelector<HTMLElement>(
        ".theme-doc-sidebar-menu"
    );

    let sidebarRefreshTimer: null | ReturnType<typeof setTimeout> = null;

    const scheduleSidebarRefresh = (): void => {
        if (sidebarRefreshTimer) {
            clearTimeout(sidebarRefreshTimer);
        }

        sidebarRefreshTimer = setTimeout(() => {
            processSidebarMenuLinks();
            sidebarRefreshTimer = null;
        }, 0);
    };

    const handleSidebarInteraction = (): void => {
        scheduleSidebarRefresh();
    };

    const sidebarObserver =
        sidebarMenu === null
            ? null
            : new MutationObserver((records) => {
                  const addedLinks: HTMLAnchorElement[] = [];

                  for (const record of records) {
                      for (const addedNode of record.addedNodes) {
                          if (!(addedNode instanceof HTMLElement)) {
                              continue;
                          }

                          if (isAnchorElement(addedNode)) {
                              addedLinks.push(addedNode);
                          }

                          const nestedLinks =
                              addedNode.querySelectorAll<HTMLAnchorElement>(
                                  "a.menu__link"
                              );
                          addedLinks.push(...nestedLinks);
                      }
                  }

                  if (addedLinks.length > 0) {
                      processLinks(addedLinks);
                      return;
                  }

                  scheduleSidebarRefresh();
              });

    sidebarObserver?.observe(sidebarMenu ?? document.body, {
        childList: true,
        subtree: true,
    });

    const sidebarAbortController = new AbortController();
    sidebarMenu?.addEventListener("click", handleSidebarInteraction, {
        signal: sidebarAbortController.signal,
    });

    return (): void => {
        sidebarMenu?.removeEventListener("click", handleSidebarInteraction);
        sidebarAbortController.abort();
        sidebarObserver?.disconnect();

        if (sidebarRefreshTimer) {
            clearTimeout(sidebarRefreshTimer);
            sidebarRefreshTimer = null;
        }

        for (const mutation of mutations) {
            if (!mutation.element.isConnected) {
                continue;
            }

            mutation.element.dataset[SIDEBAR_TOKENIZED_DATA_KEY] = "";
            mutation.element.textContent = mutation.originalLabel;
        }
    };
}

/**
 * Apply a subtle animation to the theme toggle control.
 *
 * @returns Cleanup callback that removes click listeners and pending timers.
 */
function applyThemeToggleAnimation(): CleanupFunction {
    const themeToggle = document.querySelector(
        '[aria-label*="color mode"], [title*="Switch"]'
    );

    if (!isHTMLElement(themeToggle)) {
        return (): void => {
            // No-op when theme toggle is not present.
        };
    }

    let animationTimer: null | ReturnType<typeof setTimeout> = null;

    const handleClick = (): void => {
        themeToggle.style.transform = "scale(0.94)";
        themeToggle.style.transition = "transform 120ms ease";

        if (animationTimer) {
            clearTimeout(animationTimer);
        }

        animationTimer = setTimeout(() => {
            themeToggle.style.transform = "scale(1)";
            animationTimer = null;
        }, 90);
    };

    const themeToggleAbortController = new AbortController();
    themeToggle.addEventListener("click", handleClick, {
        signal: themeToggleAbortController.signal,
    });

    return (): void => {
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = null;
        }

        themeToggle.removeEventListener("click", handleClick);
        themeToggleAbortController.abort();
    };
}

/**
 * Create and maintain a top-page scroll progress indicator.
 *
 * @returns Cleanup callback that removes listeners and indicator markup.
 */
function createScrollIndicator(): CleanupFunction {
    const indicator = document.createElement("div");
    indicator.className = "scroll-indicator";
    indicator.style.cssText = [
        "position: fixed",
        "inset-block-start: 0",
        "inset-inline-start: 0",
        "z-index: 9999",
        "height: 3px",
        "width: 0%",
        "background: linear-gradient(90deg, var(--ifm-color-primary), var(--ifm-color-primary-light))",
        "pointer-events: none",
        "transition: width 80ms linear",
    ].join(";");

    document.body.append(indicator);

    const update = (): void => {
        const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
        const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
        const safeHeight = docHeight > 0 ? docHeight : 1;
        const scrollPercent = (scrollTop / safeHeight) * 100;
        indicator.style.width = `${Math.max(0, Math.min(100, scrollPercent))}%`;
    };

    const scrollAbortController = new AbortController();
    // eslint-disable-next-line unicorn/prefer-observer-apis -- A continuous scroll-progress width needs exact document scroll position, not visibility thresholds.
    window.addEventListener("scroll", update, {
        passive: true,
        signal: scrollAbortController.signal,
    });
    update();

    return (): void => {
        window.removeEventListener("scroll", update);
        scrollAbortController.abort();
        indicator.remove();
    };
}

/**
 * Parse an optional numeric rule prefix from a sidebar label.
 *
 * @param label - Trimmed sidebar label.
 *
 * @returns Number token and remainder when label begins with digits.
 */
function getRuleNumberPrefix(
    label: string
): null | Readonly<{ numberToken: string; remainder: string }> {
    const match = /^(?<numberToken>\d{2,3}) (?<remainder>.+)$/u.exec(label);

    if (match === null) {
        return null;
    }

    const { numberToken, remainder } = match.groups ?? {};

    if (numberToken === undefined || remainder === undefined) {
        return null;
    }

    return {
        numberToken,
        remainder,
    };
}

/**
 * Detect runtime kind prefix in a sidebar label.
 *
 * @param label - Trimmed sidebar label.
 *
 * @returns Matching prefix when present.
 */
function getRuntimeSidebarKindPrefix(
    label: string
): (typeof runtimeSidebarKindPrefixes)[number] | null {
    for (const prefix of runtimeSidebarKindPrefixes) {
        if (label.startsWith(`${prefix} `)) {
            return prefix;
        }
    }

    return null;
}

/**
 * Initialize modern interaction features and return cleanup hooks.
 *
 * @returns Cleanup callback for all registered enhancement handlers.
 */
function initializeAdvancedFeatures(): CleanupFunction {
    const prefersReducedMotion = globalThis.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const cleanupFunctions = prefersReducedMotion
        ? [createScrollIndicator(), applySidebarLabelTokenColoring()]
        : [
              createScrollIndicator(),
              applySidebarLabelTokenColoring(),
              applyThemeToggleAnimation(),
          ];

    return (): void => {
        for (const cleanup of cleanupFunctions) {
            cleanup();
        }
    };
}

/**
 * Bootstrap enhancements on initial load and route transitions.
 *
 * @returns Cleanup callback that unregisters observers and listeners.
 */
function initializeEnhancements(): CleanupFunction {
    const cleanupRef: CleanupRef = {
        current: null,
    };
    let initialSetupFrame: null | number = null;
    let initialSetupTimer: null | ReturnType<typeof setTimeout> = null;

    const setupEnhancements = (): void => {
        cleanupRef.current?.();
        cleanupRef.current = initializeAdvancedFeatures();
    };

    const cancelInitialSetup = (): void => {
        if (initialSetupFrame !== null) {
            globalThis.cancelAnimationFrame(initialSetupFrame);
            initialSetupFrame = null;
        }

        if (initialSetupTimer !== null) {
            clearTimeout(initialSetupTimer);
            initialSetupTimer = null;
        }
    };

    const scheduleInitialSetup = (): void => {
        cancelInitialSetup();

        initialSetupFrame = globalThis.requestAnimationFrame(() => {
            initialSetupFrame = null;

            initialSetupTimer = setTimeout(() => {
                initialSetupTimer = null;
                setupEnhancements();
            }, INITIAL_HYDRATION_DELAY_MS);
        });
    };

    const handleWindowLoad = (): void => {
        scheduleInitialSetup();
    };

    const windowLoadAbortController = new AbortController();

    if (document.readyState === "complete") {
        scheduleInitialSetup();
    } else {
        window.addEventListener("load", handleWindowLoad, {
            once: true,
            signal: windowLoadAbortController.signal,
        });
    }

    let routeChangeTimer: null | ReturnType<typeof setTimeout> = null;
    let previousPathname = location.pathname;

    const observer = new MutationObserver(() => {
        if (location.pathname === previousPathname) {
            return;
        }

        previousPathname = location.pathname;

        if (routeChangeTimer) {
            clearTimeout(routeChangeTimer);
        }

        routeChangeTimer = setTimeout(() => {
            setupEnhancements();
            routeChangeTimer = null;
        }, ROUTE_REFRESH_DELAY_MS);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const handleBeforeUnload = (): void => {
        window.removeEventListener("load", handleWindowLoad);
        windowLoadAbortController.abort();
        cancelInitialSetup();
        cleanupRef.current?.();

        if (routeChangeTimer) {
            clearTimeout(routeChangeTimer);
            routeChangeTimer = null;
        }

        observer.disconnect();
    };

    const beforeUnloadAbortController = new AbortController();
    window.addEventListener("beforeunload", handleBeforeUnload, {
        signal: beforeUnloadAbortController.signal,
    });

    return (): void => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        beforeUnloadAbortController.abort();
        windowLoadAbortController.abort();
        handleBeforeUnload();
    };
}

/**
 * Check whether a node is an {@link HTMLAnchorElement}.
 *
 * @param element - DOM element candidate.
 *
 * @returns `true` when element is an `HTMLAnchorElement` instance.
 */
function isAnchorElement(element: Element): element is HTMLAnchorElement {
    return element instanceof HTMLAnchorElement;
}

/**
 * Check whether a node is an {@link HTMLElement}.
 *
 * @param element - DOM element candidate.
 *
 * @returns `true` when element is an `HTMLElement` instance.
 */
function isHTMLElement(element: Element | null): element is HTMLElement {
    return element instanceof HTMLElement;
}

/**
 * Check whether a sidebar link belongs to a numbered rules subsection.
 *
 * @param link - Candidate sidebar link.
 *
 * @returns `true` when link is in `ts-extras` or `type-fest` rule lists.
 */
function isNumberedRuleSidebarLink(link: HTMLAnchorElement): boolean {
    return (
        link.closest(".sb-cat-rules-ts-extras") !== null ||
        link.closest(".sb-cat-rules-type-fest") !== null
    );
}

/**
 * Check whether a sidebar link belongs to the runtime API category.
 *
 * @param link - Candidate sidebar link.
 *
 * @returns `true` when link is under `.sb-cat-api-runtime`.
 */
function isRuntimeSidebarLink(link: HTMLAnchorElement): boolean {
    return link.closest(".sb-cat-api-runtime") !== null;
}

/**
 * Check whether a sidebar link was already tokenized by this enhancer pass.
 *
 * @param link - Candidate sidebar link.
 *
 * @returns `true` when already tokenized.
 */
function isSidebarLinkTokenized(link: HTMLAnchorElement): boolean {
    const tokenizedValue = link.dataset[SIDEBAR_TOKENIZED_DATA_KEY];

    return tokenizedValue !== undefined && tokenizedValue.length > 0;
}

/**
 * Replace one sidebar link label with a highlighted leading token.
 *
 * @param options - Token replacement parameters.
 */
function setSidebarLeadingToken(
    options: Readonly<{
        link: HTMLAnchorElement;
        remainderText: string;
        separator?: string;
        tokenClassName: string;
        tokenText: string;
    }>
): void {
    const {
        link,
        remainderText,
        separator = " ",
        tokenClassName,
        tokenText,
    } = options;
    const token = document.createElement("span");

    token.className = tokenClassName;
    token.textContent = tokenText;
    link.dataset[SIDEBAR_TOKENIZED_DATA_KEY] = tokenClassName;

    link.replaceChildren(
        token,
        document.createTextNode(`${separator}${remainderText}`)
    );
}

if (typeof document !== "undefined") {
    initializeEnhancements();
    globalThis.window.initializeAdvancedFeatures = initializeAdvancedFeatures;
}

export { initializeAdvancedFeatures, initializeEnhancements };
export default initializeEnhancements;
