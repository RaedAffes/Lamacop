export default function EmptyState({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{message}</div>
    </div>
  )
}
