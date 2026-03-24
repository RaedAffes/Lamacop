type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-8 fade-in">
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 max-w-3xl text-slate-600">{description}</p>}
    </div>
  );
}
