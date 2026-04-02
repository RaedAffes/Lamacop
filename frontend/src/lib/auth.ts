const USERS_KEY = "lamacop.users"
const SESSION_KEY = "lamacop.session"
export const AUTH_STORAGE_EVENT = "lamacop-auth"

export type UserRole = "admin" | "team" | "user"
export type AccountStatus = "active" | "pending"

export type StoredUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  status: AccountStatus
  institution?: string
  createdAt: string
}

export type PublicUser = Omit<StoredUser, "password">

type Session = {
  email: string
  createdAt: string
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function notifyAuthChange() {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT))
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function readUsers(): StoredUser[] {
  if (!isBrowser()) return []
  const raw = safeParseJson<Array<Partial<StoredUser> & { role?: string }>>(
    localStorage.getItem(USERS_KEY),
    []
  )

  return raw
    .filter((u) => typeof u.email === "string" && typeof u.id === "string")
    .map((u) => {
      const role =
        u.role === "admin" || u.role === "team" || u.role === "user"
          ? u.role
          : "user"
      const status = u.status === "pending" || u.status === "active" ? u.status : "active"

      return {
        id: u.id as string,
        firstName: (u.firstName ?? "") as string,
        lastName: (u.lastName ?? "") as string,
        email: (u.email ?? "") as string,
        password: (u.password ?? "") as string,
        role,
        status,
        institution: (u.institution ?? undefined) as string | undefined,
        createdAt: (u.createdAt ?? new Date().toISOString()) as string,
      }
    })
}

function writeUsers(users: StoredUser[]) {
  if (!isBrowser()) return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession(): Session | null {
  if (!isBrowser()) return null
  return safeParseJson<Session | null>(localStorage.getItem(SESSION_KEY), null)
}

function writeSession(session: Session) {
  if (!isBrowser()) return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession() {
  if (!isBrowser()) return
  localStorage.removeItem(SESSION_KEY)
}

function toPublicUser(user: StoredUser): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user
  return rest
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function createId() {
  // Enough uniqueness for client-only demo usage.
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "")
}

function mapFrontendRoleToBackendRole(role: UserRole): "student" | "researcher" | "admin" {
  if (role === "admin") return "admin"
  if (role === "team") return "researcher"
  return "student"
}

export function getCurrentUser(): PublicUser | null {
  const session = readSession()
  if (!session?.email) return null

  const users = readUsers()
  const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(session.email))
  return user ? toPublicUser(user) : null
}

export function getAllUsers(): PublicUser[] {
  return readUsers().map(toPublicUser)
}

export function getPendingTeamUsers(): PublicUser[] {
  return readUsers()
    .filter((u) => u.role === "team" && u.status === "pending")
    .map(toPublicUser)
}

export function approveTeamUser(userId: string): { ok: true } | { error: string } {
  if (!isBrowser()) return { error: "Approval is only available in the browser." }

  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return { error: "User not found." }
  if (users[idx].role !== "team") return { error: "Only team members require approval." }

  users[idx] = { ...users[idx], status: "active" }
  writeUsers(users)
  notifyAuthChange()
  return { ok: true }
}

export function rejectUser(userId: string): { ok: true } | { error: string } {
  if (!isBrowser()) return { error: "Rejection is only available in the browser." }

  const users = readUsers()
  const next = users.filter((u) => u.id !== userId)
  if (next.length === users.length) return { error: "User not found." }

  writeUsers(next)
  notifyAuthChange()
  return { ok: true }
}

export function isAdmin(user: PublicUser | null): boolean {
  return !!user && user.role === "admin" && user.status === "active"
}

export function isApprovedTeamMember(user: PublicUser | null): boolean {
  return !!user && user.role === "team" && user.status === "active"
}

export function canContact(user: PublicUser | null): boolean {
  // Treat pending team members as regular signed-in users for basic access.
  return !!user
}

export function canAddResearch(user: PublicUser | null): boolean {
  return isAdmin(user) || isApprovedTeamMember(user)
}

export function canAddPublications(user: PublicUser | null): boolean {
  return isAdmin(user) || isApprovedTeamMember(user)
}

export function canAddEquipment(user: PublicUser | null): boolean {
  return isAdmin(user) || isApprovedTeamMember(user)
}

export function canManageAllContent(user: PublicUser | null): boolean {
  return isAdmin(user)
}

export async function registerUser(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  institution?: string
}): Promise<{ user: PublicUser } | { error: string }> {
  if (!isBrowser()) return { error: "Registration is only available in the browser." }

  const email = normalizeEmail(input.email)
  if (!email) return { error: "Email is required." }
  if (!input.password) return { error: "Password is required." }

  const users = readUsers()
  const existing = users.find((u) => normalizeEmail(u.email) === email)
  if (existing) return { error: "This email is already registered." }

  const isFirstAccount = users.length === 0
  const role: UserRole = isFirstAccount ? "admin" : input.role
  const status: AccountStatus =
    role === "team" && !isFirstAccount ? "pending" : "active"

  const fullName = `${input.firstName} ${input.lastName}`.trim()
  const backendRole = mapFrontendRoleToBackendRole(role)

  try {
    const response = await fetch(`${getApiBaseUrl()}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name: fullName,
        password: input.password,
        role: backendRole,
        bio: input.institution?.trim() || null,
      }),
    })

    if (!response.ok) {
      let message = "Failed to create user in backend database."
      try {
        const err = (await response.json()) as { detail?: string }
        if (typeof err.detail === "string" && err.detail) {
          message = err.detail
        }
      } catch {
        // Keep default message when backend error body is not JSON.
      }
      return { error: message }
    }
  } catch {
    return { error: "Cannot reach backend API. Check backend container and NEXT_PUBLIC_API_URL." }
  }

  const newUser: StoredUser = {
    id: createId(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    password: input.password,
    role,
    status,
    institution: input.institution?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }

  writeUsers([newUser, ...users])
  writeSession({ email, createdAt: new Date().toISOString() })
  notifyAuthChange()

  return { user: toPublicUser(newUser) }
}

export function loginUser(input: {
  email: string
  password: string
}): { user: PublicUser } | { error: string } {
  if (!isBrowser()) return { error: "Login is only available in the browser." }

  const email = normalizeEmail(input.email)
  const password = input.password

  const users = readUsers()
  const user = users.find((u) => normalizeEmail(u.email) === email)
  if (!user) return { error: "Account not found. Please sign up first." }
  if (user.password !== password) return { error: "Invalid password." }

  writeSession({ email, createdAt: new Date().toISOString() })
  notifyAuthChange()

  return { user: toPublicUser(user) }
}

export function logoutUser() {
  clearSession()
  notifyAuthChange()
}

export function updateCurrentUserProfile(patch: {
  firstName?: string
  lastName?: string
  institution?: string
}): { user: PublicUser } | { error: string } {
  if (!isBrowser()) return { error: "Profile updates are only available in the browser." }

  const session = readSession()
  if (!session?.email) return { error: "Not logged in." }

  const users = readUsers()
  const idx = users.findIndex(
    (u) => normalizeEmail(u.email) === normalizeEmail(session.email)
  )
  if (idx === -1) return { error: "User not found." }

  users[idx] = {
    ...users[idx],
    firstName: (patch.firstName ?? users[idx].firstName).trim(),
    lastName: (patch.lastName ?? users[idx].lastName).trim(),
    institution:
      (patch.institution ?? users[idx].institution ?? "").trim() || undefined,
  }
  writeUsers(users)
  notifyAuthChange()
  return { user: toPublicUser(users[idx]) }
}

export function resetCurrentUserPassword(input: {
  confirmEmail: string
  newPassword: string
}): { ok: true } | { error: string } {
  if (!isBrowser()) return { error: "Password reset is only available in the browser." }

  const session = readSession()
  if (!session?.email) return { error: "Not logged in." }

  const confirmEmail = normalizeEmail(input.confirmEmail)
  if (confirmEmail !== normalizeEmail(session.email)) {
    return { error: "Email confirmation does not match your account." }
  }
  if (!input.newPassword) return { error: "New password is required." }

  const users = readUsers()
  const idx = users.findIndex(
    (u) => normalizeEmail(u.email) === normalizeEmail(session.email)
  )
  if (idx === -1) return { error: "User not found." }

  users[idx] = { ...users[idx], password: input.newPassword }
  writeUsers(users)
  notifyAuthChange()
  return { ok: true }
}

export function deleteCurrentUser(): { ok: true } | { error: string } {
  if (!isBrowser()) return { error: "Account deletion is only available in the browser." }

  const session = readSession()
  if (!session?.email) return { error: "Not logged in." }

  const users = readUsers()
  const next = users.filter(
    (u) => normalizeEmail(u.email) !== normalizeEmail(session.email)
  )
  if (next.length === users.length) return { error: "User not found." }

  writeUsers(next)
  clearSession()
  notifyAuthChange()
  return { ok: true }
}
