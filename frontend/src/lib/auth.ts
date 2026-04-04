export const AUTH_STORAGE_EVENT = "lamacop-auth"

export type UserRole = "admin" | "team" | "user"
export type AccountStatus = "active" | "pending"

export type PublicUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  status: AccountStatus
  institution?: string
  createdAt: string
  updatedAt: string
}

type BackendUser = {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  institution: string | null
  role: UserRole
  status: AccountStatus
  created_at: string
  updated_at: string
}

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string
  }
}

let currentUser: PublicUser | null = null

function notifyAuthChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT))
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "")
}

function mapFrontendRoleToBackendRole(role: UserRole): UserRole {
  if (role === "admin") return "admin"
  if (role === "team") return "team"
  return "user"
}

async function getBackendUserByEmail(email: string): Promise<BackendUser | null> {
  const response = await fetch(`${getApiBaseUrl()}/users/by-email/${encodeURIComponent(email)}`)
  if (response.status === 404) return null
  if (!response.ok) return null
  return (await response.json()) as BackendUser
}

function fromBackendUser(user: BackendUser): PublicUser {
  return {
    id: String(user.id),
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    email: user.email,
    role: user.role,
    status: user.status,
    institution: user.institution ?? undefined,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

async function fetchAllUsersFromBackend(): Promise<PublicUser[]> {
  const pageSize = 100
  const users: PublicUser[] = []
  let skip = 0

  while (true) {
    const response = await fetch(`${getApiBaseUrl()}/users?skip=${skip}&limit=${pageSize}`)
    if (!response.ok) {
      throw new Error("Failed to load users from backend.")
    }

    const batch = (await response.json()) as BackendUser[]
    users.push(...batch.map(fromBackendUser))
    if (batch.length < pageSize) break
    skip += pageSize
  }

  return users
}

export function getCurrentUser(): PublicUser | null {
  return currentUser
}

export async function getAllUsers(): Promise<PublicUser[]> {
  return fetchAllUsersFromBackend()
}

export async function getPendingTeamUsers(): Promise<PublicUser[]> {
  const users = await fetchAllUsersFromBackend()
  return users.filter((u) => u.role === "team" && u.status === "pending")
}

export async function approveTeamUser(userId: string): Promise<{ ok: true } | { error: string }> {
  const response = await fetch(`${getApiBaseUrl()}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "active" }),
  })

  if (!response.ok) {
    let message = "Approval failed."
    try {
      const err = (await response.json()) as { detail?: string }
      if (typeof err.detail === "string" && err.detail) {
        message = err.detail
      }
    } catch {
    }
    return { error: message }
  }

  if (currentUser && currentUser.id === userId) {
    currentUser = { ...currentUser, status: "active", updatedAt: new Date().toISOString() }
  }
  notifyAuthChange()
  return { ok: true }
}

export async function rejectUser(userId: string): Promise<{ ok: true } | { error: string }> {
  const response = await fetch(`${getApiBaseUrl()}/users/${userId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    let message = "Rejection failed."
    try {
      const err = (await response.json()) as { detail?: string }
      if (typeof err.detail === "string" && err.detail) {
        message = err.detail
      }
    } catch {
    }
    return { error: message }
  }

  if (currentUser && currentUser.id === userId) {
    currentUser = null
  }
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
  const email = normalizeEmail(input.email)
  if (!email) return { error: "Email is required." }
  if (!input.password) return { error: "Password is required." }

  const existing = await getBackendUserByEmail(email)
  if (existing) return { error: "This email is already registered." }

  const existingUsers = await fetchAllUsersFromBackend()
  const role: UserRole = existingUsers.length === 0 ? "admin" : input.role
  const status: AccountStatus = role === "team" ? "pending" : "active"
  const backendRole = mapFrontendRoleToBackendRole(role)

  try {
    const response = await fetch(`${getApiBaseUrl()}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        password: input.password,
        role: backendRole,
        institution: input.institution?.trim() || null,
        status,
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
      }
      return { error: message }
    }

    const backendUser = (await response.json()) as BackendUser
    currentUser = fromBackendUser(backendUser)
    notifyAuthChange()
    return { user: currentUser }
  } catch {
    return { error: "Cannot reach backend API. Check backend container and NEXT_PUBLIC_API_URL." }
  }
}

export async function loginUser(input: {
  email: string
  password: string
}): Promise<{ user: PublicUser } | { error: string }> {
  const email = normalizeEmail(input.email)

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: input.password,
      }),
    })

    if (!response.ok) {
      let message = "Invalid login credentials."
      try {
        const err = (await response.json()) as { detail?: string }
        if (typeof err.detail === "string" && err.detail) {
          message = err.detail
        }
      } catch {
      }
      return { error: message }
    }

    const backendUser = (await response.json()) as BackendUser
    currentUser = fromBackendUser(backendUser)
    notifyAuthChange()
    return { user: currentUser }
  } catch {
    return { error: "Cannot reach backend API. Check backend container and NEXT_PUBLIC_API_URL." }
  }
}

export function logoutUser() {
  currentUser = null
  notifyAuthChange()
}

export async function updateCurrentUserProfile(patch: {
  firstName?: string
  lastName?: string
  institution?: string
}): Promise<{ user: PublicUser } | { error: string }> {
  if (!currentUser) return { error: "Not logged in." }

  const response = await fetch(`${getApiBaseUrl()}/users/${currentUser.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: patch.firstName ?? currentUser.firstName,
      last_name: patch.lastName ?? currentUser.lastName,
      institution: patch.institution ?? currentUser.institution ?? null,
    }),
  })

  if (!response.ok) {
    let message = "Failed to update profile in backend database."
    try {
      const err = (await response.json()) as { detail?: string }
      if (typeof err.detail === "string" && err.detail) {
        message = err.detail
      }
    } catch {
    }
    return { error: message }
  }

  const backendUser = (await response.json()) as BackendUser
  currentUser = fromBackendUser(backendUser)
  notifyAuthChange()
  return { user: currentUser }
}

export async function resetCurrentUserPassword(input: {
  confirmEmail: string
  newPassword: string
}): Promise<{ ok: true } | { error: string }> {
  if (!currentUser) return { error: "Not logged in." }

  const confirmEmail = normalizeEmail(input.confirmEmail)
  if (confirmEmail !== normalizeEmail(currentUser.email)) {
    return { error: "Email confirmation does not match your account." }
  }
  if (!input.newPassword) return { error: "New password is required." }

  const response = await fetch(`${getApiBaseUrl()}/users/${currentUser.id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: input.newPassword }),
  })

  if (!response.ok) {
    let message = "Failed to update password in backend database."
    try {
      const err = (await response.json()) as { detail?: string }
      if (typeof err.detail === "string" && err.detail) {
        message = err.detail
      }
    } catch {
    }
    return { error: message }
  }

  const backendUser = (await response.json()) as BackendUser
  currentUser = fromBackendUser(backendUser)
  notifyAuthChange()
  return { ok: true }
}

export async function deleteCurrentUser(): Promise<{ ok: true } | { error: string }> {
  if (!currentUser) return { error: "Not logged in." }

  const response = await fetch(`${getApiBaseUrl()}/users/${currentUser.id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    let message = "Failed to delete account from backend database."
    try {
      const err = (await response.json()) as { detail?: string }
      if (typeof err.detail === "string" && err.detail) {
        message = err.detail
      }
    } catch {
    }
    return { error: message }
  }

  currentUser = null
  notifyAuthChange()
  return { ok: true }
}
