import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { offerSchema } from "@/lib/validations/offer";
import { calculateLineTotal, calculateOfferTotals } from "@/lib/utils";

// GET /api/offers/[id] - Get single offer with relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: { orderBy: { sortOrder: "asc" } },
        selectedClauses: {
          include: { clauseTemplate: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Η προσφορά δεν βρέθηκε" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: offer });
  } catch (error) {
    console.error("GET /api/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ανάκτηση προσφοράς" },
      { status: 500 }
    );
  }
}

// PUT /api/offers/[id] - Update offer (only draft offers)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check offer exists
    const existing = await prisma.offer.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Η προσφορά δεν βρέθηκε" },
        { status: 404 }
      );
    }

    // Only allow editing draft offers
    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Μόνο πρόχειρες προσφορές μπορούν να επεξεργαστούν" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate
    const result = offerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Σφάλμα validation", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Calculate line totals
    const lineItemsWithTotals = data.lineItems.map((item, index) => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || "τεμ.",
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent || 0,
      lineTotal: calculateLineTotal(
        item.quantity,
        item.unitPrice,
        item.discountPercent || 0
      ),
      sortOrder: item.sortOrder ?? index,
    }));

    const totals = calculateOfferTotals(lineItemsWithTotals, data.vatRate);

    // Update in transaction: delete old line items, create new ones
    const offer = await prisma.$transaction(async (tx) => {
      // Delete existing line items
      await tx.offerLineItem.deleteMany({
        where: { offerId: id },
      });

      // Update offer with new line items
      const updated = await tx.offer.update({
        where: { id },
        data: {
          customerId: data.customerId,
          title: data.title,
          objectDescription: data.objectDescription || null,
          workReport: data.workReport || null,
          vatRate: data.vatRate,
          subtotal: totals.subtotal,
          vatAmount: totals.vatAmount,
          total: totals.total,
          offerDate: new Date(data.offerDate),
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          lineItems: {
            create: lineItemsWithTotals,
          },
        },
        include: {
          customer: true,
          lineItems: { orderBy: { sortOrder: "asc" } },
          selectedClauses: {
            include: { clauseTemplate: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      return updated;
    });

    return NextResponse.json({ data: offer });
  } catch (error) {
    console.error("PUT /api/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ενημέρωση προσφοράς" },
      { status: 500 }
    );
  }
}

// DELETE /api/offers/[id] - Delete offer (only draft)
export async function DELETE(
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

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Μόνο πρόχειρες προσφορές μπορούν να διαγραφούν" },
        { status: 400 }
      );
    }

    await prisma.offer.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("DELETE /api/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά τη διαγραφή προσφοράς" },
      { status: 500 }
    );
  }
}
