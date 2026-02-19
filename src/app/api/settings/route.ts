import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/settings - Returns all settings as a key-value object
export async function GET() {
  try {
    const rows = await prisma.appSettings.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ανάκτηση ρυθμίσεων" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Upsert multiple settings
// Body: { key: value, ... }
export async function PUT(request: NextRequest) {
  try {
    const body: Record<string, string> = await request.json();

    if (typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Μη έγκυρο body" }, { status: 400 });
    }

    await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.appSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την αποθήκευση ρυθμίσεων" },
      { status: 500 }
    );
  }
}
