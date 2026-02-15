import * as dotenv from "dotenv";

// Force override system env vars with .env file values
dotenv.config({ override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default Terms & Conditions templates
  const termsTemplates = [
    {
      title: "Εγγύηση εργασίας",
      clauseText:
        "Η εργασία καλύπτεται από εγγύηση καλής λειτουργίας για διάστημα δώδεκα (12) μηνών από την ημερομηνία παράδοσης.",
      sortOrder: 1,
      isDefault: true,
    },
    {
      title: "Χρόνος παράδοσης",
      clauseText:
        "Ο εκτιμώμενος χρόνος παράδοσης είναι εντός δέκα (10) εργάσιμων ημερών από την αποδοχή της προσφοράς, εκτός αν συμφωνηθεί διαφορετικά.",
      sortOrder: 2,
      isDefault: true,
    },
    {
      title: "Τρόπος πληρωμής",
      clauseText:
        "Η πληρωμή γίνεται σε δύο δόσεις: 50% προκαταβολή με την ανάθεση και 50% με την παράδοση της εργασίας.",
      sortOrder: 3,
      isDefault: true,
    },
    {
      title: "Ισχύς προσφοράς",
      clauseText:
        "Η παρούσα προσφορά ισχύει για τριάντα (30) ημέρες από την ημερομηνία έκδοσής της.",
      sortOrder: 4,
      isDefault: true,
    },
    {
      title: "Ανταλλακτικά",
      clauseText:
        "Τα ανταλλακτικά που θα χρησιμοποιηθούν είναι γνήσια ή ισοδύναμης ποιότητας και καλύπτονται από εγγύηση κατασκευαστή.",
      sortOrder: 5,
      isDefault: false,
    },
    {
      title: "Δοκιμές λειτουργίας",
      clauseText:
        "Μετά την ολοκλήρωση της επισκευής θα πραγματοποιηθούν δοκιμές λειτουργίας παρουσία του πελάτη ή εκπροσώπου του.",
      sortOrder: 6,
      isDefault: false,
    },
    {
      title: "Μεταφορά",
      clauseText:
        "Η μεταφορά του εξοπλισμού από και προς το συνεργείο βαρύνει τον πελάτη, εκτός αν συμφωνηθεί διαφορετικά.",
      sortOrder: 7,
      isDefault: false,
    },
    {
      title: "Έκτακτες εργασίες",
      clauseText:
        "Σε περίπτωση που κατά την επισκευή διαπιστωθούν επιπλέον βλάβες, θα ενημερωθεί ο πελάτης και θα αποσταλεί συμπληρωματική προσφορά.",
      sortOrder: 8,
      isDefault: false,
    },
  ];

  for (const template of termsTemplates) {
    await prisma.termsClauseTemplate.upsert({
      where: { id: `default-${template.sortOrder}` },
      update: template,
      create: {
        id: `default-${template.sortOrder}`,
        ...template,
      },
    });
  }

  console.log(`Created ${termsTemplates.length} terms templates`);

  // Initialize offer number sequence for current year
  const currentYear = new Date().getFullYear();
  await prisma.offerNumberSequence.upsert({
    where: { year: currentYear },
    update: {},
    create: {
      year: currentYear,
      lastNumber: 0,
    },
  });

  console.log(`Initialized offer number sequence for ${currentYear}`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
