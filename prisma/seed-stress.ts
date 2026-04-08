import * as dotenv from "dotenv";
dotenv.config({ override: true });

import { PrismaClient, CustomerType, OfferStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Realistic Greek data pools ───────────────────────────────────────────────

const companyNames = [
  "Αλφα Ναυτιλιακή Α.Ε.", "Βήτα Shipping Ε.Π.Ε.", "Γάμα Marine Services",
  "Δέλτα Ναυτικές Εφαρμογές", "Εψιλόν Αντλίες Α.Ε.", "Ζήτα Βιομηχανία Α.Ε.",
  "Ήτα Τεχνικές Λύσεις", "Θήτα Energy Ε.Π.Ε.", "Ιώτα Ναυπηγεία",
  "Κάπα Offshore Α.Ε.", "Λάμβδα Pumps & Systems", "Μι Βιομηχανικός Εξοπλισμός",
  "Νι Ναυτικά Έργα", "Ξι Technical Services", "Ομικρόν Marine Repairs",
  "Πι Αντλητικά Συγκροτήματα", "Ρο Hydraulics Α.Ε.", "Σίγμα Naval Industries",
  "Ταυ Βιομηχανική Α.Ε.", "Υψιλόν Marine Solutions", "Φι Pump Engineering",
  "Χι Ναυτικές Υπηρεσίες Α.Ε.", "Ψι Offshore Technology", "Ωμέγα Αντλίες",
  "Αθηναϊκή Ναυτιλία Α.Ε.", "Πειραϊκή Τεχνική Ε.Π.Ε.", "Ελληνική Marine Α.Ε.",
  "Αιγαίον Shipping", "Ιόνιο Ναυτικά Έργα", "Κρητική Βιομηχανία",
  "Μακεδονική Ναυτιλία", "Θεσσαλονίκη Marine", "Πάτρα Technical Services",
  "Βόλος Pump Solutions", "Λάρισα Engineering", "Ηράκλειο Marine",
  "Ρόδος Offshore", "Κέρκυρα Shipping", "Χαλκίδα Αντλίες",
  "Καλαμάτα Marine Services", "Ιωάννινα Technical", "Κομοτηνή Pump Systems",
  "Αλεξανδρούπολη Naval", "Ξάνθη Βιομηχανία", "Σέρρες Engineering",
  "Δράμα Αντλητικά", "Καβάλα Marine", "Τρίπολη Hydraulics",
  "Ναύπλιο Ναυτικά", "Σπάρτη Pump Works",
];

const firstNames = [
  "Γιώργος", "Νίκος", "Κώστας", "Δημήτρης", "Παναγιώτης",
  "Αλέξανδρος", "Βασίλης", "Χρήστος", "Αντώνης", "Μιχάλης",
  "Σταύρος", "Θανάσης", "Γιάννης", "Πέτρος", "Σπύρος",
  "Μαρία", "Ελένη", "Κατερίνα", "Αθηνά", "Σοφία",
  "Αναστασία", "Ειρήνη", "Χριστίνα", "Νίκη", "Δήμητρα",
];

const lastNames = [
  "Παπαδόπουλος", "Αλεξίου", "Νικολάου", "Γεωργίου", "Χριστοδούλου",
  "Κωνσταντίνου", "Δημητρίου", "Αντωνίου", "Παπαγεωργίου", "Μιχαλόπουλος",
  "Σταυρόπουλος", "Θεοδώρου", "Ιωάννου", "Πετρόπουλος", "Σπυρόπουλος",
  "Καραγεώργης", "Βλαχόπουλος", "Τσακαλώτης", "Παπανικολάου", "Ζαχαρόπουλος",
  "Κοντογιάννης", "Μανωλόπουλος", "Σπηλιωτόπουλος", "Λαζαρόπουλος", "Βασιλείου",
];

const cities = [
  "Πειραιάς", "Αθήνα", "Θεσσαλονίκη", "Πάτρα", "Ηράκλειο",
  "Βόλος", "Λάρισα", "Ρόδος", "Χαλκίδα", "Καβάλα",
  "Κόρινθος", "Ναύπλιο", "Καλαμάτα", "Χίος", "Μυτιλήνη",
  "Σάμος", "Κέρκυρα", "Ζάκυνθος", "Κεφαλονιά", "Ρέθυμνο",
];

const pumpDescriptions = [
  "Αντλία φυγόκεντρος τύπου {brand} {model}",
  "Αντλητικό συγκρότημα υποβρύχιο {brand}",
  "Αντλία θαλάσσιου νερού {brand} {model}",
  "Αντλία καυσίμου τύπου gear pump {brand}",
  "Αντλία λυμάτων {brand} {model}",
  "Αντλία ballast {brand}",
  "Υδραυλική αντλία {brand} {model}",
  "Αντλία πυροσβεστικού {brand}",
];

const brands = ["Grundfos", "KSB", "Sulzer", "Flowserve", "ITT", "Ebara", "Wilo", "Xylem", "Circor", "Nikkiso"];
const models = ["50-160", "65-200", "80-250", "100-315", "125-400", "150-500", "200-630", "250-800"];

const workDescriptions = [
  "Αποσυναρμολόγηση, καθαρισμός, έλεγχος εξαρτημάτων, αντικατάσταση τριβών και στεγανοποιητικών, επανασυναρμολόγηση και δοκιμές λειτουργίας.",
  "Πλήρης ανακατασκευή αντλίας. Αντικατάσταση φτερωτής, στελέχους, ρουλεμάν, μηχανικής στεγανοποίησης.",
  "Έλεγχος και συντήρηση. Αντικατάσταση φθαρμένων εξαρτημάτων. Ευθυγράμμιση και δοκιμές.",
  "Επισκευή διαρροής. Αντικατάσταση mechanical seal και o-rings. Δοκιμές υπό πίεση.",
  "Πλήρης overhaul. Επιθεώρηση στροφείου, άξονα, ρουλεμάν. Ανακατασκευή κεφαλής.",
  "Συντήρηση κατόπιν βλάβης. Αντικατάσταση ρουλεμάν και στεγανοποιητικών. Επαναλίπανση.",
];

const lineItemDescriptions = [
  "Εργατικά αποσυναρμολόγησης/συναρμολόγησης",
  "Mechanical seal αντλίας",
  "Ρουλεμάν {bearing}",
  "Φτερωτή αντλίας (impeller)",
  "Άξονας αντλίας (shaft)",
  "O-rings σετ",
  "Gaskets σετ",
  "Coupler/σύνδεσμος",
  "Δαχτυλίδια εδράνων (wear rings)",
  "Τριβή άξονα (shaft sleeve)",
  "Κινητήρας ηλεκτρικός",
  "Καταχωρητής μηχανικής στεγανοποίησης",
  "Κεφαλή αντλίας (pump casing)",
  "Ανταλλακτικά γενικά",
  "Δοκιμές λειτουργίας",
  "Μεταφορά - παραλαβή",
  "Καθαρισμός και βαφή",
];

const units = ["τεμ.", "σετ", "ώρες", "κιλά", "μέτρα"];

// ─── Utility helpers ──────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function vatNumber(): string {
  return `EL${rand(100000000, 999999999)}`;
}

function phone(): string {
  const prefixes = ["210", "211", "2310", "2610", "2810", "693", "694", "697", "698", "699"];
  return `${pick(prefixes)}${rand(1000000, 9999999)}`;
}

// ─── Main seeder ──────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting stress-test seed...");

  const CUSTOMER_COUNT = 300;
  const OFFERS_PER_CUSTOMER_MIN = 3;
  const OFFERS_PER_CUSTOMER_MAX = 15;
  const START_YEAR = 2020;
  const END_YEAR = 2026;

  // Track offer numbers per year
  const offerCounters: Record<number, number> = {};
  for (let y = START_YEAR; y <= END_YEAR; y++) offerCounters[y] = 0;

  // Pre-seed sequences for past years
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    await prisma.offerNumberSequence.upsert({
      where: { year: y },
      update: {},
      create: { year: y, lastNumber: 0 },
    });
  }

  // Get existing terms template IDs
  const terms = await prisma.termsClauseTemplate.findMany({ select: { id: true } });

  console.log(`Creating ${CUSTOMER_COUNT} customers...`);
  let totalOffers = 0;

  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const isCompany = Math.random() > 0.35; // 65% companies
    const customerType = isCompany ? CustomerType.company : CustomerType.individual;

    const customer = await prisma.customer.create({
      data: {
        customerType,
        companyName: isCompany ? `${pick(companyNames)} ${rand(1, 99) > 90 ? "II" : ""}`.trim() : null,
        vatNumber: Math.random() > 0.2 ? vatNumber() : null, // 80% have VAT
        taxOffice: isCompany ? pick(["Πειραιά", "Αθηνών Α'", "Θεσσαλονίκης", "Πατρών", "Ηρακλείου", "ΦΑΕ Πειραιά", "ΦΑΕ Αθηνών"]) : null,
        firstName: isCompany ? null : pick(firstNames),
        lastName: isCompany ? null : pick(lastNames),
        phone: phone(),
        email: isCompany
          ? `info@company${i}.gr`
          : `contact${i}@mail.gr`,
        address: `Οδός ${pick(["Ακτή Μιαούλη", "Νοταρά", "Ηρώων Πολυτεχνείου", "Λιμένος", "Αγ. Νικολάου", "Εθνικής Αντίστασης"])} ${rand(1, 200)}`,
        city: pick(cities),
        postalCode: `${rand(100, 999)}00`,
        notes: Math.random() > 0.7 ? "Προτιμά επικοινωνία πρωινές ώρες. Σταθερός πελάτης." : null,
      },
    });

    // Create offers for this customer
    const offerCount = rand(OFFERS_PER_CUSTOMER_MIN, OFFERS_PER_CUSTOMER_MAX);

    for (let j = 0; j < offerCount; j++) {
      const offerDate = randDate(START_YEAR, END_YEAR);
      const year = offerDate.getFullYear();
      offerCounters[year]++;

      // Determine status based on age
      const monthsAgo = (new Date().getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      let status: OfferStatus;
      if (monthsAgo < 1) {
        status = pick([OfferStatus.draft, OfferStatus.sent, OfferStatus.draft]);
      } else if (monthsAgo < 3) {
        status = pick([OfferStatus.sent, OfferStatus.accepted, OfferStatus.rejected, OfferStatus.sent]);
      } else {
        status = pick([OfferStatus.accepted, OfferStatus.rejected, OfferStatus.expired, OfferStatus.accepted, OfferStatus.accepted]);
      }

      const pumpBrand = pick(brands);
      const pumpModel = pick(models);
      const pumpDesc = pick(pumpDescriptions)
        .replace("{brand}", pumpBrand)
        .replace("{model}", pumpModel);

      const vatRate = pick([24, 24, 24, 0]); // 75% with VAT

      // Generate 2-7 line items
      const lineItemCount = rand(2, 7);
      const lineItems = [];
      let subtotal = 0;

      for (let k = 0; k < lineItemCount; k++) {
        const qty = randFloat(1, 8, 1);
        const unitPrice = randFloat(50, 1800, 2);
        const discount = pick([0, 0, 0, 5, 10, 15]); // mostly no discount
        const lineTotal = parseFloat((qty * unitPrice * (1 - discount / 100)).toFixed(2));
        subtotal += lineTotal;

        lineItems.push({
          sortOrder: k + 1,
          description: pick(lineItemDescriptions).replace("{bearing}", pick(["6205", "6206", "6207", "6208", "6210", "NU205", "NU206"])),
          quantity: qty,
          unit: pick(units),
          unitPrice,
          discountPercent: discount,
          lineTotal,
        });
      }

      subtotal = parseFloat(subtotal.toFixed(2));
      const vatAmount = parseFloat((subtotal * vatRate / 100).toFixed(2));
      const total = parseFloat((subtotal + vatAmount).toFixed(2));

      const validUntil = new Date(offerDate);
      validUntil.setDate(validUntil.getDate() + 30);

      // Randomly pick some T&C clauses
      const clauseCount = rand(2, Math.min(5, terms.length));
      const shuffledTerms = [...terms].sort(() => Math.random() - 0.5).slice(0, clauseCount);

      await prisma.offer.create({
        data: {
          offerNumber: `${year}-${String(offerCounters[year]).padStart(4, "0")}`,
          customerId: customer.id,
          title: `Επισκευή ${pumpDesc}`,
          objectDescription: pumpDesc,
          workReport: pick(workDescriptions),
          status,
          subtotal,
          vatRate,
          vatAmount,
          total,
          termsText: null,
          offerDate,
          validUntil,
          lineItems: {
            create: lineItems,
          },
          selectedClauses: terms.length > 0 ? {
            create: shuffledTerms.map((t, idx) => ({
              clauseTemplateId: t.id,
              sortOrder: idx + 1,
              clauseTextSnapshot: "Snapshot από πρότυπο",
            })),
          } : undefined,
        },
      });

      totalOffers++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  ✓ ${i + 1}/${CUSTOMER_COUNT} customers, ${totalOffers} offers so far...`);
    }
  }

  // Update sequences to reflect seeded data
  for (const [year, count] of Object.entries(offerCounters)) {
    if (count > 0) {
      await prisma.offerNumberSequence.update({
        where: { year: parseInt(year) },
        data: { lastNumber: count },
      });
    }
  }

  console.log(`\n✅ Stress seed complete!`);
  console.log(`   Customers: ${CUSTOMER_COUNT}`);
  console.log(`   Offers:    ${totalOffers}`);
  console.log(`   Years:     ${START_YEAR}–${END_YEAR}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
