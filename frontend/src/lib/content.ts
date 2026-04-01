const RESEARCH_KEY = "lamacop.content.research"
const TEAM_KEY = "lamacop.content.team"
const PUBLICATIONS_KEY = "lamacop.content.publications"
const EQUIPMENT_KEY = "lamacop.content.equipment"
const NEWS_KEY = "lamacop.content.news"

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function readList<T>(key: string): T[] {
  if (!isBrowser()) return []
  return safeParseJson<T[]>(localStorage.getItem(key), [])
}

function writeList<T>(key: string, list: T[]) {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(list))
}

export type StoredMedia = {
  name: string
  type: string
  dataUrl: string
  size: number
}

export type ResearchProject = {
  id: string
  title: string
  summary: string
  link?: string
  image?: StoredMedia
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export type TeamMember = {
  id: string
  name: string
  position: string
  email?: string
  photo?: StoredMedia
  createdAt: string
  updatedAt: string
}

export type Publication = {
  id: string
  type: string
  title: string
  description?: string
  year: string
  venue: string
  link?: string
  image?: StoredMedia
  attachment?: StoredMedia
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export type EquipmentItem = {
  id: string
  name: string
  category: string
  status: string
  notes: string
  image?: StoredMedia
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export type NewsItem = {
  id: string
  title: string
  category: string
  body: string
  date: string
  image?: StoredMedia
  createdAt: string
  updatedAt: string
}

export function getResearchProjects(): ResearchProject[] {
  return readList<ResearchProject>(RESEARCH_KEY)
}

export function addResearchProject(input: {
  title: string
  summary: string
  createdBy?: string
  link?: string
  image?: ResearchProject["image"]
}): ResearchProject {
  const now = new Date().toISOString()
  const next: ResearchProject = {
    id: createId(),
    title: input.title.trim(),
    summary: input.summary.trim(),
    link: input.link?.trim() || undefined,
    image: input.image,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  }
  const list = getResearchProjects()
  writeList(RESEARCH_KEY, [next, ...list])
  return next
}

export function updateResearchProject(
  id: string,
  patch: Partial<Pick<ResearchProject, "title" | "summary" | "link" | "image">>
): ResearchProject | null {
  const list = getResearchProjects()
  const idx = list.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updated: ResearchProject = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  const next = [...list]
  next[idx] = updated
  writeList(RESEARCH_KEY, next)
  return updated
}

export function deleteResearchProject(id: string): boolean {
  const list = getResearchProjects()
  const next = list.filter((i) => i.id !== id)
  if (next.length === list.length) return false
  writeList(RESEARCH_KEY, next)
  return true
}

export function getTeamMembers(): TeamMember[] {
  return readList<TeamMember>(TEAM_KEY)
}

export function addTeamMember(input: {
  name: string
  position: string
  email?: string
  photo?: TeamMember["photo"]
}): TeamMember {
  const now = new Date().toISOString()
  const next: TeamMember = {
    id: createId(),
    name: input.name.trim(),
    position: input.position.trim(),
    email: input.email?.trim() || undefined,
    photo: input.photo,
    createdAt: now,
    updatedAt: now,
  }
  const list = getTeamMembers()
  writeList(TEAM_KEY, [next, ...list])
  return next
}

export function updateTeamMember(
  id: string,
  patch: Partial<Pick<TeamMember, "name" | "position" | "email" | "photo">>
): TeamMember | null {
  const list = getTeamMembers()
  const idx = list.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updated: TeamMember = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  const next = [...list]
  next[idx] = updated
  writeList(TEAM_KEY, next)
  return updated
}

export function deleteTeamMember(id: string): boolean {
  const list = getTeamMembers()
  const next = list.filter((i) => i.id !== id)
  if (next.length === list.length) return false
  writeList(TEAM_KEY, next)
  return true
}

export function getPublications(): Publication[] {
  const raw = readList<Publication & { type?: unknown }>(PUBLICATIONS_KEY)
  let changed = false
  const migrated: Publication[] = raw.map((p) => {
    const t = typeof p.type === "string" && p.type.trim() ? p.type.trim() : "Other"
    if (t !== (typeof p.type === "string" ? p.type : "")) changed = true

    const description =
      typeof (p as any).description === "string" && (p as any).description.trim()
        ? (p as any).description.trim()
        : undefined
    if (description !== (p as any).description) changed = true

    // Ensure only one image per publication.
    // If an older entry stored an image in `attachment`, move it to `image`.
    const attachmentIsImage =
      typeof p.attachment?.type === "string" && p.attachment.type.startsWith("image/")

    const nextImage = p.image ?? (attachmentIsImage ? p.attachment : undefined)
    const nextAttachment = attachmentIsImage ? undefined : p.attachment

    if (nextImage !== p.image || nextAttachment !== p.attachment) changed = true

    return {
      ...p,
      type: t,
      description,
      image: nextImage,
      attachment: nextAttachment,
    }
  })
  if (changed) writeList(PUBLICATIONS_KEY, migrated)
  return migrated
}

export function addPublication(input: {
  type: string
  title: string
  description?: string
  year: string
  venue: string
  createdBy?: string
  link?: string
  image?: Publication["image"]
  attachment?: Publication["attachment"]
}): Publication {
  const now = new Date().toISOString()
  const next: Publication = {
    id: createId(),
    type: input.type.trim() || "Other",
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    year: input.year.trim(),
    venue: input.venue.trim(),
    link: input.link?.trim() || undefined,
    image: input.image,
    attachment: input.attachment,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  }
  const list = getPublications()
  writeList(PUBLICATIONS_KEY, [next, ...list])
  return next
}

export function updatePublication(
  id: string,
  patch: Partial<Pick<Publication, "type" | "title" | "description" | "year" | "venue" | "link" | "image" | "attachment">>
): Publication | null {
  const list = getPublications()
  const idx = list.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updated: Publication = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  const next = [...list]
  next[idx] = updated
  writeList(PUBLICATIONS_KEY, next)
  return updated
}

export function deletePublication(id: string): boolean {
  const list = getPublications()
  const next = list.filter((i) => i.id !== id)
  if (next.length === list.length) return false
  writeList(PUBLICATIONS_KEY, next)
  return true
}

export function getEquipment(): EquipmentItem[] {
  return readList<EquipmentItem>(EQUIPMENT_KEY)
}

export function addEquipment(input: {
  name: string
  category: string
  status: string
  notes: string
  createdBy?: string
  image?: EquipmentItem["image"]
}): EquipmentItem {
  const now = new Date().toISOString()
  const next: EquipmentItem = {
    id: createId(),
    name: input.name.trim(),
    category: input.category.trim(),
    status: input.status.trim(),
    notes: input.notes.trim(),
    image: input.image,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  }
  const list = getEquipment()
  writeList(EQUIPMENT_KEY, [next, ...list])
  return next
}

export function updateEquipment(
  id: string,
  patch: Partial<Pick<EquipmentItem, "name" | "category" | "status" | "notes" | "image">>
): EquipmentItem | null {
  const list = getEquipment()
  const idx = list.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updated: EquipmentItem = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  const next = [...list]
  next[idx] = updated
  writeList(EQUIPMENT_KEY, next)
  return updated
}

export function deleteEquipment(id: string): boolean {
  const list = getEquipment()
  const next = list.filter((i) => i.id !== id)
  if (next.length === list.length) return false
  writeList(EQUIPMENT_KEY, next)
  return true
}

export function getNews(): NewsItem[] {
  return readList<NewsItem>(NEWS_KEY)
}

export function addNews(input: {
  title: string
  category: string
  body: string
  date: string
  image?: NewsItem["image"]
}): NewsItem {
  const now = new Date().toISOString()
  const next: NewsItem = {
    id: createId(),
    title: input.title.trim(),
    category: input.category.trim(),
    body: input.body.trim(),
    date: input.date.trim(),
    image: input.image,
    createdAt: now,
    updatedAt: now,
  }
  const list = getNews()
  writeList(NEWS_KEY, [next, ...list])
  return next
}

export function updateNews(
  id: string,
  patch: Partial<Pick<NewsItem, "title" | "category" | "body" | "date" | "image">>
): NewsItem | null {
  const list = getNews()
  const idx = list.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updated: NewsItem = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  const next = [...list]
  next[idx] = updated
  writeList(NEWS_KEY, next)
  return updated
}

export function deleteNews(id: string): boolean {
  const list = getNews()
  const next = list.filter((i) => i.id !== id)
  if (next.length === list.length) return false
  writeList(NEWS_KEY, next)
  return true
}
