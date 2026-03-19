"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

/**
 * Checks if the user opted out of "Remember Me".
 * If the browser was closed (session cookie gone), signs them out.
 */
export default function SessionGuard() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe")

    // Only act if user explicitly chose NOT to be remembered
    if (rememberMe !== "false") return

    // Check if the session cookie still exists
    const hasSessionCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("crm_session="))

    if (!hasSessionCookie) {
      // Browser was closed since last login — sign out
      localStorage.removeItem("rememberMe")
      supabase.auth.signOut().then(() => {
        router.push("/login")
        router.refresh()
      })
    }
  }, [supabase, router])

  return null
}
