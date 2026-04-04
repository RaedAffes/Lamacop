"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import {
  approveTeamUser,
  getAllUsers,
  getCurrentUser,
  getPendingTeamUsers,
  isAdmin,
  rejectUser,
  type PublicUser,
} from "@/lib/auth"

export default function AdminPage() {
  const router = useRouter()
  const me = getCurrentUser()
  const allowed = isAdmin(me)

  const [pending, setPending] = useState<PublicUser[]>([])
  const [users, setUsers] = useState<PublicUser[]>([])
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => {
    if (!me) return "Admin"
    return me.role === "admin" ? "Admin" : "Admin"
  }, [me])

  const refresh = () => {
    void getPendingTeamUsers().then(setPending)
    void getAllUsers().then(setUsers)
  }

  useEffect(() => {
    if (!allowed) return
    refresh()
  }, [allowed])

  if (!allowed) {
    return (
      <div>
        <PageHeader
          title={title}
          subtitle="You must be signed in as an admin to access this page."
        />

        <section className="bg-slate-50">
          <div className="container py-10">
            <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm text-slate-600">
                Access denied. Please login with an admin account.
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Go to Login
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Admin"
        subtitle="Approve team members and manage access."
      />

      <section className="bg-slate-50">
        <div className="container grid gap-8 py-10 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">Pending Team Members</h2>
            <p className="mt-2 text-sm text-slate-600">
              Team members must be approved before they can add research,
              publications, or equipment.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-3">
              {pending.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No pending requests.
                </div>
              ) : (
                pending.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-sm text-slate-600">{u.email}</div>
                      {u.institution && (
                        <div className="text-xs text-slate-500">
                          {u.institution}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setError(null)
                          const res = await approveTeamUser(u.id)
                          if ("error" in res) {
                            setError(res.error)
                            return
                          }
                          refresh()
                        }}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setError(null)
                          const res = await rejectUser(u.id)
                          if ("error" in res) {
                            setError(res.error)
                            return
                          }
                          refresh()
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">All Users</h2>
            <p className="mt-2 text-sm text-slate-600">
              First registered account becomes admin automatically.
            </p>

            <div className="mt-6 space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-sm text-slate-600">{u.email}</div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>role: {u.role}</div>
                    <div>status: {u.status}</div>
                    <div>updated: {new Date(u.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
