import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@moshi.com" },
    update: {},
    create: {
      email: "demo@moshi.com",
      name: "Alex Morgan",
      passwordHash,
      plan: "member",
      credits: 8,
      creditsMax: 10,
    },
  });

  console.log("Created demo user:", demoUser.email);

  // Create welcome credit transaction
  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      amount: 10,
      type: "subscription",
      description: "Member plan — 10 monthly credits",
    },
  });

  // Create sample call requests
  const sampleCalls = [
    {
      userId: demoUser.id,
      status: "completed",
      tier: "booking",
      businessName: "Sushi Saito",
      businessPhone: "+81 3-3589-4412",
      country: "Japan",
      language: "Japanese",
      objective:
        "Reserve a table for 2 at the counter for Saturday evening around 7pm",
      detailedNotes: "Anniversary dinner. No shellfish allergy.",
      tonePreference: "formal",
      constraints: "Must be counter seating. Saturday only.",
      fallbackOptions: "If Saturday is full, try Friday evening.",
      culturalNotes: JSON.stringify({
        etiquette: [
          "Use keigo throughout",
          "Apologize for interruption",
          "Confirm details by repeating",
        ],
      }),
      callPlan:
        '{\n  "greeting": "お忙しいところ恐れ入ります。",\n  "objective": "Reserve counter seating for 2, Saturday 7pm",\n  "closing": "お忙しいところありがとうございました。"\n}',
      transcript: [
        "[Call initiated to Sushi Saito]",
        "",
        "Agent: お忙しいところ恐れ入ります。お客様の代理でお電話させていただいております。",
        "",
        "Business: はい、鮨さいとうでございます。",
        "",
        "Agent: 土曜日の夜7時頃、カウンター席で2名様の予約をお願いしたいのですが、空き状況を確認させていただけますか？",
        "",
        "Business: 少々お待ちください。確認いたします。",
        "Business: はい、土曜日の19時、カウンター席で2名様、ご予約可能でございます。",
        "",
        "Agent: ありがとうございます。お名前はモーガン様でお願いいたします。記念日のお食事でございます。",
        "",
        "Business: かしこまりました。モーガン様、土曜日19時、カウンター2名様で承りました。",
        "",
        "Agent: 確認させていただきます。ありがとうございます。お忙しいところありがとうございました。失礼いたします。",
        "",
        "[Call ended — Duration: 4m 15s]",
      ].join("\n"),
      summary:
        "Successfully reserved a counter seat for 2 at Sushi Saito for Saturday at 7:00 PM. Reservation is under the name Morgan. The restaurant acknowledged it is an anniversary dinner.",
      outcome: "success",
      actionItems:
        "Reservation confirmed for Saturday 7:00 PM\nCounter seating for 2\nName: Morgan\nArrive 5 minutes early\nNo cancellation fee if cancelled 24h in advance",
      creditsUsed: 2,
      startedAt: new Date(Date.now() - 86400000 * 2),
      completedAt: new Date(Date.now() - 86400000 * 2 + 255000),
    },
    {
      userId: demoUser.id,
      status: "completed",
      tier: "simple",
      businessName: "Louis Vuitton Ginza",
      businessPhone: "+81 3-3478-2100",
      country: "Japan",
      language: "Japanese",
      objective:
        "Check if they have the Keepall 45 in Monogram Eclipse in stock",
      tonePreference: "polite",
      transcript: [
        "[Call initiated to Louis Vuitton Ginza]",
        "",
        "Agent: お忙しいところ恐れ入ります。お客様の代理でお電話させていただいております。",
        "",
        "Business: ルイ・ヴィトン銀座店でございます。",
        "",
        "Agent: キーポル45のモノグラム・エクリプスの在庫を確認させていただけますか？",
        "",
        "Business: 少々お待ちください。確認いたします。",
        "Business: 申し訳ございません。現在、モノグラム・エクリプスのキーポル45は在庫がございません。入荷予定は来月中旬頃となっております。",
        "",
        "Agent: 承知いたしました。ありがとうございます。失礼いたします。",
        "",
        "[Call ended — Duration: 2m 30s]",
      ].join("\n"),
      summary:
        "The Keepall 45 in Monogram Eclipse is currently out of stock at Louis Vuitton Ginza. Expected restock is mid next month.",
      outcome: "success",
      actionItems:
        "Item currently out of stock\nExpected restock: mid next month\nConsider checking other LV locations or placing a reservation",
      creditsUsed: 1,
      startedAt: new Date(Date.now() - 86400000 * 5),
      completedAt: new Date(Date.now() - 86400000 * 5 + 150000),
    },
    {
      userId: demoUser.id,
      status: "completed",
      tier: "booking",
      businessName: "Le Comptoir du Panthéon",
      businessPhone: "+33 1 43 54 75 56",
      country: "France",
      language: "French",
      objective: "Book a table for 4 for lunch on Thursday at 12:30",
      detailedNotes: "One vegetarian in the group. Outdoor seating preferred.",
      tonePreference: "polite",
      transcript: [
        "[Call initiated to Le Comptoir du Panthéon]",
        "",
        "Agent: Bonjour, excusez-moi de vous déranger. J'appelle au nom d'un client.",
        "",
        "Business: Bonjour, Le Comptoir du Panthéon.",
        "",
        "Agent: Je voudrais faire une réservation pour 4 personnes, jeudi midi à 12h30, si possible en terrasse.",
        "",
        "Business: Un moment, je vérifie... Oui, c'est possible. En terrasse pour 4 à 12h30.",
        "",
        "Agent: Parfait. Il y a une personne végétarienne dans le groupe, est-ce que vous avez des options ?",
        "",
        "Business: Bien sûr, nous avons plusieurs plats végétariens.",
        "",
        "Agent: Merci beaucoup. La réservation est au nom de Morgan.",
        "",
        "Business: C'est noté. Morgan, jeudi 12h30, 4 personnes, terrasse.",
        "",
        "Agent: Merci beaucoup, bonne journée.",
        "",
        "[Call ended — Duration: 3m 10s]",
      ].join("\n"),
      summary:
        "Successfully booked outdoor table for 4 at Le Comptoir du Panthéon for Thursday at 12:30 PM. Vegetarian options are available. Reservation under Morgan.",
      outcome: "success",
      actionItems:
        "Reservation confirmed: Thursday 12:30 PM\nOutdoor seating for 4\nVegetarian options available\nName: Morgan",
      creditsUsed: 2,
      startedAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 86400000 + 190000),
    },
    {
      userId: demoUser.id,
      status: "pending",
      tier: "simple",
      businessName: "Gentle Monster Gangnam",
      businessPhone: "+82 2-6494-1470",
      country: "South Korea",
      language: "Korean",
      objective:
        "Ask if they have the Jentle Garden collection sunglasses in stock, specifically the 'Blossom' model",
      tonePreference: "polite",
      creditsUsed: 1,
    },
  ];

  for (const call of sampleCalls) {
    await prisma.callRequest.create({ data: call });
  }

  // Create usage transactions for completed calls
  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      amount: -2,
      type: "usage",
      description: "Call to Sushi Saito (Japan)",
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      amount: -1,
      type: "usage",
      description: "Call to Louis Vuitton Ginza (Japan)",
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      amount: -2,
      type: "usage",
      description: "Call to Le Comptoir du Panthéon (France)",
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      amount: -1,
      type: "usage",
      description: "Call to Gentle Monster Gangnam (South Korea)",
    },
  });

  // Create subscription plans
  const plans = [
    {
      name: "free",
      displayName: "Explorer",
      price: 0,
      creditsPerMonth: 3,
      features: JSON.stringify([
        "3 credits per month",
        "Simple inquiries only",
        "8 supported countries",
        "Basic call summaries",
        "Email support",
      ]),
    },
    {
      name: "member",
      displayName: "Member",
      price: 2900,
      creditsPerMonth: 10,
      features: JSON.stringify([
        "10 credits per month",
        "All call types",
        "8 supported countries",
        "Detailed transcripts & summaries",
        "Cultural briefings",
        "Priority queue",
        "Chat support",
      ]),
    },
    {
      name: "global",
      displayName: "Global",
      price: 7900,
      creditsPerMonth: 40,
      features: JSON.stringify([
        "40 credits per month",
        "All call types",
        "All supported countries",
        "Detailed transcripts & summaries",
        "Cultural briefings & call coaching",
        "Priority queue",
        "Rollover credits (up to 20)",
        "Expense integration ready",
        "Dedicated support",
      ]),
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
