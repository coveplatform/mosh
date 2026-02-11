import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { culturalProfiles } from "../src/lib/cultural-layer";

/**
 * Tests for calling hours enforcement logic.
 * This mirrors the logic in src/lib/call-engine.ts initiateCall().
 */

const tzOffsets: Record<string, number> = {
  japan: 9, korea: 9, china: 8, france: 1, italy: 1, spain: 1,
  germany: 1, thailand: 7, australia: 10, uk: 0, usa: -5,
};

function isWithinCallingHours(countryKey: string, utcHour: number): boolean {
  const profile = culturalProfiles[countryKey];
  if (!profile?.callingHours) return true;

  const offset = tzOffsets[countryKey] ?? 0;
  const localHour = (utcHour + offset + 24) % 24;

  return localHour >= profile.callingHours.start && localHour < profile.callingHours.end;
}

describe("Calling hours enforcement", () => {
  describe("Japan (UTC+9, hours 10-20)", () => {
    it("allows call at 10am JST (1am UTC)", () => {
      expect(isWithinCallingHours("japan", 1)).toBe(true);
    });

    it("allows call at 19pm JST (10am UTC)", () => {
      expect(isWithinCallingHours("japan", 10)).toBe(true);
    });

    it("rejects call at 3am JST (6pm UTC)", () => {
      expect(isWithinCallingHours("japan", 18)).toBe(false);
    });

    it("rejects call at 21pm JST (12pm UTC)", () => {
      expect(isWithinCallingHours("japan", 12)).toBe(false);
    });

    it("rejects call at 9am JST (0am UTC) — just before opening", () => {
      expect(isWithinCallingHours("japan", 0)).toBe(false);
    });

    it("allows call at exactly 10am JST", () => {
      // 10am JST = 1am UTC
      expect(isWithinCallingHours("japan", 1)).toBe(true);
    });

    it("rejects call at exactly 20pm JST (closing)", () => {
      // 20pm JST = 11am UTC
      expect(isWithinCallingHours("japan", 11)).toBe(false);
    });
  });

  describe("France (UTC+1, hours 9-20)", () => {
    it("allows call at 12pm local (11am UTC)", () => {
      expect(isWithinCallingHours("france", 11)).toBe(true);
    });

    it("rejects call at 3am local (2am UTC)", () => {
      expect(isWithinCallingHours("france", 2)).toBe(false);
    });

    it("allows call at 9am local (8am UTC)", () => {
      expect(isWithinCallingHours("france", 8)).toBe(true);
    });
  });

  describe("USA (UTC-5, hours 9-22)", () => {
    it("allows call at 12pm EST (5pm UTC)", () => {
      expect(isWithinCallingHours("usa", 17)).toBe(true);
    });

    it("rejects call at 3am EST (8am UTC)", () => {
      expect(isWithinCallingHours("usa", 8)).toBe(false);
    });

    it("allows call at 9pm EST (2am UTC next day)", () => {
      expect(isWithinCallingHours("usa", 2)).toBe(true);
    });
  });

  describe("Australia (UTC+10, hours 9-21)", () => {
    it("allows call at 12pm AEST (2am UTC)", () => {
      expect(isWithinCallingHours("australia", 2)).toBe(true);
    });

    it("rejects call at 5am AEST (7pm UTC previous day)", () => {
      expect(isWithinCallingHours("australia", 19)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("unknown country returns true (no restriction)", () => {
      expect(isWithinCallingHours("brazil", 3)).toBe(true);
    });

    it("all 11 countries have valid calling hours defined", () => {
      for (const key of Object.keys(tzOffsets)) {
        const profile = culturalProfiles[key];
        expect(profile).toBeDefined();
        expect(profile.callingHours.start).toBeLessThan(profile.callingHours.end);
      }
    });
  });
});
