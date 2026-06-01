import { describe, expect, it } from "vitest";

import {
    isAsciiIdentifierPartCharacter,
    isKnownWhitespaceCharacter,
} from "../../src/_internal/text-character";

describe(isAsciiIdentifierPartCharacter, () => {
    it("returns true for ascii letters, digits, dollar sign, and underscore", () => {
        expect.hasAssertions();
        expect(isAsciiIdentifierPartCharacter("a")).toBe(true);
        expect(isAsciiIdentifierPartCharacter("Z")).toBe(true);
        expect(isAsciiIdentifierPartCharacter("7")).toBe(true);
        expect(isAsciiIdentifierPartCharacter("$")).toBe(true);
        expect(isAsciiIdentifierPartCharacter("_")).toBe(true);
    });

    it("returns false for punctuation, whitespace, and empty strings", () => {
        expect.hasAssertions();
        expect(isAsciiIdentifierPartCharacter(".")).toBe(false);
        expect(isAsciiIdentifierPartCharacter("-")).toBe(false);
        expect(isAsciiIdentifierPartCharacter(" ")).toBe(false);
        expect(isAsciiIdentifierPartCharacter("")).toBe(false);
    });

    it("returns false for non-ascii unicode letters", () => {
        expect.hasAssertions();
        expect(isAsciiIdentifierPartCharacter("λ")).toBe(false);
        expect(isAsciiIdentifierPartCharacter("你")).toBe(false);
    });
});

describe(isKnownWhitespaceCharacter, () => {
    it("returns true for common js whitespace characters", () => {
        expect.hasAssertions();
        expect(isKnownWhitespaceCharacter(" ")).toBe(true);
        expect(isKnownWhitespaceCharacter("\t")).toBe(true);
        expect(isKnownWhitespaceCharacter("\n")).toBe(true);
        expect(isKnownWhitespaceCharacter("\r")).toBe(true);
        expect(isKnownWhitespaceCharacter("\f")).toBe(true);
        expect(isKnownWhitespaceCharacter("\v")).toBe(true);
        expect(isKnownWhitespaceCharacter("\u00A0")).toBe(true);
        expect(isKnownWhitespaceCharacter("\uFEFF")).toBe(true);
        expect(isKnownWhitespaceCharacter("\u2028")).toBe(true);
        expect(isKnownWhitespaceCharacter("\u2029")).toBe(true);
    });

    it("returns false for identifier and punctuation characters", () => {
        expect.hasAssertions();
        expect(isKnownWhitespaceCharacter("a")).toBe(false);
        expect(isKnownWhitespaceCharacter("0")).toBe(false);
        expect(isKnownWhitespaceCharacter(".")).toBe(false);
        expect(isKnownWhitespaceCharacter("")).toBe(false);
    });
});
