"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Αρχική", href: "/", icon: Home },
  { name: "Πελάτες", href: "/customers", icon: Building2 },
  { name: "Προσφορές", href: "/offers", icon: FileText },
  { name: "Ρυθμίσεις", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
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
                "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                isActive ? "text-blue-600" : "text-gray-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
