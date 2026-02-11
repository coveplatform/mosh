import { describe, it, expect } from "vitest";
import { culturalProfiles, getCountryOptions } from "../src/lib/cultural-layer";

describe("culturalProfiles", () => {
  const expectedCountries = [
    "japan", "korea", "china", "france", "italy",
    "spain", "germany", "thailand", "australia", "uk", "usa",
  ];

  it("has profiles for all 11 countries", () => {
    for (const key of expectedCountries) {
      expect(culturalProfiles[key]).toBeDefined();
    }
  });

  it("each profile has all required fields", () => {
    for (const key of expectedCountries) {
      const p = culturalProfiles[key];
      expect(p.country).toBeTruthy();
      expect(p.language).toBeTruthy();
      expect(p.greeting).toBeTruthy();
      expect(p.selfIntro).toBeTruthy();
      expect(["casual", "polite", "formal", "very_formal"]).toContain(p.politenessLevel);
      expect(p.etiquetteNotes.length).toBeGreaterThan(0);
      expect(p.closingPhrase).toBeTruthy();
      expect(p.commonPhrases).toBeDefined();
      expect(p.callingHours.start).toBeGreaterThanOrEqual(0);
      expect(p.callingHours.end).toBeLessThanOrEqual(24);
      expect(p.callingHours.start).toBeLessThan(p.callingHours.end);
      expect(p.tips.length).toBeGreaterThan(0);
    }
  });

  it("Japan is very_formal", () => {
    expect(culturalProfiles.japan.politenessLevel).toBe("very_formal");
  });

  it("USA is casual", () => {
    expect(culturalProfiles.usa.politenessLevel).toBe("casual");
  });

  it("Japan calling hours are 10-20", () => {
    expect(culturalProfiles.japan.callingHours).toEqual({ start: 10, end: 20 });
  });

  it("each profile has commonPhrases with standard keys", () => {
    for (const key of expectedCountries) {
      const phrases = culturalProfiles[key].commonPhrases;
      expect(phrases.availability).toBeTruthy();
      expect(phrases.reservation).toBeTruthy();
      expect(phrases.confirmation).toBeTruthy();
      expect(phrases.thankyou).toBeTruthy();
    }
  });
});

describe("getCountryOptions", () => {
  it("returns 11 options", () => {
    const options = getCountryOptions();
    expect(options).toHaveLength(11);
  });

  it("each option has value, label, country, language", () => {
    const options = getCountryOptions();
    for (const opt of options) {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
      expect(opt.country).toBeTruthy();
      expect(opt.language).toBeTruthy();
    }
  });
});
