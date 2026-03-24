import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "About | LaMaCoP",
  description: "Learn about LaMaCoP mission, team expertise, and scientific vision.",
};

export default function AboutPage() {
  return (
    <section className="section-container py-16">
      <SectionHeader
        eyebrow="About"
        title="Advancing Composite Science"
        description="LaMaCoP is dedicated to generating scientific and engineering breakthroughs in ceramic and polymer composite systems."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="card lg:col-span-1">
          <h3 className="text-xl font-semibold text-slate-900">Mission</h3>
          <p className="mt-3 text-slate-600">
            Deliver reliable, innovative, and sustainable material science solutions for industry and academia.
          </p>
        </article>
        <article className="card lg:col-span-1">
          <h3 className="text-xl font-semibold text-slate-900">Team</h3>
          <p className="mt-3 text-slate-600">
            Our experts include materials scientists, chemists, and process engineers with proven publication and project
            records.
          </p>
        </article>
        <article className="card lg:col-span-1">
          <h3 className="text-xl font-semibold text-slate-900">Expertise</h3>
          <p className="mt-3 text-slate-600">
            Structural characterization, polymer formulation, ceramic microstructure control, and composite performance
            validation.
          </p>
        </article>
      </div>
    </section>
  );
}
