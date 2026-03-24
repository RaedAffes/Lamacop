import { Microscope } from "lucide-react";

type Props = {
  title: string;
  description: string;
};

export default function ProjectCard({ title, description }: Props) {
  return (
    <article className="card fade-in">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-accent">
        <Microscope size={18} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
    </article>
  );
}
