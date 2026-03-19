"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Λάθος email ή κωδικός")
      return
    }

    // Store preference and set session marker cookie
    localStorage.setItem("rememberMe", rememberMe ? "true" : "false")
    if (!rememberMe) {
      // Session cookie (no expires) — browser deletes it when closed
      document.cookie = "crm_session=active; path=/; SameSite=Lax"
    } else {
      // Clear any leftover session cookie
      document.cookie = "crm_session=; path=/; SameSite=Lax; Max-Age=0"
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold">Σύνδεση</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Κωδικός"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Να με θυμάσαι
        </label>
        <button type="submit" className="bg-black text-white p-2 rounded">
          Σύνδεση
        </button>
      </form>
    </div>
  )
}
