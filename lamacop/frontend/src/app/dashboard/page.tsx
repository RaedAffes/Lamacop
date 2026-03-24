"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import { api, ContactItem, UserProfile } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [status, setStatus] = useState("Loading dashboard...");

  useEffect(() => {
    const run = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const profile = await api.me(token);
        setUser(profile);
        setStatus("");

        if (profile.role === "admin") {
          const messages = await api.listContacts(token);
          setContacts(messages);
        }
      } catch {
        clearToken();
        router.push("/login");
      }
    };

    run();
  }, [router]);

  const signOut = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <section className="section-container py-16">
      <SectionHeader
        eyebrow="Dashboard"
        title="Welcome"
        description="Your LaMaCoP account area"
      />

      {status && <p className="mb-4 text-slate-600">{status}</p>}

      {user && (
        <div className="space-y-6">
          <div className="card">
            <p className="text-sm text-slate-500">Signed in as</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{user.full_name}</h3>
            <p className="text-slate-600">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
              Role: {user.role}
            </p>
            <div className="mt-4">
              <button
                onClick={signOut}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-primary transition hover:bg-blue-50"
              >
                Sign Out
              </button>
            </div>
          </div>

          {user.role === "admin" && (
            <div className="card">
              <h4 className="text-lg font-semibold text-slate-900">Recent Contact Messages</h4>
              {contacts.length === 0 ? (
                <p className="mt-3 text-slate-600">No contact messages yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-blue-100">
                        <th className="p-2 font-semibold text-slate-700">Name</th>
                        <th className="p-2 font-semibold text-slate-700">Email</th>
                        <th className="p-2 font-semibold text-slate-700">Message</th>
                        <th className="p-2 font-semibold text-slate-700">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((item) => (
                        <tr key={item.id} className="border-b border-blue-50">
                          <td className="p-2 text-slate-700">{item.name}</td>
                          <td className="p-2 text-slate-700">{item.email}</td>
                          <td className="p-2 text-slate-700">{item.message}</td>
                          <td className="p-2 text-slate-500">{new Date(item.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
