import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { RoleGate } from '../components/RoleGate'

export default function ProviderProfile() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [p, setP] = useState<any>(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState<any>({})
  const [cats, setCats] = useState<any[]>([])

  async function load() {
    const { data } = await supabase.from('providers').select('*').eq('id', id).maybeSingle()
    setP(data); setForm(data ?? {})
  }
  useEffect(() => { load(); supabase.from('categories').select('*').then(r => setCats(r.data ?? [])) }, [id])

  async function save() {
    const { error } = await supabase.from('providers').update({
      display_name: form.display_name, description: form.description,
      category_id: form.category_id, city: form.city,
      price_from: form.price_from ? Number(form.price_from) : null,
      phone: form.phone, avatar_url: form.avatar_url,
    }).eq('id', id)
    if (error) alert(error.message)
    else { setEdit(false); load() }
  }

  const isOwner = profile && p && profile.id === p.user_id
  const isStaff = profile && ['admin','moderator'].includes(profile.role)

  if (!p) return <div className="p-6">Загрузка…</div>
  if (!edit) return (
    <div className="p-4 space-y-3">
      <div className="h-40 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
        {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <span className="text-5xl">👤</span>}
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{p.display_name}</h1>
        <div className="text-sm">★ {Number(p.rating).toFixed(1)} ({p.reviews_count})</div>
      </div>
      <div className="text-sm text-gray-600">{p.description}</div>
      <div className="text-sm">Город: <b>{p.city || '—'}</b></div>
      <div className="text-sm">Цена: <b>{p.price_from ? `от ${p.price_from} ₽` : 'договорная'}</b></div>
      {p.phone && <a href={`tel:${p.phone}`} className="block text-center rounded-xl bg-brand text-white py-3 font-medium">Позвонить</a>}

      {(isOwner || isStaff) && (
        <button onClick={() => setEdit(true)} className="block w-full rounded-xl bg-gray-900 text-white py-3 font-medium">
          Редактировать
        </button>
      )}
      <RoleGate allow={['moderator','admin']}>
        <button onClick={async () => {
          if (!confirm('Заблокировать исполнителя?')) return
          await supabase.from('providers').update({ status: 'blocked' }).eq('id', p.id)
          load()
        }} className="block w-full rounded-xl bg-red-50 text-red-600 py-3 font-medium">
          Заблокировать (модерация)
        </button>
      </RoleGate>
    </div>
  )

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-bold">Редактирование</h1>
      <Field label="Название" value={form.display_name} onChange={v => setForm({...form, display_name: v})} />
      <Field label="Описание" textarea value={form.description} onChange={v => setForm({...form, description: v})} />
      <label className="block text-sm">Категория
        <select value={form.category_id ?? ''} onChange={e => setForm({...form, category_id: Number(e.target.value) || null})}
          className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2">
          <option value="">—</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <Field label="Город" value={form.city} onChange={v => setForm({...form, city: v})} />
      <Field label="Цена от" value={form.price_from} onChange={v => setForm({...form, price_from: v})} />
      <Field label="Телефон" value={form.phone} onChange={v => setForm({...form, phone: v})} />
      <Field label="URL аватара" value={form.avatar_url} onChange={v => setForm({...form, avatar_url: v})} />
      <div className="flex gap-2">
        <button onClick={() => setEdit(false)} className="flex-1 rounded-xl bg-gray-100 py-3">Отмена</button>
        <button onClick={save} className="flex-1 rounded-xl bg-brand text-white py-3 font-medium">Сохранить</button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea }: {
  label: string; value?: string; onChange: (v: string) => void; textarea?: boolean
}) {
  return (
    <label className="block text-sm">{label}
      {textarea
        ? <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3}
            className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2" />
        : <input value={value ?? ''} onChange={e => onChange(e.target.value)}
            className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2" />}
    </label>
  )
}