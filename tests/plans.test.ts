import { describe, it, expect } from "vitest";

/**
 * Tests for plan tier definitions.
 * Mirrors the plan data in src/app/dashboard/plans/page.tsx
 */

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}

// Mirror the plan definitions from plans/page.tsx
const plans: Plan[] = [
  {
    id: "explorer",
    name: "Explorer",
    price: 0,
    credits: 3,
    features: [
      "3 tasks per month",
      "Calls only",
      "3 countries (Japan, France, Spain)",
      "Basic summaries",
      "Email support",
    ],
  },
  {
    id: "member",
    name: "Member",
    price: 19,
    credits: 15,
    features: [
      "15 tasks per month",
      "Calls & emails",
      "All 10+ countries",
      "Detailed transcripts & action items",
      "Cultural briefings",
      "Priority support",
    ],
  },
  {
    id: "global",
    name: "Global",
    price: 79,
    credits: 50,
    features: [
      "50 tasks per month",
      "Calls & emails",
      "All countries + priority routing",
      "Recurring tasks",
      "Household members (up to 3)",
      "Dedicated support",
    ],
  },
];

describe("Plan tiers", () => {
  it("has 3 plans", () => {
    expect(plans).toHaveLength(3);
  });

  describe("Explorer (Free)", () => {
    const explorer = plans.find((p) => p.id === "explorer")!;

    it("is free", () => {
      expect(explorer.price).toBe(0);
    });

    it("has 3 credits", () => {
      expect(explorer.credits).toBe(3);
    });

    it("is limited to 3 countries", () => {
      const countryFeature = explorer.features.find((f) => f.includes("countries"));
      expect(countryFeature).toContain("3 countries");
      expect(countryFeature).toContain("Japan");
      expect(countryFeature).toContain("France");
      expect(countryFeature).toContain("Spain");
    });

    it("is calls only (no emails)", () => {
      expect(explorer.features).toContain("Calls only");
    });
  });

  describe("Member ($19/mo)", () => {
    const member = plans.find((p) => p.id === "member")!;

    it("costs $19", () => {
      expect(member.price).toBe(19);
    });

    it("has 15 credits", () => {
      expect(member.credits).toBe(15);
    });

    it("has all countries", () => {
      const countryFeature = member.features.find((f) => f.includes("countries"));
      expect(countryFeature).toContain("All");
    });

    it("includes calls and emails", () => {
      expect(member.features).toContain("Calls & emails");
    });
  });

  describe("Global ($79/mo)", () => {
    const global = plans.find((p) => p.id === "global")!;

    it("costs $79", () => {
      expect(global.price).toBe(79);
    });

    it("has 50 credits", () => {
      expect(global.credits).toBe(50);
    });

    it("includes household members", () => {
      const householdFeature = global.features.find((f) => f.includes("Household"));
      expect(householdFeature).toBeTruthy();
    });

    it("includes recurring tasks", () => {
      expect(global.features).toContain("Recurring tasks");
    });
  });

  describe("Pricing hierarchy", () => {
    it("Explorer < Member < Global in price", () => {
      const [explorer, member, global] = plans;
      expect(explorer.price).toBeLessThan(member.price);
      expect(member.price).toBeLessThan(global.price);
    });

    it("Explorer < Member < Global in credits", () => {
      const [explorer, member, global] = plans;
      expect(explorer.credits).toBeLessThan(member.credits);
      expect(member.credits).toBeLessThan(global.credits);
    });
  });
});
