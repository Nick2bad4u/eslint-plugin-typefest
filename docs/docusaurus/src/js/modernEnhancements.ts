/**
 * @packageDocumentation
 * Subtle client-side interaction enhancements for the Docusaurus site.
 */

type CleanupFunction = () => void;

type CleanupRef = {
    current: CleanupFunction | null;
};

declare global {
    interface Window {
        initializeAdvancedFeatures?: typeof initializeAdvancedFeatures;
    }
}

const ROUTE_REFRESH_DELAY_MS = 100;

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
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const safeHeight = docHeight > 0 ? docHeight : 1;
        const scrollPercent = (scrollTop / safeHeight) * 100;
        indicator.style.width = `${Math.max(0, Math.min(100, scrollPercent))}%`;
    };

    window.addEventListener("scroll", update, { passive: true });
    update();

    return (): void => {
        window.removeEventListener("scroll", update);
        indicator.remove();
    };
}

/**
 * Apply a subtle animation to the theme toggle control.
 *
 * @returns Cleanup callback that removes click listeners and pending timers.
 */
function applyThemeToggleAnimation(): CleanupFunction {
    const themeToggle = document.querySelector('[aria-label*="color mode"], [title*="Switch"]');

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

    themeToggle.addEventListener("click", handleClick);

    return (): void => {
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = null;
        }

        themeToggle.removeEventListener("click", handleClick);
    };
}

/**
 * Initialize modern interaction features and return cleanup hooks.
 *
 * @returns Cleanup callback for all registered enhancement handlers.
 */
function initializeAdvancedFeatures(): CleanupFunction {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanupFunctions: CleanupFunction[] = [];

    cleanupFunctions.push(createScrollIndicator());

    if (!prefersReducedMotion) {
        cleanupFunctions.push(applyThemeToggleAnimation());
    }

    return (): void => {
        cleanupFunctions.forEach((cleanup) => {
            cleanup();
        });
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

    const setupEnhancements = (): void => {
        cleanupRef.current?.();
        cleanupRef.current = initializeAdvancedFeatures();
    };

    const handleDOMContentLoaded = (): void => {
        setupEnhancements();
        document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
    } else {
        setupEnhancements();
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
        cleanupRef.current?.();

        if (routeChangeTimer) {
            clearTimeout(routeChangeTimer);
            routeChangeTimer = null;
        }

        observer.disconnect();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return (): void => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        handleBeforeUnload();
    };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
    initializeEnhancements();
    window.initializeAdvancedFeatures = initializeAdvancedFeatures;
}

export { initializeAdvancedFeatures, initializeEnhancements };
export default initializeEnhancements;
