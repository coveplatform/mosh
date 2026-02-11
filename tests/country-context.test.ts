import { describe, it, expect } from "vitest";
import { countries, EXPLORER_COUNTRIES, getFlagUrl } from "../src/lib/country-context";

describe("countries", () => {
  it("has 11 countries", () => {
    expect(countries).toHaveLength(11);
  });

  it("each country has key, name, language, code", () => {
    for (const c of countries) {
      expect(c.key).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.language).toBeTruthy();
      expect(c.code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("includes Japan, France, Spain (Explorer countries)", () => {
    const keys = countries.map((c) => c.key);
    expect(keys).toContain("japan");
    expect(keys).toContain("france");
    expect(keys).toContain("spain");
  });
});

describe("EXPLORER_COUNTRIES", () => {
  it("has exactly 3 countries", () => {
    expect(EXPLORER_COUNTRIES).toHaveLength(3);
  });

  it("contains japan, france, spain", () => {
    expect(EXPLORER_COUNTRIES).toContain("japan");
    expect(EXPLORER_COUNTRIES).toContain("france");
    expect(EXPLORER_COUNTRIES).toContain("spain");
  });

  it("all explorer countries exist in the main countries list", () => {
    const keys = countries.map((c) => c.key);
    for (const ec of EXPLORER_COUNTRIES) {
      expect(keys).toContain(ec);
    }
  });
});

describe("getFlagUrl", () => {
  it("generates correct URL for JP", () => {
    expect(getFlagUrl("JP")).toBe("https://flagcdn.com/w40/jp.png");
  });

  it("generates correct URL with custom size", () => {
    expect(getFlagUrl("US", 80)).toBe("https://flagcdn.com/w80/us.png");
  });

  it("lowercases the country code", () => {
    expect(getFlagUrl("GB", 40)).toBe("https://flagcdn.com/w40/gb.png");
  });
});
