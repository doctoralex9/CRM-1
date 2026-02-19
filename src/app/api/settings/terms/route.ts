import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/settings/terms - List all clause templates
export async function GET() {
  try {
    const terms = await prisma.termsClauseTemplate.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ data: terms });
  } catch (error) {
    console.error("GET /api/settings/terms error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ανάκτηση όρων" },
      { status: 500 }
    );
  }
}

// POST /api/settings/terms - Create new clause template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, clauseText, isDefault } = body;

    if (!title?.trim() || !clauseText?.trim()) {
      return NextResponse.json(
        { error: "Τίτλος και κείμενο είναι υποχρεωτικά" },
        { status: 400 }
      );
    }

    // Get next sort order
    const last = await prisma.termsClauseTemplate.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const nextSort = (last?.sortOrder ?? -1) + 1;

    const term = await prisma.termsClauseTemplate.create({
      data: {
        title: title.trim(),
        clauseText: clauseText.trim(),
        sortOrder: nextSort,
        isDefault: Boolean(isDefault),
        isActive: true,
      },
    });

    return NextResponse.json({ data: term }, { status: 201 });
  } catch (error) {
    console.error("POST /api/settings/terms error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά τη δημιουργία όρου" },
      { status: 500 }
    );
  }
}
