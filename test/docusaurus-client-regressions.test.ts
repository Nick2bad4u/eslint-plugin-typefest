import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

type GlobalTestEnvironment = typeof globalThis & {
    document?: Document;
    location?: Location;
    MutationObserver?: typeof MutationObserver;
    window?: typeof globalThis & Window;
};

const globalTestEnvironment = globalThis as GlobalTestEnvironment;
const originalDocument = globalTestEnvironment.document;
const originalLocation = globalTestEnvironment.location;
const originalMutationObserver = globalTestEnvironment.MutationObserver;
const originalWindow = globalTestEnvironment.window;
const modernEnhancementsPath = path.join(
    process.cwd(),
    "docs/docusaurus/src/js/modernEnhancements.ts"
);

const restoreGlobalTestEnvironment = (): void => {
    globalTestEnvironment.document = originalDocument;
    globalTestEnvironment.location = originalLocation;
    globalTestEnvironment.MutationObserver = originalMutationObserver;
    globalTestEnvironment.window = originalWindow;
    vi.restoreAllMocks();
};

describe("docusaurus client regressions", () => {
    describe("client enhancement bootstrap", () => {
        it("uses the window load event instead of DOMContentLoaded for initial setup", () => {
            expect.hasAssertions();

            try {
                const sourceText = fs.readFileSync(
                    modernEnhancementsPath,
                    "utf8"
                );

                expect(sourceText).toContain(
                    'window.addEventListener("load", handleWindowLoad, { once: true });'
                );
                expect(sourceText).not.toContain(
                    'document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);'
                );
                expect(sourceText).toContain(
                    'if (document.readyState === "complete") {'
                );
            } finally {
                restoreGlobalTestEnvironment();
            }
        });
    });
});
