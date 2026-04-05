"use client"

import { useEffect, useMemo, useState } from "react"
import EmptyState from "@/components/EmptyState"
import PageHeader from "@/components/PageHeader"
import FileDropzone, { type StoredFile } from "@/components/FileDropzone"
import { canAddEquipment, canManageAllContent, getCurrentUser } from "@/lib/auth"
import {
  addEquipment,
  deleteEquipment,
  getEquipment,
  updateEquipment,
  type EquipmentItem,
} from "@/lib/content"

function getInitials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function EquipmentPage() {
  const user = getCurrentUser()
  const canAdd = canAddEquipment(user)
  const canManage = canManageAllContent(user)

  const [items, setItems] = useState<EquipmentItem[]>([])
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("Any Status")
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [image, setImage] = useState<StoredFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editImage, setEditImage] = useState<StoredFile | null>(null)

  const createdBy = useMemo(() => user?.email, [user?.email])

  useEffect(() => {
    setItems(getEquipment())
  }, [])

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean))
    return ["All Categories", ...Array.from(set).sort()]
  }, [items])

  const statuses = useMemo(() => {
    const set = new Set(items.map((i) => i.status).filter(Boolean))
    return ["Any Status", ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((eq) => {
      if (categoryFilter !== "All Categories" && eq.category !== categoryFilter)
        return false
      if (statusFilter !== "Any Status" && eq.status !== statusFilter)
        return false
      if (!q) return true
      const hay = `${eq.name} ${eq.category} ${eq.status} ${eq.notes}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query, categoryFilter, statusFilter])

  return (
    <div>
      <PageHeader
        title="Facilities & Equipment"
        subtitle="State-of-the-art instrumentation available for chemical synthesis, structural characterization, and material properties analysis."
      />

      <section className="bg-slate-50">
        <div className="container py-10">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search equipment by name or category..."
                />
              </div>

              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 md:w-52"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 md:w-52"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>
          </div>

          {!canAdd && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              You can browse equipment. To add equipment, login as an approved
              team member or admin.
            </div>
          )}

          {canAdd && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">
                Add Equipment
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Category
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="XRD, DSC, ..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Status
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder="Available"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Notes
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <FileDropzone
                  label="Image (optional)"
                  helpText="PNG/JPG recommended. Stored locally in your browser."
                  accept="image/*"
                  maxSizeBytes={700 * 1024}
                  value={image}
                  onChange={setImage}
                />

                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    if (!name.trim()) {
                      setError("Name is required.")
                      return
                    }
                    const next = addEquipment({
                      name,
                      category,
                      status,
                      notes,
                      createdBy,
                      image: image ?? undefined,
                    })
                    setItems([next, ...items])
                    setName("")
                    setCategory("")
                    setStatus("")
                    setNotes("")
                    setImage(null)
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
              title="No equipment found"
              message={items.length === 0 ? "Try adding equipment." : "Try adjusting your search."}
            />
          ) : (
            <div className="grid gap-4">
              {filtered.map((eq) => (
                <div key={eq.id}>
                  {canManage && editingId === eq.id ? (
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
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">
                            Category
                          </label>
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">
                            Status
                          </label>
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Notes
                        </label>
                        <textarea
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          rows={4}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />
                      </div>

                      <FileDropzone
                        label="Image (optional)"
                        helpText="PNG/JPG recommended. Stored locally in your browser."
                        accept="image/*"
                        maxSizeBytes={700 * 1024}
                        value={editImage}
                        onChange={setEditImage}
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = updateEquipment(eq.id, {
                              name: editName,
                              category: editCategory,
                              status: editStatus,
                              notes: editNotes,
                              image: editImage ?? undefined,
                            })
                            if (!updated) return
                            setItems(
                              items.map((it) =>
                                it.id === eq.id ? updated : it
                              )
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
                      <div className="absolute right-4 top-4 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        Equipment
                      </div>
                      <div className="mx-auto h-44 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                        {eq.image?.url || eq.image?.dataUrl ? (
                          <img
                            src={eq.image.url ?? eq.image.dataUrl}
                            alt={eq.image.name || eq.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 text-4xl font-semibold text-brand-700">
                            {getInitials(eq.name)}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-lg font-semibold text-slate-900">
                        {eq.name}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-brand-600">
                        {eq.category || "Lab Equipment"}
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        {eq.notes || "Specialized instrumentation for research."}
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {eq.status && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {eq.status}
                          </span>
                        )}
                        {eq.createdBy && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            Added by {eq.createdBy}
                          </span>
                        )}
                      </div>

                      {canManage && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(eq.id)
                              setEditName(eq.name)
                              setEditCategory(eq.category)
                              setEditStatus(eq.status)
                              setEditNotes(eq.notes)
                              setEditImage((eq.image as StoredFile) ?? null)
                            }}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteEquipment(eq.id)
                              setItems(items.filter((it) => it.id !== eq.id))
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
