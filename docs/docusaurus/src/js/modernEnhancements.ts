/**
 * @packageDocumentation
 * Advanced client-side interaction enhancements for the Docusaurus site.
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
const MOBILE_WIDTH_BREAKPOINT = 768;

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
 * Apply subtle magnetic hover behavior to buttons.
 *
 * @returns Cleanup callback that removes all installed hover handlers.
 */
function initializeMagneticButtons(): CleanupFunction {
    const buttons = document.querySelectorAll(".button, .button-magnetic");
    const cleanupFunctions: CleanupFunction[] = [];

    buttons.forEach((button) => {
        if (!isHTMLElement(button)) {
            return;
        }

        const htmlButton = button;

        const handleMouseMove = (event: MouseEvent): void => {
            const rect = htmlButton.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            const moveX = x * 0.12;
            const moveY = y * 0.12;

            htmlButton.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
        };

        const handleMouseLeave = (): void => {
            htmlButton.style.transform = "translate(0, 0) scale(1)";
        };

        htmlButton.addEventListener("mousemove", handleMouseMove);
        htmlButton.addEventListener("mouseleave", handleMouseLeave);

        cleanupFunctions.push(() => {
            htmlButton.removeEventListener("mousemove", handleMouseMove);
            htmlButton.removeEventListener("mouseleave", handleMouseLeave);
            htmlButton.style.transform = "";
        });
    });

    return (): void => {
        cleanupFunctions.forEach((cleanup) => {
            cleanup();
        });
    };
}

/**
 * Apply fallback reveal-on-scroll animations for browsers without scroll timelines.
 *
 * @returns Cleanup callback that disconnects observer state.
 */
function initializeScrollAnimations(): CleanupFunction {
    if (CSS.supports("animation-timeline", "scroll()")) {
        return (): void => {
            // No-op when native scroll-driven animations are available.
        };
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || !isHTMLElement(entry.target)) {
                    return;
                }

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            });
        },
        {
            rootMargin: "0px 0px -50px 0px",
            threshold: 0.1,
        }
    );

    const animatedElements = document.querySelectorAll(
        ".content-card, .feature, .feature-item, h1, h2, h3, .markdown > div"
    );

    animatedElements.forEach((element) => {
        if (!isHTMLElement(element)) {
            return;
        }

        if (!element.style.opacity) {
            element.style.opacity = "0";
            element.style.transform = "translateY(20px)";
            element.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        }

        observer.observe(element);
    });

    return (): void => {
        observer.disconnect();
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
        themeToggle.style.transform = "scale(0.85) rotate(180deg)";
        themeToggle.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

        if (animationTimer) {
            clearTimeout(animationTimer);
        }

        animationTimer = setTimeout(() => {
            themeToggle.style.transform = "scale(1) rotate(0deg)";
            animationTimer = null;
        }, 150);
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
 * Add deterministic dynamic color accents for interactive nav elements.
 *
 * @returns Cleanup callback that removes accent listeners.
 */
function addDynamicColorAccents(): CleanupFunction {
    const accentElements = document.querySelectorAll(".navbar__link, .menu__link, .button");
    const cleanupFunctions: CleanupFunction[] = [];

    accentElements.forEach((element) => {
        if (!isHTMLElement(element)) {
            return;
        }

        const handleMouseEnter = (): void => {
            const hue = Date.now() % 360;
            element.style.setProperty("--dynamic-hue", `${hue}`);
            element.style.setProperty("--dynamic-color", `hsl(${hue}, 70%, 60%)`);
        };

        element.addEventListener("mouseenter", handleMouseEnter);

        cleanupFunctions.push(() => {
            element.removeEventListener("mouseenter", handleMouseEnter);
        });
    });

    return (): void => {
        cleanupFunctions.forEach((cleanup) => {
            cleanup();
        });
    };
}

/**
 * Add a lightweight cursor-follow radial gradient on desktop widths.
 *
 * @returns Cleanup callback that removes listeners and generated markup.
 */
function initializeCursorGradient(): CleanupFunction {
    if (window.innerWidth <= MOBILE_WIDTH_BREAKPOINT) {
        return (): void => {
            // No-op on mobile layouts.
        };
    }

    const handleMouseMove = (event: MouseEvent): void => {
        document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    };

    document.addEventListener("mousemove", handleMouseMove);

    const cursorGradient = document.createElement("div");
    cursorGradient.style.cssText = [
        "position: fixed",
        "inset: 0",
        "pointer-events: none",
        "z-index: -1",
        "background: radial-gradient(600px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(102, 126, 234, 0.03) 0%, transparent 50%)",
        "transition: opacity 0.3s ease",
    ].join(";");

    document.body.append(cursorGradient);

    return (): void => {
        document.removeEventListener("mousemove", handleMouseMove);
        cursorGradient.remove();
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

    if (!prefersReducedMotion) {
        cleanupFunctions.push(
            createScrollIndicator(),
            initializeMagneticButtons(),
            initializeScrollAnimations(),
            addDynamicColorAccents(),
            initializeCursorGradient()
        );
    }

    cleanupFunctions.push(applyThemeToggleAnimation());

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
