"use client";

import { FormEvent, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      await api.submitContact({ name, email, message });
      setStatus("Message sent successfully.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-container py-16">
      <SectionHeader
        eyebrow="Contact"
        title="Let’s Discuss Your Project"
        description="Send your inquiry and our team will respond with the right scientific and technical support."
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none transition focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none transition focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
          <textarea
            required
            minLength={10}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            className="w-full rounded-lg border border-blue-200 px-4 py-2 outline-none transition focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

        {status && <p className="text-sm text-slate-600">{status}</p>}
      </form>
    </section>
  );
}
