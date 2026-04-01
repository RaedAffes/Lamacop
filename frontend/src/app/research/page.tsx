"use client"

import { useEffect, useMemo, useState } from "react"
import EmptyState from "@/components/EmptyState"
import PageHeader from "@/components/PageHeader"
import FileDropzone, { type StoredFile } from "@/components/FileDropzone"
import {
  canAddResearch,
  canManageAllContent,
  getCurrentUser,
} from "@/lib/auth"
import {
  addResearchProject,
  deleteResearchProject,
  getResearchProjects,
  updateResearchProject,
  type ResearchProject,
} from "@/lib/content"

function getInitials(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function ResearchPage() {
  const user = getCurrentUser()
  const canAdd = canAddResearch(user)
  const canManage = canManageAllContent(user)

  const [items, setItems] = useState<ResearchProject[]>([])
  const [query, setQuery] = useState("")
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [link, setLink] = useState("")
  const [image, setImage] = useState<StoredFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editSummary, setEditSummary] = useState("")
  const [editLink, setEditLink] = useState("")
  const [editImage, setEditImage] = useState<StoredFile | null>(null)

  const createdBy = useMemo(() => user?.email, [user?.email])

  useEffect(() => {
    setItems(getResearchProjects())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      if (projectFilter !== "All Projects") return true
      if (!q) return true
      const hay = `${p.title} ${p.summary}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query, projectFilter])

  return (
    <div>
      <PageHeader
        title="Research Projects"
        subtitle="Explore our ongoing and completed investigations into advanced polymer architectures, sustainable materials, and nanoscale phenomena."
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
                  placeholder="Search projects by title, description, or area..."
                />
              </div>

              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 md:w-52"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="All Projects">All Projects</option>
              </select>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>
          </div>

          {!canAdd && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              You can browse projects. To add projects, login as an approved
              team member or admin.
            </div>
          )}

          {canAdd && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">
                Add Project
              </div>
              <div className="mt-4 grid gap-4">
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
                    Summary
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Link (optional)
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
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
                    if (!title.trim()) {
                      setError("Title is required.")
                      return
                    }
                    const next = addResearchProject({
                      title,
                      summary,
                      createdBy,
                      link: link.trim() || undefined,
                      image: image ?? undefined,
                    })
                    setItems([next, ...items])
                    setTitle("")
                    setSummary("")
                    setLink("")
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
              title="No projects found"
              message={items.length === 0 ? "Try adding a project." : "Try adjusting your search."}
            />
          ) : (
            <div className="grid gap-4">
              {filtered.map((p) => (
                <div key={p.id}>
                  {canManage && editingId === p.id ? (
                    <div className="space-y-4">
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
                          Summary
                        </label>
                        <textarea
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          rows={4}
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Link (optional)
                        </label>
                        <input
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          placeholder="https://..."
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
                            const updated = updateResearchProject(p.id, {
                              title: editTitle,
                              summary: editSummary,
                              link: editLink.trim() || undefined,
                              image: editImage ?? undefined,
                            })
                            if (!updated) return
                            setItems(
                              items.map((it) => (it.id === p.id ? updated : it))
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
                        Research
                      </div>
                      <div className="mx-auto h-44 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                        {p.image?.dataUrl ? (
                          <img
                            src={p.image.dataUrl}
                            alt={p.image.name || p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 text-4xl font-semibold text-brand-700">
                            {getInitials(p.title)}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-lg font-semibold text-slate-900">
                        {p.title}
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        {p.summary}
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {p.link && (
                          <a
                            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open link
                          </a>
                        )}
                        {p.createdBy && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            Added by {p.createdBy}
                          </span>
                        )}
                      </div>

                      {canManage && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(p.id)
                              setEditTitle(p.title)
                              setEditSummary(p.summary)
                              setEditLink(p.link ?? "")
                              setEditImage((p.image as StoredFile) ?? null)
                            }}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteResearchProject(p.id)
                              setItems(items.filter((it) => it.id !== p.id))
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
