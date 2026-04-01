import Link from "next/link"
import ScrollReveal from "@/components/ScrollReveal"

function StatsRow() {
  const stats = [
    { value: "45", label: "ACTIVE RESEARCHERS" },
    { value: "12", label: "RESEARCH PROJECTS" },
    { value: "180", label: "PUBLICATIONS" },
    { value: "1.2k", label: "CITATIONS" },
  ]

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((s, idx) => (
            <ScrollReveal
              key={s.label}
              delayMs={idx * 120}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-5xl font-semibold tracking-tight md:text-6xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs font-semibold tracking-widest text-slate-500">
                {s.label}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResearchCards() {
  const cards = [
    {
      title: "Polymer Materials",
      body: "Synthesis and characterization of advanced polymer matrices, elastomers, and polymer-based composites for structural and functional applications.",
    },
    {
      title: "Ceramic Composites",
      body: "Development of high-performance ceramic composite materials for extreme temperature applications, energy, and industry.",
    },
    {
      title: "Physical Characterization",
      body: "Advanced structural analysis techniques (XRD, dielectric spectroscopy, microscopy) to understand physical properties at the nanoscale.",
    },
  ]

  return (
    <section className="bg-slate-50">
      <div className="container py-14 md:py-16">
        <ScrollReveal className="text-center" delayMs={0}>
          <h2 className="text-2xl font-semibold md:text-3xl">
            Core Research Areas
          </h2>
        </ScrollReveal>
        <ScrollReveal delayMs={120}>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            Our expertise spans materials physics, polymers, and ceramic composites —
            driving industrial and scientific innovation.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c, idx) => (
            <ScrollReveal
              key={c.title}
              delayMs={idx * 140}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-colors transition-transform duration-200 hover:-translate-y-0.5 hover:border-brand-200"
            >
              <div className="text-xl font-semibold tracking-tight md:text-2xl">
                {c.title}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{c.body}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function JoinCommunity() {
  return (
    <section className="bg-azure-hero azure-bubbles">
      <div className="container py-14 md:py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Join Our Research Community
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
          LaMaCoP welcomes PhD students, postdocs, and visiting researchers within
          the Doctoral School of Fundamental Sciences (ED08FSSf01) at the
          University of Sfax.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Contact the Director
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Apply for a Position
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div>
      <section className="bg-azure-hero azure-bubbles animate-bg-pan">
        <div className="container py-14 md:py-20">
          <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
            Matériaux Composites
            <span className="block bg-gradient-to-r from-brand-500 to-brand-300 bg-clip-text text-2xl font-semibold text-transparent md:text-3xl">
              Céramiques & Polymères
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-center text-slate-600">
            LaMaCoP is a research laboratory of the University of Sfax specializing
            in the synthesis, characterization, and applications of ceramic and
            polymer composite materials.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/research"
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Explore Research
            </Link>
            <Link
              href="/team"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              Meet the Team
            </Link>
          </div>
        </div>
      </section>

      <StatsRow />
      <ResearchCards />
      <JoinCommunity />
    </div>
  )
}
