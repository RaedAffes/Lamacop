"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import {
  approveTeamUser,
  deleteCurrentUser,
  getCurrentUser,
  getPendingTeamUsers,
  isAdmin,
  rejectUser,
  resetCurrentUserPassword,
  updateCurrentUserProfile,
  type PublicUser,
} from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [pending, setPending] = useState<PublicUser[]>([])

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [institution, setInstitution] = useState("")

  const [confirmEmail, setConfirmEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    const current = getCurrentUser()
    setUser(current)
    setFirstName(current?.firstName ?? "")
    setLastName(current?.lastName ?? "")
    setInstitution(current?.institution ?? "")

    if (isAdmin(current)) {
      void getPendingTeamUsers().then(setPending)
    }
  }, [])

  if (!user) {
    return (
      <div>
        <PageHeader
          title="Profile"
          subtitle="You must be logged in to view profile settings."
        />

        <section className="bg-slate-50">
          <div className="container py-10">
            <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm text-slate-600">
                Please <Link className="underline" href="/login">login</Link>.
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Profile settings"
        subtitle="Manage your account details, password, and access."
      />

      <section className="bg-slate-50">
        <div className="container grid gap-8 py-10 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">Account</h2>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Role:</span> {user.role}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Status:</span> {user.status}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Last updated:</span> {new Date(user.updatedAt).toLocaleString()}
              </div>
            </div>

            {(error || success) && (
              <div className="mt-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {success}
                  </div>
                )}
              </div>
            )}
          </div>

          {isAdmin(user) && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold">Pending team requests</h2>
              <p className="mt-2 text-sm text-slate-600">
                Approve team members before they can add research, publications,
                or equipment.
              </p>

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
                          onClick={() => {
                            setError(null)
                            setSuccess(null)
                            const res = approveTeamUser(u.id)
                            if ("error" in res) {
                              setError(res.error)
                              return
                            }
                            setPending(getPendingTeamUsers())
                            setSuccess("Approved.")
                          }}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null)
                            setSuccess(null)
                            const res = rejectUser(u.id)
                            if ("error" in res) {
                              setError(res.error)
                              return
                            }
                            setPending(getPendingTeamUsers())
                            setSuccess("Rejected.")
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
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">Edit profile</h2>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">First name</label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Last name</label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Institution</label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setSuccess(null)
                  const res = updateCurrentUserProfile({
                    firstName,
                    lastName,
                    institution,
                  })
                  if ("error" in res) {
                    setError(res.error)
                    return
                  }
                  setUser(res.user)
                  setSuccess("Profile updated.")
                }}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">Reset password</h2>
            <p className="mt-2 text-sm text-slate-600">
              To reset your password, confirm your email and set a new password.
            </p>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Confirm email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">New password</label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={async () => {
                  setError(null)
                  setSuccess(null)
                  const res = await resetCurrentUserPassword({
                    confirmEmail,
                    newPassword,
                  })
                  if ("error" in res) {
                    setError(res.error)
                    return
                  }
                  setConfirmEmail("")
                  setNewPassword("")
                  setSuccess("Password updated.")
                }}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Reset password
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">Delete account</h2>
            <p className="mt-2 text-sm text-slate-600">
              This removes your account from this browser. Content created earlier
              may still remain in local storage.
            </p>

            <button
              type="button"
              onClick={async () => {
                setError(null)
                setSuccess(null)
                const ok = window.confirm("Delete your account? This cannot be undone.")
                if (!ok) return

                const res = await deleteCurrentUser()
                if ("error" in res) {
                  setError(res.error)
                  return
                }

                router.push("/")
                router.refresh()
              }}
              className="mt-4 w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700"
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
