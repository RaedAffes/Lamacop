import Link from "next/link"

const links = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/team", label: "Team" },
  { href: "/publications", label: "Publications" },
  { href: "/equipment", label: "Equipment" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
]

export default function AdditionalLinks() {
  return (
    <section className="bg-white">
      <div className="container py-12">
        <h2 className="text-center text-xl font-semibold">Additional Links</h2>
        <ul className="mx-auto mt-6 max-w-md list-disc space-y-2 pl-6 text-sm text-slate-600">
          {links.map((l) => (
            <li key={l.href}>
              <Link className="hover:text-slate-900" href={l.href}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
