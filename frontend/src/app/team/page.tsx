"use client"

import { useEffect, useMemo, useState } from "react"
import PageHeader from "@/components/PageHeader"
import EmptyState from "@/components/EmptyState"
import FileDropzone, { type StoredFile } from "@/components/FileDropzone"
import { canManageAllContent, getCurrentUser } from "@/lib/auth"
import {
  addTeamMember,
  deleteTeamMember,
  getTeamMembers,
  updateTeamMember,
  type TeamMember,
} from "@/lib/content"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function TeamPage() {
  const user = getCurrentUser()
  const canManage = canManageAllContent(user)
  const showSelfCard = user?.role === "team"

  const [items, setItems] = useState<TeamMember[]>([])
  const [query, setQuery] = useState("")
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [email, setEmail] = useState("")
  const [photo, setPhoto] = useState<StoredFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPosition, setEditPosition] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhoto, setEditPhoto] = useState<StoredFile | null>(null)

  useEffect(() => {
    setItems(getTeamMembers())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((m) => {
      const hay = `${m.name} ${m.position} ${m.email ?? ""}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query])

  return (
    <div>
      <PageHeader
        title="Our Research Team"
        subtitle="Meet the brilliant minds driving innovation at LAMACOP. From established principal investigators to driven doctoral candidates."
      />

      <section className="bg-slate-50">
        <div className="container py-10">
          <div className="mb-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members by name, position, or email..."
                />
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>
          </div>

          {!canManage && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              You can view the team directory. Only admins can add, edit, or
              delete team entries.
            </div>
          )}

          {showSelfCard && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">You</div>
              <div className="mt-3">
                <div className="text-base font-semibold text-slate-900">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    user.email}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {user.status === "pending"
                    ? "Team Member (pending approval)"
                    : "Team Member"}
                </div>
                <div className="mt-2 text-sm text-slate-600">{user.email}</div>
                {user.institution && (
                  <div className="mt-2 text-sm text-slate-600">
                    {user.institution}
                  </div>
                )}
              </div>
            </div>
          )}

          {canManage && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">
                Add Team Member
              </div>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Position
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Lab Director, PhD Student, ..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <FileDropzone
                  label="Photo (optional)"
                  helpText="PNG/JPG recommended. Stored locally in your browser."
                  accept="image/*"
                  maxSizeBytes={700 * 1024}
                  value={photo}
                  onChange={setPhoto}
                />

                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    if (!name.trim()) {
                      setError("Name is required.")
                      return
                    }
                    const next = addTeamMember({ name, position, email, photo: photo ?? undefined })
                    setItems([next, ...items])
                    setName("")
                    setPosition("")
                    setEmail("")
                    setPhoto(null)
                  }}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Add
                </button>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              title="No team members found"
              message={items.length === 0 ? "No entries yet." : "Try adjusting your search."}
            />
          ) : (
            <div className="grid gap-4">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className=""
                >
                  {canManage && editingId === m.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Name
                        </label>
                        <input
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Position
                        </label>
                        <input
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editPosition}
                          onChange={(e) => setEditPosition(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Email (optional)
                        </label>
                        <input
                          type="email"
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      </div>

                      <FileDropzone
                        label="Photo (optional)"
                        helpText="PNG/JPG recommended. Stored locally in your browser."
                        accept="image/*"
                        maxSizeBytes={700 * 1024}
                        value={editPhoto}
                        onChange={setEditPhoto}
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = updateTeamMember(m.id, {
                              name: editName,
                              position: editPosition,
                              email: editEmail,
                              photo: editPhoto ?? undefined,
                            })
                            if (!updated) return
                            setItems(
                              items.map((it) => (it.id === m.id ? updated : it))
                            )
                            setEditingId(null)
                          }}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-500 text-xl font-semibold text-white shadow-md">
                        {m.photo?.dataUrl ? (
                          <img
                            src={m.photo.dataUrl}
                            alt={m.photo.name || m.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(m.name)
                        )}
                      </div>
                      <div className="mt-4 text-lg font-semibold text-slate-900">
                        {m.name}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-brand-600">
                        {m.position || "Research Team"}
                      </div>
                      {m.email && (
                        <div className="mt-3 text-sm text-slate-600">{m.email}</div>
                      )}

                      {canManage && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(m.id)
                              setEditName(m.name)
                              setEditPosition(m.position)
                              setEditEmail(m.email ?? "")
                              setEditPhoto(m.photo ?? null)
                            }}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteTeamMember(m.id)
                              setItems(items.filter((it) => it.id !== m.id))
                            }}
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
