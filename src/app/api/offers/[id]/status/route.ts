import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { offerStatusSchema } from "@/lib/validations/offer";

// PATCH /api/offers/[id]/status - Update offer status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.offer.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Η προσφορά δεν βρέθηκε" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = offerStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Μη έγκυρη κατάσταση" },
        { status: 400 }
      );
    }

    const { status } = result.data;

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ["sent"],
      sent: ["accepted", "rejected", "expired", "draft"],
      accepted: ["draft"],
      rejected: ["draft"],
      expired: ["draft"],
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          error: `Δεν μπορεί να αλλάξει η κατάσταση από "${existing.status}" σε "${status}"`,
        },
        { status: 400 }
      );
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: { status: status as any },
      include: {
        customer: true,
        lineItems: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ data: offer });
  } catch (error) {
    console.error("PATCH /api/offers/[id]/status error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την αλλαγή κατάστασης" },
      { status: 500 }
    );
  }
}
