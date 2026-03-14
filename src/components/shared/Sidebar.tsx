"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter} from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

const navigation = [
  { name: "Αρχική", href: "/", icon: Home },
  { name: "Πελάτες", href: "/customers", icon: Building2 },
  { name: "Προσφορές", href: "/offers", icon: FileText },
  { name: "Ρυθμίσεις", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">CRM</h1>
              <p className="text-xs text-gray-500">Ship Pump Repair</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <LogOut className="h-5 w-5 text-gray-400" />
            Αποσύνδεση  
          </button>
        </div>

        {/* Company Info */}
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate">
            {process.env.NEXT_PUBLIC_COMPANY_NAME || "[Όνομα Εταιρείας]"}
          </p>
        </div>
      </div>
    </aside>
  );
}
