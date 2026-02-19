import Link from "next/link";
import { Building2, FileText, Mail, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const sections = [
  {
    href: "/settings/company",
    icon: Building2,
    title: "Στοιχεία Εταιρείας",
    description: "Επωνυμία, διεύθυνση, ΑΦΜ, τηλέφωνο, τραπεζικά στοιχεία",
  },
  {
    href: "/settings/offers",
    icon: FileText,
    title: "Προσφορές",
    description: "Προεπιλογές ΦΠΑ, ισχύς προσφοράς, αρίθμηση",
  },
  {
    href: "/settings/terms",
    icon: ScrollText,
    title: "Όροι & Προϋποθέσεις",
    description: "Διαχείριση πρότυπων όρων που εμφανίζονται στις προσφορές",
  },
  {
    href: "/settings/email",
    icon: Mail,
    title: "Email",
    description: "Όνομα αποστολέα, απάντηση, υπογραφή email",
  },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Ρυθμίσεις"
        description="Διαχείριση παραμέτρων εφαρμογής"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <s.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 mb-1">{s.title}</h2>
                  <p className="text-sm text-gray-500">{s.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
