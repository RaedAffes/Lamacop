import SectionHeader from "@/components/SectionHeader";
import ServiceCard from "@/components/ServiceCard";
import { api } from "@/lib/api";

export const metadata = {
  title: "Services | LaMaCoP",
  description: "Explore materials testing, research collaboration, and consulting services.",
};

export default async function ServicesPage() {
  const services = await api.listServices();

  return (
    <section className="section-container py-16">
      <SectionHeader
        eyebrow="Services"
        title="Comprehensive Laboratory Services"
        description="From lab-scale analysis to applied industrial consulting, LaMaCoP supports the full innovation cycle."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((item) => (
          <ServiceCard key={item.id} title={item.title} description={item.description} />
        ))}
      </div>
    </section>
  );
}
