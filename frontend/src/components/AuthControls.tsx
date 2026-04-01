"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AUTH_STORAGE_EVENT,
  canManageAllContent,
  getCurrentUser,
  getPendingTeamUsers,
  isAdmin,
  logoutUser,
  type PublicUser,
} from "@/lib/auth"

export default function AuthControls() {
  const router = useRouter()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const sync = () => {
      const current = getCurrentUser()
      setUser(current)
      setPendingCount(isAdmin(current) ? getPendingTeamUsers().length : 0)
    }

    sync()
    window.addEventListener(AUTH_STORAGE_EVENT, sync)
    window.addEventListener("storage", sync)

    return () => {
      window.removeEventListener(AUTH_STORAGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
        >
          Sign Up
        </Link>
      </>
    )
  }

  return (
    <>
      <Link
        href="/profile"
        className="text-sm font-semibold text-slate-600 transition-colors hover:text-brand-600"
      >
        {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
        {pendingCount > 0 && (
          <span className="ml-2 inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
            {pendingCount}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={() => {
          logoutUser()
          setUser(null)
          router.push("/")
          router.refresh()
        }}
        className="text-sm font-semibold text-slate-600 transition-colors hover:text-brand-600"
      >
        Sign Out
      </button>
    </>
  )
}
