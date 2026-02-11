import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { culturalProfiles } from "@/lib/cultural-layer";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calls = await prisma.callRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error("Get calls error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Build a natural-language objective from structured restaurant booking fields.
 * The AI agent will use this as its mission during the call.
 */
function buildBookingObjective(body: Record<string, string>): string {
  const {
    partySize,
    date,
    timePreference,
    seating,
    occasion,
    dietary,
    specialRequests,
    bookingName,
    fallbackDate,
    menuChoice,
    timeFlexibility,
    timeDirection,
    unavailableBehavior,
    dateFlexibility,
  } = body;

  const dateStr = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "the requested date";

  // --- Date flexibility logic ---
  const dateFlex = dateFlexibility || "0";
  let dateInstruction: string;
  if (dateFlex === "0") {
    dateInstruction = `Book on ${dateStr} ONLY. Do NOT accept any other date.`;
  } else if (dateFlex === "week") {
    dateInstruction = `Preferred date: ${dateStr}. If unavailable, you may accept any other day the same week, but prefer dates closest to the original.`;
  } else {
    const days = Number(dateFlex);
    dateInstruction = `Preferred date: ${dateStr}. If unavailable, you may accept up to ${days} day${days > 1 ? "s" : ""} earlier or later, but NOTHING outside that range.`;
  }

  // --- Time flexibility logic ---
  const flex = Number(timeFlexibility) || 0;
  const dir = timeDirection || "either";
  const fallbackBehavior = unavailableBehavior || "ask";

  let timeInstruction: string;
  if (flex === 0) {
    timeInstruction = `Book at exactly ${timePreference}. Do NOT accept any other time.`;
  } else {
    const flexLabel = flex >= 60 ? `${flex / 60} hour${flex > 60 ? "s" : ""}` : `${flex} minutes`;
    const dirLabel =
      dir === "earlier"
        ? `up to ${flexLabel} earlier (no later)`
        : dir === "later"
        ? `up to ${flexLabel} later (no earlier)`
        : `up to ${flexLabel} earlier or later`;
    timeInstruction = `Preferred time: ${timePreference}. You may accept an alternative ${dirLabel}, but NOTHING outside that range.`;
  }

  let fallbackInstruction: string;
  if (fallbackBehavior === "decline") {
    fallbackInstruction = `If no date/time within the acceptable range is available, politely decline the booking. Do NOT accept anything outside the allowed ranges. Report back that nothing was available.`;
  } else {
    fallbackInstruction = `If no date/time within the acceptable range is available, ask what dates and times ARE available, note them down, and end the call politely WITHOUT confirming a booking. Report the available options back to the user.`;
  }

  let objective = `Book a table for ${partySize}. ${dateInstruction} ${timeInstruction} ${fallbackInstruction}`;

  if (bookingName) {
    objective += ` Reservation under the name "${bookingName}".`;
  }

  if (seating && seating !== "no_preference") {
    const seatingMap: Record<string, string> = {
      counter: "counter/bar seating",
      table: "a regular table",
      private: "a private room",
      outdoor: "outdoor/terrace seating",
      tatami: "tatami seating",
      bar: "bar seating",
    };
    objective += ` Prefer ${seatingMap[seating] || seating}.`;
  }

  if (menuChoice) {
    objective += ` Requesting the ${menuChoice} menu/course.`;
  }

  if (occasion) {
    objective += ` This is for a ${occasion}.`;
  }

  if (dietary) {
    objective += ` Dietary requirements: ${dietary}.`;
  }

  if (specialRequests) {
    objective += ` Special requests: ${specialRequests}.`;
  }

  if (fallbackDate) {
    const fallbackStr = new Date(fallbackDate + "T00:00:00").toLocaleDateString(
      "en-US",
      { weekday: "long", month: "long", day: "numeric" }
    );
    objective += ` If the primary date is unavailable, try ${fallbackStr} instead.`;
  }

  return objective;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      restaurantName,
      phone,
      country,
      partySize,
      date,
      timePreference,
    } = body;

    if (!restaurantName || !phone || !country || !partySize || !date || !timePreference) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const creditCost = 1;

    if (user.credits < creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 1 credit but have ${user.credits}. Upgrade your plan for more.`,
        },
        { status: 402 }
      );
    }

    const profile = culturalProfiles[country];
    const language = profile?.language || "Unknown";

    const objective = buildBookingObjective(body);

    // Build a concise details string for display
    const detailParts: string[] = [];
    if (body.seating && body.seating !== "no_preference") detailParts.push(`Seating: ${body.seating}`);
    if (body.dateFlexibility === "0") {
      detailParts.push("Date: exact only");
    } else if (body.dateFlexibility === "week") {
      detailParts.push("Date: same week");
    } else if (body.dateFlexibility) {
      detailParts.push(`Date: ±${body.dateFlexibility} days`);
    }
    if (body.timeFlexibility === "0") {
      detailParts.push("Time: exact only");
    } else if (body.timeFlexibility) {
      detailParts.push(`Time: ±${body.timeFlexibility}min ${body.timeDirection || "either"}`);
    }
    if (body.unavailableBehavior === "decline") detailParts.push("If unavailable: decline");
    if (body.occasion) detailParts.push(`Occasion: ${body.occasion}`);
    if (body.dietary) detailParts.push(`Dietary: ${body.dietary}`);
    if (body.specialRequests) detailParts.push(`Requests: ${body.specialRequests}`);
    if (body.bookingName) detailParts.push(`Name: ${body.bookingName}`);
    if (body.menuChoice) detailParts.push(`Menu: ${body.menuChoice}`);

    const detailedNotes = detailParts.length > 0 ? detailParts.join(" | ") : null;

    const fallbackOptions = body.fallbackDate
      ? `If primary date unavailable, try ${new Date(body.fallbackDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
      : null;

    const culturalNotes = profile
      ? JSON.stringify({
          etiquette: profile.etiquetteNotes,
          tips: profile.tips,
          callingHours: profile.callingHours,
        })
      : null;

    const callRequest = await prisma.callRequest.create({
      data: {
        userId: user.id,
        tier: "booking",
        businessName: restaurantName,
        businessPhone: phone,
        country: profile?.country || country,
        language,
        objective,
        detailedNotes,
        tonePreference: "polite",
        constraints: null,
        fallbackOptions,
        culturalNotes,
        creditsUsed: creditCost,
        status: "pending",
      },
    });

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: creditCost } },
    });

    // Record transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: -creditCost,
        type: "usage",
        description: `Booking at ${restaurantName} (${profile?.country || country})`,
        callRequestId: callRequest.id,
      },
    });

    return NextResponse.json(callRequest, { status: 201 });
  } catch (error) {
    console.error("Create call error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
