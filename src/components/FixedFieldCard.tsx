type FixedFieldCardProps = {
  label: string;
  value?: string | number | null;
};

export default function FixedFieldCard({ label, value }: FixedFieldCardProps) {
  const display = value == null || value === '' ? '—' : String(value);

  return (
    <article className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-mono text-slate-200">{display}</p>
    </article>
  );
}
