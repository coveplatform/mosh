import { describe, it, expect } from "vitest";

/**
 * Tests for the phone and email validation logic used in the new-task page.
 * These mirror the exact regex patterns from src/app/dashboard/new-task/page.tsx
 */

// Phone validation — matches the logic in new-task/page.tsx
function isValidPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  return /^\+\d{7,15}$/.test(cleaned) || /^\d{8,15}$/.test(cleaned);
}

// Email validation — matches the logic in new-task/page.tsx
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe("Phone validation", () => {
  // Valid international formats
  it("accepts +81312345678 (Japan)", () => {
    expect(isValidPhone("+81312345678")).toBe(true);
  });

  it("accepts +81 3-1234-5678 (Japan with spaces/dashes)", () => {
    expect(isValidPhone("+81 3-1234-5678")).toBe(true);
  });

  it("accepts +61 2 9876 5432 (Australia)", () => {
    expect(isValidPhone("+61 2 9876 5432")).toBe(true);
  });

  it("accepts +33 1 23 45 67 89 (France)", () => {
    expect(isValidPhone("+33 1 23 45 67 89")).toBe(true);
  });

  it("accepts +1 (555) 123-4567 (USA)", () => {
    expect(isValidPhone("+1 (555) 123-4567")).toBe(true);
  });

  // Valid local formats (no +)
  it("accepts 0312345678 (Japan local)", () => {
    expect(isValidPhone("0312345678")).toBe(true);
  });

  it("accepts 03-1234-5678 (Japan local with dashes)", () => {
    expect(isValidPhone("03-1234-5678")).toBe(true);
  });

  it("accepts 0298765432 (Australia local)", () => {
    expect(isValidPhone("0298765432")).toBe(true);
  });

  // Invalid
  it("rejects empty string", () => {
    expect(isValidPhone("")).toBe(false);
  });

  it("rejects short number (123)", () => {
    expect(isValidPhone("123")).toBe(false);
  });

  it("rejects letters", () => {
    expect(isValidPhone("abc12345678")).toBe(false);
  });

  it("rejects just +", () => {
    expect(isValidPhone("+")).toBe(false);
  });

  it("rejects +123 (too short)", () => {
    expect(isValidPhone("+123")).toBe(false);
  });
});

describe("Email validation", () => {
  it("accepts standard email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("accepts email with subdomain", () => {
    expect(isValidEmail("user@mail.example.com")).toBe(true);
  });

  it("accepts email with dots in local part", () => {
    expect(isValidEmail("first.last@example.com")).toBe(true);
  });

  it("accepts email with plus", () => {
    expect(isValidEmail("user+tag@example.com")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects no @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects no domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects no TLD", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("rejects double @", () => {
    expect(isValidEmail("user@@example.com")).toBe(false);
  });
});
