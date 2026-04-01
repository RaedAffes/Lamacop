"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import { registerUser, type UserRole } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user" as UserRole,
    institution: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div>
      <PageHeader
        title="Sign Up"
        subtitle="Create an account. Team members require admin approval before they can contribute."
      />

      <section className="bg-slate-50">
        <div className="container py-10">
          <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setError(null)
                setSubmitting(true)

                const result = registerUser({
                  firstName: form.firstName,
                  lastName: form.lastName,
                  email: form.email,
                  password: form.password,
                  role: form.role,
                  institution: form.institution,
                })

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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    First Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Last Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Role
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as UserRole })
                  }
                >
                  <option value="user">User</option>
                  <option value="team">Team Member (requires approval)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Institution / Affiliation
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={form.institution}
                  onChange={(e) =>
                    setForm({ ...form, institution: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating Account…" : "Sign Up"}
              </button>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="text-sm text-slate-600">
                Already have an account?
                <Link className="ml-1 underline" href="/login">
                  Login instead
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      
    </div>
  )
}
