import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";
import { api } from "@/lib/api";

export const metadata = {
  title: "Projects | LaMaCoP",
  description: "Discover LaMaCoP projects and active research themes in ceramic and polymer composites.",
};

export default async function ProjectsPage() {
  const projects = await api.listProjects();

  return (
    <section className="section-container py-16">
      <SectionHeader
        eyebrow="Research"
        title="Current Projects"
        description="Our projects target performance, reliability, and sustainability in next-generation composite materials."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((item) => (
          <ProjectCard key={item.id} title={item.title} description={item.description} />
        ))}
      </div>
    </section>
  );
}
