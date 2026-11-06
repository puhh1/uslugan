export function SearchBar({ value, onChange, onSubmit }: {
  value: string; onChange: (v: string) => void; onSubmit?: () => void
}) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit?.() }} className="flex gap-2">
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder="Что нужно сделать?"
        className="flex-1 rounded-xl bg-white/80 px-4 py-3 outline-none ring-1 ring-black/5"
      />
      <button className="rounded-xl bg-brand text-white px-4 font-medium">Найти</button>
    </form>
  )
}