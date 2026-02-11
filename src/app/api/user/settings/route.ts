import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * PUT /api/user/settings
 *
 * Updates user profile settings: name, replyToEmail.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, replyToEmail } = body;

    const updateData: Record<string, string | null> = {};

    if (name !== undefined) {
      if (!name || name.trim().length < 1) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (replyToEmail !== undefined) {
      if (replyToEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyToEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      updateData.replyToEmail = replyToEmail || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      replyToEmail: updated.replyToEmail,
      plan: updated.plan,
      credits: updated.credits,
      creditsMax: updated.creditsMax,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
