"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      if (mode === "register") {
        await api.register({
          full_name: fullName,
          email,
          password,
          role,
          admin_key: role === "admin" ? adminKey : undefined,
        });
        setMode("login");
        setStatus("Registration successful. Please sign in.");
      } else {
        const response = await api.login({ email, password });
        saveToken(response.access_token);
        router.push("/dashboard");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-container py-16">
      <SectionHeader
        eyebrow="Account"
        title={mode === "login" ? "Sign In" : "Create Account"}
        description="Access your dashboard as a user or admin."
      />

      <form onSubmit={onSubmit} className="card mx-auto max-w-lg space-y-4">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              minLength={2}
              className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none focus:border-primary"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none focus:border-primary"
          />
        </div>

        {mode === "register" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as "user" | "admin")}
                className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none focus:border-primary"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === "admin" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Admin Registration Key</label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  required
                  className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none focus:border-primary"
                />
              </div>
            )}
          </>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Register"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full rounded-lg border border-blue-200 px-5 py-3 font-medium text-primary transition hover:bg-blue-50"
        >
          {mode === "login" ? "Create an account" : "Have an account? Sign in"}
        </button>

        {status && <p className="text-sm text-slate-600">{status}</p>}
      </form>
    </section>
  );
}
