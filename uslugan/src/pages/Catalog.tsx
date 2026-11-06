import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ProviderCard } from '../components/ProviderCard'
import { SearchBar } from '../components/SearchBar'

export default function Catalog() {
  const [params] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(params.get('cat') ?? '')
  const [minPrice, setMinPrice] = useState('')
  const [city, setCity] = useState('')
  const [cats, setCats] = useState<any[]>([])
  const [list, setList] = useState<any[]>([])

  useEffect(() => { supabase.from('categories').select('*').then(r => setCats(r.data ?? [])) }, [])
  useEffect(() => { run() }, [cat, minPrice, city])

  async function run() {
    let req = supabase.from('providers').select('*').eq('status', 'active')
    if (q) req = req.ilike('display_name', `%${q}%`)
    if (cat) {
      const c = cats.find(x => x.slug === cat)
      if (c) req = req.eq('category_id', c.id)
    }
    if (city) req = req.ilike('city', `%${city}%`)
    if (minPrice) req = req.gte('price_from', Number(minPrice))
    const { data } = await req.order('rating', { ascending: false })
    setList(data ?? [])
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">Каталог</h1>
      <SearchBar value={q} onChange={setQ} onSubmit={run} />
      <div className="flex flex-wrap gap-2">
        <select value={cat} onChange={e => setCat(e.target.value)}
          className="rounded-xl bg-gray-100 px-3 py-2 text-sm">
          <option value="">Все категории</option>
          {cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Город"
          className="rounded-xl bg-gray-100 px-3 py-2 text-sm w-28" />
        <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Цена от"
          className="rounded-xl bg-gray-100 px-3 py-2 text-sm w-28" inputMode="numeric" />
      </div>
      <div className="space-y-2">
        {list.map(p => <ProviderCard key={p.id} p={p} />)}
        {!list.length && <div className="text-sm text-gray-500">Нет исполнителей по фильтрам</div>}
      </div>
    </div>
  )
}