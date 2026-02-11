import { describe, it, expect } from "vitest";
import { buildCallSystemPrompt } from "../src/lib/openai";

describe("buildCallSystemPrompt", () => {
  const baseParams = {
    country: "japan",
    language: "Japanese",
    objective: "Book a table for 2 at 7pm this Friday",
    tonePreference: "polite",
    businessName: "Sushi Saito",
  };

  it("includes the business name", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("Sushi Saito");
  });

  it("includes the objective", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("Book a table for 2 at 7pm this Friday");
  });

  it("includes the language instruction", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("Speak ONLY in Japanese");
  });

  it("includes cultural etiquette for Japan", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("CULTURAL ETIQUETTE FOR JAPAN");
    expect(prompt).toContain("keigo");
  });

  it("includes the tone preference", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("polite");
  });

  it("detects restaurant category", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("RESTAURANT RESERVATION");
  });

  it("detects medical category", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      objective: "Book a doctor appointment for a checkup",
      businessName: "Tokyo Clinic",
    });
    expect(prompt).toContain("MEDICAL / APPOINTMENT");
  });

  it("detects salon category", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      objective: "Book a haircut for Saturday",
      businessName: "Hair Studio",
    });
    expect(prompt).toContain("SALON / BEAUTY");
  });

  it("detects maintenance category", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      objective: "Tell the landlord the pipe is broken",
      businessName: "Property Manager",
    });
    expect(prompt).toContain("MAINTENANCE / REPAIR");
  });

  it("detects billing category", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      objective: "Dispute the charge on my latest bill",
      businessName: "NTT",
    });
    expect(prompt).toContain("BILLING / DISPUTE");
  });

  it("detects delivery category", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      objective: "Track my delivery package",
      businessName: "Yamato",
    });
    expect(prompt).toContain("DELIVERY / TRACKING");
  });

  it("detects school category", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      objective: "Ask about enrollment for my daughter at school",
      businessName: "Tokyo International School",
    });
    expect(prompt).toContain("SCHOOL / EDUCATION");
  });

  it("falls back to GENERAL for unrecognized tasks", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      objective: "Ask about their opening hours",
      businessName: "Some Business",
    });
    expect(prompt).toContain("GENERAL");
  });

  it("includes detailed notes when provided", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      detailedNotes: "Name: Tanaka, Priority: URGENT",
    });
    expect(prompt).toContain("ADDITIONAL DETAILS: Name: Tanaka, Priority: URGENT");
  });

  it("includes fallback options when provided", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      fallbackOptions: "Try Saturday instead",
    });
    expect(prompt).toContain("FALLBACK: Try Saturday instead");
  });

  it("handles unknown country gracefully (no etiquette block)", () => {
    const prompt = buildCallSystemPrompt({
      ...baseParams,
      country: "brazil",
    });
    expect(prompt).toContain("Sushi Saito");
    expect(prompt).not.toContain("CULTURAL ETIQUETTE");
  });

  it("includes critical rules about payments", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("NEVER commit to payments");
    expect(prompt).toContain("NEVER agree to pay");
  });

  it("includes conversation flow instructions", () => {
    const prompt = buildCallSystemPrompt(baseParams);
    expect(prompt).toContain("GREETING");
    expect(prompt).toContain("REQUEST");
    expect(prompt).toContain("WRAP UP");
  });
});
