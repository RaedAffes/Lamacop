import Link from "next/link"

export default function SiteFooter() {
  const socials = [
    {
      name: "Facebook",
      href: "#",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.2-1.5 1.5-1.5h1.5V5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7v3h2.8v7h3.7Z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "#",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M6.9 6.8a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM3.9 21V9h6v12h-6Zm8.1 0V9h5.8v1.7h.1c.8-1.4 2.1-2.1 4.2-2.1 3.3 0 3.9 2.2 3.9 5.1V21h-6v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-5.9Z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "#",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <path d="M16 11.4a4 4 0 1 1-7.9 1.2 4 4 0 0 1 7.9-1.2Z" />
          <path d="M17.5 6.5h.01" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="text-base font-semibold">LaMaCoP</div>
            <div className="mt-2 text-sm text-slate-600">
              Ceramic and Polymer Composite Materials.
              <br />
              Research Laboratory — University of Sfax.
              <br />
              Code: LR/01/ES-25
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Quick Links</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link className="transition-colors hover:text-brand-700" href="/research">
                  Research Areas
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-brand-700" href="/publications">
                  Publications
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-brand-700" href="/equipment">
                  Facilities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Information</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link className="transition-colors hover:text-brand-700" href="/news">
                  News & Events
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-brand-700" href="/team">
                  Directory
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-brand-700" href="/contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Contact</div>
            <div className="mt-3 text-sm text-slate-600">
              <div>
                Faculté des Sciences de Sfax
                <br />
                Route de Soukra km 3.5
                <br />
                3038 Sfax, Tunisie
              </div>

              <div className="mt-4">
                <div>Director: Pr. Arous Mourad</div>
                <a
                  className="transition-colors hover:text-brand-700"
                  href="mailto:Ali.Kallel@fss.rnu.tn"
                >
                  Ali.Kallel@fss.rnu.tn
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-slate-200 pt-6 text-center">
          <div className="text-xs text-slate-500">
            © 2026 LaMaCoP — Faculty of Sciences of Sfax, University of Sfax. All
            rights reserved.
          </div>

          <div className="flex items-center justify-center gap-3 text-slate-600">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                title={s.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition-colors hover:border-brand-200 hover:text-brand-700"
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
