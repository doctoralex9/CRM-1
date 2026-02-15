import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";

// GET /api/customers/:id - Get single customer with offers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        offers: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        _count: { select: { offers: true } },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Ο πελάτης δεν βρέθηκε" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error("GET /api/customers/:id error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ανάκτηση πελάτη" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/:id - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check exists
    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Ο πελάτης δεν βρέθηκε" },
        { status: 404 }
      );
    }

    // Validate
    const result = customerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Σφάλμα validation", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check unique VAT (exclude self)
    if (data.vatNumber) {
      const vatConflict = await prisma.customer.findFirst({
        where: {
          vatNumber: data.vatNumber,
          NOT: { id: params.id },
        },
      });
      if (vatConflict) {
        return NextResponse.json(
          { error: "Το ΑΦΜ υπάρχει ήδη σε άλλον πελάτη" },
          { status: 409 }
        );
      }
    }

    // Update
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        customerType: data.customerType,
        companyName: data.companyName || null,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        vatNumber: data.vatNumber || null,
        taxOffice: data.taxOffice || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error("PUT /api/customers/:id error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ενημέρωση πελάτη" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/:id - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if customer has offers
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { _count: { select: { offers: true } } },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Ο πελάτης δεν βρέθηκε" },
        { status: 404 }
      );
    }

    if (customer._count.offers > 0) {
      return NextResponse.json(
        { error: `Ο πελάτης έχει ${customer._count.offers} προσφορές και δεν μπορεί να διαγραφεί` },
        { status: 409 }
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/customers/:id error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά τη διαγραφή πελάτη" },
      { status: 500 }
    );
  }
}
