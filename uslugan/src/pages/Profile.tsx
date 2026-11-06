import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { profile, signOut, refresh } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState<any>({})
  const [provider, setProvider] = useState<any>(null)

  useEffect(() => { if (profile) setForm(profile) }, [profile])
  useEffect(() => {
    if (!profile) return
    supabase.from('providers').select('*').eq('user_id', profile.id).maybeSingle()
      .then(r => setProvider(r.data))
  }, [profile])

  if (!profile) return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-bold">Личный кабинет</h1>
      <p className="text-sm text-gray-500">Откройте приложение из Telegram, чтобы войти.</p>
    </div>
  )

  async function saveProfile() {
    await supabase.from('profiles').update({
      full_name: form.full_name, phone: form.phone, avatar_url: form.avatar_url,
      username: form.username
    }).eq('id', profile!.id)
    await refresh()
    alert('Сохранено')
  }

  async function becomeProvider() {
    const { error } = await supabase.from('providers').insert({
      user_id: profile!.id,
      display_name: profile!.full_name || 'Исполнитель',
      description: '', city: '', price_from: null, phone: profile!.phone ?? null,
      status: 'pending'
    })
    if (error) return alert(error.message)
    await supabase.from('profiles').update({ role: 'provider' }).eq('id', profile!.id)
    await refresh()
    alert('Заявка на исполнителя отправлена модератору')
    nav(0)
  }

  const roleLabels: Record<string,string> = {
    client: 'Клиент', provider: 'Исполнитель',
    moderator: 'Модератор', admin: 'Администратор', guest: 'Гость'
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" /> : '👤'}
        </div>
        <div>
          <div className="font-bold">{profile.full_name || profile.username || 'Без имени'}</div>
          <div className="text-xs text-brand font-medium">{roleLabels[profile.role] ?? profile.role}</div>
        </div>
      </div>

      <section className="space-y-2">
        <div className="font-semibold">Настройки профиля</div>
        <label className="block text-sm">Имя
          <input value={form.full_name ?? ''} onChange={e => setForm({...form, full_name: e.target.value})}
            className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2" />
        </label>
        <label className="block text-sm">Телефон
          <input value={form.phone ?? ''} onChange={e => setForm({...form, phone: e.target.value})}
            className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2" />
        </label>
        <label className="block text-sm">URL аватара
          <input value={form.avatar_url ?? ''} onChange={e => setForm({...form, avatar_url: e.target.value})}
            className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2" />
        </label>
        <button onClick={saveProfile} className="w-full rounded-xl bg-brand text-white py-3 font-medium">Сохранить</button>
      </section>

      {profile.role === 'client' && (
        <button onClick={becomeProvider} className="w-full rounded-xl bg-gray-900 text-white py-3 font-medium">
          Стать исполнителем
        </button>
      )}

      {profile.role === 'provider' && provider && (
        <button onClick={() => nav(`/provider/${provider.id}`)}
          className="w-full rounded-xl bg-gray-900 text-white py-3 font-medium">
          Моя карточка исполнителя
        </button>
      )}

      {['admin','moderator'].includes(profile.role) && (
        <section className="rounded-2xl bg-amber-50 p-3">
          <div className="font-semibold text-amber-900 text-sm">Панель {roleLabels[profile.role].toLowerCase()}</div>
          <button onClick={() => nav('/moderation')} className="mt-2 w-full rounded-xl bg-amber-500 text-white py-2 text-sm">
            Модерация исполнителей
          </button>
        </section>
      )}

      <button onClick={signOut} className="w-full rounded-xl bg-gray-100 py-3 text-gray-700">Выйти</button>
    </div>
  )
}