"use client"

import { useEffect, useMemo, useState } from "react"
import EmptyState from "@/components/EmptyState"
import PageHeader from "@/components/PageHeader"
import FileDropzone, { type StoredFile } from "@/components/FileDropzone"
import { canManageAllContent, getCurrentUser } from "@/lib/auth"
import { addNews, deleteNews, getNews, updateNews, type NewsItem } from "@/lib/content"

const tabs = [
  "All News",
  "Announcement",
  "Achievement",
  "Grant",
  "Publication",
  "Event",
  "Recruitment",
] as const

type Tab = (typeof tabs)[number]

function getInitials(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function NewsPage() {
  const [tab, setTab] = useState<Tab>("All News")
  const user = getCurrentUser()
  const canManage = canManageAllContent(user)

  const [items, setItems] = useState<NewsItem[]>([])

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<(typeof tabs)[number]>("Announcement")
  const [date, setDate] = useState("")
  const [body, setBody] = useState("")
  const [image, setImage] = useState<StoredFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState<string>("")
  const [editDate, setEditDate] = useState("")
  const [editBody, setEditBody] = useState("")
  const [editImage, setEditImage] = useState<StoredFile | null>(null)

  useEffect(() => {
    setItems(getNews())
  }, [])

  const filtered = useMemo(() => {
    if (tab === "All News") return items
    return items.filter((n) => n.category === tab)
  }, [items, tab])

  return (
    <div>
      <PageHeader
        title="News & Announcements"
        subtitle="Stay up to date with the latest discoveries, publications, grants, and events from the LAMACOP team."
      />

      <section className="bg-slate-50">
        <div className="container py-10">
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={
                  t === tab
                    ? "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                }
              >
                {t}
              </button>
            ))}
          </div>

          {canManage && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Add News</div>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Category
                    </label>
                    <select
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Tab)}
                    >
                      {tabs.filter((t) => t !== "All News").map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Date
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="2026-04-01"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Body
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
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
                    const next = addNews({
                      title,
                      category,
                      body,
                      date: date || new Date().toISOString().slice(0, 10),
                      image: image ?? undefined,
                    })
                    setItems([next, ...items])
                    setTitle("")
                    setBody("")
                    setDate("")
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
              title="No news found"
              message="No articles match the selected category."
            />
          ) : (
            <div className="grid gap-4">
              {filtered.map((n) => (
                <div key={n.id}>
                  {canManage && editingId === n.id ? (
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
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">
                            Category
                          </label>
                          <select
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                          >
                            {tabs
                              .filter((t) => t !== "All News")
                              .map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">
                            Date
                          </label>
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Body
                        </label>
                        <textarea
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                          rows={4}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
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
                            const updated = updateNews(n.id, {
                              title: editTitle,
                              category: editCategory,
                              body: editBody,
                              date: editDate,
                              image: editImage ?? undefined,
                            })
                            if (!updated) return
                            setItems(
                              items.map((it) =>
                                it.id === n.id ? updated : it
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
                        {n.category}
                      </div>
                      <div className="mx-auto h-44 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                        {n.image?.url || n.image?.dataUrl ? (
                          <img
                            src={n.image.url ?? n.image.dataUrl}
                            alt={n.image.name || n.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 text-4xl font-semibold text-brand-700">
                            {getInitials(n.title)}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-lg font-semibold text-slate-900">
                        {n.title}
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        {n.body}
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {n.date}
                        </span>
                      </div>

                      {canManage && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(n.id)
                              setEditTitle(n.title)
                              setEditCategory(n.category)
                              setEditBody(n.body)
                              setEditDate(n.date)
                              setEditImage((n.image as StoredFile) ?? null)
                            }}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteNews(n.id)
                              setItems(items.filter((it) => it.id !== n.id))
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
