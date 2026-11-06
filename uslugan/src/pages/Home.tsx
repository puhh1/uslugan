import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SearchBar } from '../components/SearchBar'
import { ProviderCard } from '../components/ProviderCard'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [list, setList] = useState<any[]>([])
  const [cats, setCats] = useState<any[]>([])

  async function load(query = '') {
    let req = supabase.from('providers').select('*').eq('status', 'active')
      .order('rating', { ascending: false }).limit(20)
    if (query) req = req.ilike('display_name', `%${query}%`)
    const { data } = await req
    setList(data ?? [])
  }
  useEffect(() => {
    load()
    supabase.from('categories').select('*').then(r => setCats(r.data ?? []))
  }, [])

  return (
    <div className="p-4 space-y-4">
      <header>
        <div className="text-xs text-gray-500">Привет{profile?.full_name ? `, ${profile.full_name}` : ''}</div>
        <h1 className="text-2xl font-bold">Услуган</h1>
        <p className="text-gray-500 text-sm">Найдите исполнителя за пару минут</p>
      </header>
      <SearchBar value={q} onChange={setQ} onSubmit={() => load(q)} />

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {cats.map(c => (
          <button key={c.id} onClick={() => nav(`/catalog?cat=${c.slug}`)}
            className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-sm">{c.name}</button>
        ))}
      </div>

      <section className="space-y-2">
        <div className="font-semibold">Топ исполнителей</div>
        {list.map(p => <ProviderCard key={p.id} p={p} />)}
        {!list.length && <div className="text-sm text-gray-500">Ничего не найдено</div>}
      </section>
    </div>
  )
}