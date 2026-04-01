"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import { loginUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div>
      <PageHeader title="Login" subtitle="Access the LAMACOP intranet" />

      <section className="bg-slate-50">
        <div className="container py-10">
          <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setError(null)
                setSubmitting(true)

                const result = loginUser({ email, password })
                if ("error" in result) {
                  setError(result.error)
                  setSubmitting(false)
                  return
                }

                setSubmitting(false)
                router.push("/")
                router.refresh()
              }}
            >
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Logging in…" : "Login"}
              </button>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-4 text-sm text-slate-600">
              Don&apos;t have an account?
              <Link className="ml-1 underline" href="/register">
                Apply to join LaMaCoP
              </Link>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  )
}
