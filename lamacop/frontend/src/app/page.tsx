import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

export default function HomePage() {
  return (
    <>
      <section className="section-container py-20">
        <div className="fade-in rounded-3xl bg-gradient-to-r from-blue-50 to-white p-8 sm:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Welcome to LaMaCoP</p>
          <h1 className="max-w-3xl text-4xl font-bold text-slate-900 sm:text-5xl">
            Laboratory of Ceramic and Polymer Composites
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            We deliver high-impact scientific research, advanced materials testing, and industry-ready innovation in
            ceramic and polymer composite systems.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services" className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-blue-700">
              Explore Services
            </Link>
            <Link href="/contact" className="rounded-lg border border-blue-200 px-5 py-3 font-medium text-primary transition hover:bg-blue-50">
              Contact the Lab
            </Link>
          </div>
        </div>
      </section>

      <section className="section-container py-8">
        <SectionHeader
          eyebrow="Why LaMaCoP"
          title="Scientific Rigor Meets Industrial Relevance"
          description="Our multidisciplinary team transforms research findings into practical material solutions for high-performance sectors."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "State-of-the-art characterization and testing facilities",
            "Collaborative research with academic and industrial partners",
            "Data-driven insights for material optimization",
          ].map((item) => (
            <div key={item} className="card">
              <p className="font-medium text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
