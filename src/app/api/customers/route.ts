import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";
import { Prisma } from "@prisma/client";

// GET /api/customers - List customers with search, filter, pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};

    if (type !== "all") {
      where.customerType = type as "company" | "individual";
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { vatNumber: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Query
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { offers: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      data: customers,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά την ανάκτηση πελατών" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const result = customerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Σφάλμα validation", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check unique VAT
    if (data.vatNumber) {
      const existing = await prisma.customer.findUnique({
        where: { vatNumber: data.vatNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Το ΑΦΜ υπάρχει ήδη" },
          { status: 409 }
        );
      }
    }

    // Create
    const customer = await prisma.customer.create({
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

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: "Σφάλμα κατά τη δημιουργία πελάτη" },
      { status: 500 }
    );
  }
}
