import { Link } from 'react-router-dom'

export function ProviderCard({ p }: { p: any }) {
  return (
    <Link to={`/provider/${p.id}`}
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 active:scale-[0.99] transition">
      <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
        {p.avatar_url ? <img src={p.avatar_url} className="h-full w-full object-cover" /> : <span>👤</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="font-semibold truncate">{p.display_name}</div>
          <div className="text-xs text-gray-500">★ {Number(p.rating).toFixed(1)}</div>
        </div>
        <div className="text-sm text-gray-600 line-clamp-2">{p.description}</div>
        <div className="text-xs text-gray-500 mt-1">
          {p.city ?? '—'} {p.price_from ? `· от ${p.price_from} ₽` : ''}
        </div>
      </div>
    </Link>
  )
}