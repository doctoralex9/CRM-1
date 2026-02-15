import Link from "next/link";
import { Building2, FileText, Settings } from "lucide-react";
import { resolve } from "path";

export default async function Home() {
  await new Promise(resolve => {
    setTimeout(() => {
      resolve("Intentional delay");
    }, 2000);
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CRM - Επισκευή Αντλιών Πλοίων
          </h1>
          <p className="text-lg text-gray-600">
            Σύστημα διαχείρισης πελατών και προσφορών
          </p>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Πελάτες</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Προσφορές</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Αποδεκτές</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/customers"
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <Building2 className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Πελάτες</h2>
            <p className="text-gray-600">Διαχείριση πελατών, εταιρειών και ιδιωτών</p>
          </Link>

          <Link
            href="/offers"
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md hover:border-green-200 transition-all group"
          >
            <FileText className="h-10 w-10 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Προσφορές</h2>
            <p className="text-gray-600">Δημιουργία και παρακολούθηση προσφορών</p>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <Settings className="h-10 w-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ρυθμίσεις</h2>
            <p className="text-gray-600">Διαχείριση όρων και προτύπων</p>
          </Link>
        </div>

        {/* Company Info Placeholder */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p className="font-medium">[Όνομα Εταιρείας]</p>
          <p>[Διεύθυνση] • [Τηλέφωνο] • [Email]</p>
          <p>ΑΦΜ: [ΑΦΜ] • ΔΟΥ: [ΔΟΥ]</p>
        </div>
      </div>
    </div>
  );
}
