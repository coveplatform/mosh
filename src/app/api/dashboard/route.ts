import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentCalls = await prisma.callRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        businessName: true,
        country: true,
        status: true,
        tier: true,
        objective: true,
        outcome: true,
        summary: true,
        actionItems: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const totalCalls = await prisma.callRequest.count({
      where: { userId: user.id },
    });

    const completedCalls = await prisma.callRequest.count({
      where: { userId: user.id, status: "completed" },
    });

    const countryCalls = await prisma.callRequest.findMany({
      where: { userId: user.id },
      select: { country: true },
      distinct: ["country"],
    });

    return NextResponse.json({
      user: {
        name: user.name,
        credits: user.credits,
        creditsMax: user.creditsMax,
        plan: user.plan,
      },
      recentCalls,
      stats: {
        totalCalls,
        completedCalls,
        countriesCalled: countryCalls.length,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
