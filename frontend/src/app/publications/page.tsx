"use client"

import { useEffect, useMemo, useState } from "react"
import EmptyState from "@/components/EmptyState"
import PageHeader from "@/components/PageHeader"
import FileDropzone, { type StoredFile } from "@/components/FileDropzone"
import {
  canAddPublications,
  canManageAllContent,
  getCurrentUser,
} from "@/lib/auth"
import {
  addPublication,
  deletePublication,
  getPublications,
  updatePublication,
  type Publication,
} from "@/lib/content"

function getInitials(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function PublicationsPage() {
  const user = getCurrentUser()
  const canAdd = canAddPublications(user)
  const canManage = canManageAllContent(user)

  const [items, setItems] = useState<Publication[]>([])
  const [query, setQuery] = useState("")
  const [yearFilter, setYearFilter] = useState("All Years")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [type, setType] = useState("Journal Article")
  const [customType, setCustomType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [year, setYear] = useState("")
  const [venue, setVenue] = useState("")
  const [link, setLink] = useState("")
  const [attachment, setAttachment] = useState<StoredFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editType, setEditType] = useState("Journal Article")
  const [editCustomType, setEditCustomType] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editYear, setEditYear] = useState("")
  const [editVenue, setEditVenue] = useState("")
  const [editLink, setEditLink] = useState("")
  const [editAttachment, setEditAttachment] = useState<StoredFile | null>(null)

  const createdBy = useMemo(() => user?.email, [user?.email])

  useEffect(() => {
    setItems(getPublications())
  }, [])

  const years = useMemo(() => {
    const set = new Set(items.map((p) => p.year).filter(Boolean))
    return ["All Years", ...Array.from(set).sort().reverse()]
  }, [items])

  const types = useMemo(() => {
    const known = [
      "Journal Article",
      "Conference Paper",
      "Book Chapter",
      "Preprint",
      "Thesis",
      "Other",
    ]
    const fromItems = Array.from(
      new Set(items.map((p) => p.type).filter(Boolean))
    )
    const merged = Array.from(new Set([...known, ...fromItems]))
    return ["All Types", ...merged]
  }, [items])

  const typeOptions = useMemo(
    () => [
      "Journal Article",
      "Conference Paper",
      "Book Chapter",
      "Preprint",
      "Thesis",
      "Other",
    ],
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      if (yearFilter !== "All Years" && p.year !== yearFilter) return false
      if (typeFilter !== "All Types" && p.type !== typeFilter) return false
      if (!q) return true
      const hay = `${p.type} ${p.title} ${p.description ?? ""} ${p.venue} ${p.year}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query, yearFilter, typeFilter])

  return (
    <div>
      <PageHeader
        title="Publications"
        subtitle="A comprehensive archive of peer-reviewed articles, conference papers, and chapters produced by LAMACOP researchers."
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
                  placeholder="Search by title, venue, or year..."
                />
              </div>

              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 md:w-52"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 md:w-52"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
              You can browse publications. To add publications and upload files,
              login as an approved team member or admin.
            </div>
          )}

          {canAdd && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">
                Add Publication
              </div>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Type
                  </label>
                  <select
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={type}
                    onChange={(e) => {
                      const next = e.target.value
                      setType(next)
                      if (next !== "Other") setCustomType("")
                    }}
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {type === "Other" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Custom type
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="Write the type..."
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Title
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Description (optional)
                  </label>
                  <textarea
                    className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Year
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2026"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Venue
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Journal / Conference"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Link (optional)
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="DOI / URL (https://...)"
                  />
                </div>

                

                <FileDropzone
                  label="Attachment (optional)"
                  helpText="PDF only. Stored locally in your browser."
                  accept="application/pdf"
                  maxSizeBytes={1024 * 1024}
                  value={attachment}
                  onChange={setAttachment}
                />

                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    if (!title.trim()) {
                      setError("Title is required.")
                      return
                    }
                    const resolvedType =
                      type === "Other" ? customType.trim() || "Other" : type
                    const next = addPublication({
                      type: resolvedType,
                      title,
                      description: description.trim() || undefined,
                      year,
                      venue,
                      createdBy,
                      link: link.trim() || undefined,
                      attachment: attachment ?? undefined,
                    })
                    setItems([next, ...items])
                    setType("Journal Article")
                    setCustomType("")
                    setTitle("")
                    setDescription("")
                    setYear("")
                    setVenue("")
                    setLink("")
                    setAttachment(null)
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
              title="No publications found"
              message="Try adjusting your search."
            />
          ) : (
            <div className="grid gap-4">
              {filtered.map((pub) => (
                <div
                  key={pub.id}
                  className=""
                >
                  {canManage && editingId === pub.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Type
                        </label>
                        <select
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editType}
                          onChange={(e) => {
                            const next = e.target.value
                            setEditType(next)
                            if (next !== "Other") setEditCustomType("")
                          }}
                        >
                          {typeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {editType === "Other" && (
                        <div>
                          <label className="text-xs font-semibold text-slate-700">
                            Custom type
                          </label>
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={editCustomType}
                            onChange={(e) => setEditCustomType(e.target.value)}
                            placeholder="Write the type..."
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Title
                        </label>
                        <input
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Description (optional)
                        </label>
                        <textarea
                          className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Short summary..."
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">
                            Year
                          </label>
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={editYear}
                            onChange={(e) => setEditYear(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">
                            Venue
                          </label>
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={editVenue}
                            onChange={(e) => setEditVenue(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Link (optional)
                        </label>
                        <input
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          placeholder="DOI / URL (https://...)"
                        />
                      </div>

                      <FileDropzone
                        label="Attachment (optional)"
                        helpText="PDF only. Stored locally in your browser."
                        accept="application/pdf"
                        maxSizeBytes={1024 * 1024}
                        value={editAttachment}
                        onChange={setEditAttachment}
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const resolvedType =
                              editType === "Other"
                                ? editCustomType.trim() || "Other"
                                : editType
                            const updated = updatePublication(pub.id, {
                              type: resolvedType,
                              title: editTitle,
                              description:
                                editDescription.trim() || undefined,
                              year: editYear,
                              venue: editVenue,
                              link: editLink.trim() || undefined,
                              attachment: editAttachment ?? undefined,
                            })
                            if (!updated) return
                            setItems(
                              items.map((it) =>
                                it.id === pub.id ? updated : it
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
                        {pub.type}
                      </div>
                      <div className="mx-auto h-44 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                        {pub.image?.dataUrl ? (
                          <img
                            src={pub.image.dataUrl}
                            alt={pub.image.name || pub.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 text-4xl font-semibold text-brand-700">
                            {getInitials(pub.title)}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-lg font-semibold text-slate-900">
                        {pub.title}
                      </div>
                      {pub.description && (
                        <div className="mt-3 text-sm text-slate-600">
                          {pub.description}
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {[pub.year, pub.venue].filter(Boolean).join(" · ") && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {[pub.year, pub.venue].filter(Boolean).join(" · ")}
                          </span>
                        )}
                        {pub.link && (
                          <a
                            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                            href={pub.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open link
                          </a>
                        )}
                        {pub.attachment && (
                          <a
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                            href={pub.attachment.dataUrl}
                            download={pub.attachment.name}
                          >
                            Download PDF
                          </a>
                        )}
                        {pub.createdBy && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            Added by {pub.createdBy}
                          </span>
                        )}
                      </div>

                      {canManage && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(pub.id)
                              if (typeOptions.includes(pub.type)) {
                                setEditType(pub.type)
                                setEditCustomType("")
                              } else {
                                setEditType("Other")
                                setEditCustomType(pub.type)
                              }
                              setEditTitle(pub.title)
                              setEditDescription(pub.description ?? "")
                              setEditYear(pub.year)
                              setEditVenue(pub.venue)
                              setEditLink(pub.link ?? "")
                              setEditAttachment(pub.attachment ?? null)
                            }}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deletePublication(pub.id)
                              setItems(items.filter((it) => it.id !== pub.id))
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
