"use client"

import { useState } from "react"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { canContact, getCurrentUser } from "@/lib/auth"

export default function ContactPage() {
  const contactEmail = "raedaffes@gmail.com"
  const labAddress =
    "Faculté des Sciences de Sfax, Route de Soukra km 3.5, 3038 Sfax, Tunisie"
  const mapsQuery = encodeURIComponent(labAddress)
  const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`

  const user = getCurrentUser()
  const canUseContact = canContact(user)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    institution: "",
    subject: "",
    message: "",
  })

  const [sent, setSent] = useState(false)

  return (
    <div>
      <PageHeader
        title="Contact LaMaCoP"
        subtitle="Interested in collaboration, joining the lab, or analytical services? Reach out to our team."
      />

      <section className="bg-slate-50">
        <div className="container grid gap-8 py-10 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold">Address</h2>
            <div className="mt-3 text-sm text-slate-600">
              Faculté des Sciences de Sfax
              <br />
              Route de Soukra km 3.5
              <br />
              3038 Sfax, Tunisie
            </div>

            <h2 className="mt-6 text-sm font-semibold">Email & Contact</h2>
            <div className="mt-3 text-sm text-slate-600">
              <div>
                <a
                  className="text-slate-900 underline underline-offset-4"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
              </div>
              <div className="mt-4 font-semibold text-slate-900">
                Pr. Arous Mourad
              </div>
              <div className="text-slate-600">Lab Director</div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="aspect-video w-full">
                <iframe
                  title="LaMaCoP location"
                  src={mapsEmbedUrl}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">Send a Message</h2>
            {canUseContact ? (
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()

                  const subject = encodeURIComponent(form.subject)
                  const body = encodeURIComponent(
                    `Full Name: ${form.fullName}\n` +
                      `Email: ${form.email}\n` +
                      (form.institution
                        ? `Institution: ${form.institution}\n`
                        : "") +
                      `\nMessage:\n${form.message}`
                  )

                  const mailtoUrl = `mailto:${contactEmail}?subject=${subject}&body=${body}`

                  setSent(true)
                  setForm({
                    fullName: "",
                    email: "",
                    institution: "",
                    subject: "",
                    message: "",
                  })
                  setTimeout(() => setSent(false), 2500)

                  window.location.href = mailtoUrl
                }}
              >
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Institution (Optional)
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.institution}
                    onChange={(e) =>
                      setForm({ ...form, institution: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Send Message
                </button>

                {sent && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    Opening your email client…
                  </div>
                )}
              </form>
            ) : (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Please <Link className="underline" href="/login">login</Link> to contact the lab.
              </div>
            )}
          </div>
        </div>
      </section>

     
    </div>
  )
}
