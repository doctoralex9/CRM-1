import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/settings/terms/[id] - Update clause template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, clauseText, isDefault, isActive, sortOrder } = body;

    const existing = await prisma.termsClauseTemplate.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Δεν βρέθηκε" }, { status: 404 });
    }

    const updated = await prisma.termsClauseTemplate.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(clauseText !== undefined && { clauseText: clauseText.trim() }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PUT /api/settings/terms/[id] error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ενημέρωση όρου" },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/terms/[id] - Delete clause template
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if used in any offer
    const used = await prisma.offerSelectedClause.count({
      where: { clauseTemplateId: params.id },
    });
    if (used > 0) {
      return NextResponse.json(
        { error: "Δεν μπορεί να διαγραφεί — χρησιμοποιείται σε προσφορές" },
        { status: 409 }
      );
    }

    await prisma.termsClauseTemplate.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/settings/terms/[id] error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά τη διαγραφή όρου" },
      { status: 500 }
    );
  }
}
