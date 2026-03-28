import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { offerSchema } from "@/lib/validations/offer";
import { Prisma, OfferStatus } from "@prisma/client";
import { generateOfferNumber, calculateLineTotal, calculateOfferTotals } from "@/lib/utils";

const ALLOWED_OFFER_SORT_FIELDS = [
  "createdAt", "updatedAt", "offerDate", "offerNumber", "status", "total",
] as const;
type OfferSortField = typeof ALLOWED_OFFER_SORT_FIELDS[number];

const ALLOWED_SORT_ORDERS = ["asc", "desc"] as const;
type SortOrder = typeof ALLOWED_SORT_ORDERS[number];

const ALLOWED_OFFER_STATUSES = [
  "draft", "sent", "accepted", "rejected", "cancelled",
] as const;

// GET /api/offers - List offers with search, filter, pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const customerId = searchParams.get("customerId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const sortByRaw = searchParams.get("sortBy") || "createdAt";
    const sortOrderRaw = searchParams.get("sortOrder") || "desc";
    const sortBy: OfferSortField = (ALLOWED_OFFER_SORT_FIELDS as readonly string[]).includes(sortByRaw)
      ? (sortByRaw as OfferSortField)
      : "createdAt";
    const sortOrder: SortOrder = (ALLOWED_SORT_ORDERS as readonly string[]).includes(sortOrderRaw)
      ? (sortOrderRaw as SortOrder)
      : "desc";

    // Build where clause
    const where: Prisma.OfferWhereInput = {};

    if (status !== "all") {
      if (!(ALLOWED_OFFER_STATUSES as readonly string[]).includes(status)) {
        return NextResponse.json({ error: "Μη έγκυρη κατάσταση" }, { status: 400 });
      }
      where.status = status as OfferStatus;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { offerNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { customer: { companyName: { contains: search, mode: "insensitive" } } },
        { customer: { firstName: { contains: search, mode: "insensitive" } } },
        { customer: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          customer: true,
          _count: { select: { lineItems: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.offer.count({ where }),
    ]);

    return NextResponse.json({
      data: offers,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/offers error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ανάκτηση προσφορών" },
      { status: 500 }
    );
  }
}

// POST /api/offers - Create offer with line items
export async function POST(request: NextRequest) {
  try {
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

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      return NextResponse.json(
        { error: "Ο πελάτης δεν βρέθηκε" },
        { status: 404 }
      );
    }

    // Generate offer number within a transaction
    const offer = await prisma.$transaction(async (tx) => {
      // Get and increment the sequence for current year
      const year = new Date(data.offerDate).getFullYear();
      // upsert returns the already-incremented row, so lastNumber is the new value
      const sequence = await tx.offerNumberSequence.upsert({
        where: { year },
        update: { lastNumber: { increment: 1 } },
        create: { year, lastNumber: 1 },
      });

      const finalOfferNumber = generateOfferNumber(year, sequence.lastNumber);

      // Calculate line totals and offer totals
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

      // Create offer with line items
      const newOffer = await tx.offer.create({
        data: {
          offerNumber: finalOfferNumber,
          customerId: data.customerId,
          title: data.title,
          objectDescription: data.objectDescription || null,
          workReport: data.workReport || null,
          status: "draft",
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
        },
      });

      return newOffer;
    });

    return NextResponse.json({ data: offer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/offers error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά τη δημιουργία προσφοράς" },
      { status: 500 }
    );
  }
}
