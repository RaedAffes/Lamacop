import Link from "next/link"

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="container py-16">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
            >
              Go home
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
