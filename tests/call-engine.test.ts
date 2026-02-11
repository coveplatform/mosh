import { describe, it, expect } from "vitest";
import { getTwilioVoice, getSpeechRecognitionLanguage } from "../src/lib/call-engine";

describe("getTwilioVoice", () => {
  it("returns correct voice for Japan", () => {
    const result = getTwilioVoice("japan");
    expect(result.voice).toBe("Polly.Kazuha-Neural");
    expect(result.language).toBe("ja-JP");
  });

  it("returns correct voice for France", () => {
    const result = getTwilioVoice("france");
    expect(result.voice).toBe("Polly.Lea-Neural");
    expect(result.language).toBe("fr-FR");
  });

  it("returns correct voice for Thailand (Neural2)", () => {
    const result = getTwilioVoice("thailand");
    expect(result.voice).toBe("Google.th-TH-Neural2-C");
    expect(result.language).toBe("th-TH");
  });

  it("returns correct voice for Australia", () => {
    const result = getTwilioVoice("australia");
    expect(result.voice).toBe("Polly.Olivia-Neural");
    expect(result.language).toBe("en-AU");
  });

  it("returns correct voice for all 11 countries", () => {
    const countries = [
      "japan", "korea", "china", "france", "italy",
      "spain", "germany", "thailand", "australia", "uk", "usa",
    ];
    for (const country of countries) {
      const result = getTwilioVoice(country);
      expect(result.voice).toBeTruthy();
      expect(result.language).toBeTruthy();
    }
  });

  it("falls back to English US for unknown country", () => {
    const result = getTwilioVoice("brazil");
    expect(result.voice).toBe("Polly.Joanna-Neural");
    expect(result.language).toBe("en-US");
  });

  it("is case-insensitive", () => {
    const result = getTwilioVoice("Japan");
    expect(result.voice).toBe("Polly.Kazuha-Neural");
  });
});

describe("getSpeechRecognitionLanguage", () => {
  it("returns ja-JP for Japan", () => {
    expect(getSpeechRecognitionLanguage("japan")).toBe("ja-JP");
  });

  it("returns ko-KR for Korea", () => {
    expect(getSpeechRecognitionLanguage("korea")).toBe("ko-KR");
  });

  it("returns zh-CN for China", () => {
    expect(getSpeechRecognitionLanguage("china")).toBe("zh-CN");
  });

  it("returns fr-FR for France", () => {
    expect(getSpeechRecognitionLanguage("france")).toBe("fr-FR");
  });

  it("falls back to en-US for unknown country", () => {
    expect(getSpeechRecognitionLanguage("brazil")).toBe("en-US");
  });

  it("is case-insensitive", () => {
    expect(getSpeechRecognitionLanguage("Japan")).toBe("ja-JP");
  });
});
