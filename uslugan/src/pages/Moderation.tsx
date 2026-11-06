import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RoleGate } from '../components/RoleGate'

export default function Moderation() {
  const [list, setList] = useState<any[]>([])
  const load = () => supabase.from('providers').select('*')
    .in('status', ['pending','blocked']).order('created_at').then(r => setList(r.data ?? []))
  useEffect(() => { load() }, [])

  return (
    <RoleGate allow={['moderator','admin']} fallback={<div className="p-6">Доступ запрещён</div>}>
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-bold">Модерация</h1>
        {list.map(p => (
          <div key={p.id} className="rounded-2xl p-3 bg-white ring-1 ring-black/5 space-y-2">
            <div className="font-semibold">{p.display_name}</div>
            <div className="text-xs text-gray-500">Статус: {p.status}</div>
            <div className="flex gap-2">
              <button onClick={async () => { await supabase.from('providers').update({ status: 'active' }).eq('id', p.id); load() }}
                className="flex-1 rounded-xl bg-emerald-500 text-white py-2 text-sm">Одобрить</button>
              <button onClick={async () => { await supabase.from('providers').update({ status: 'blocked' }).eq('id', p.id); load() }}
                className="flex-1 rounded-xl bg-red-500 text-white py-2 text-sm">Блок</button>
            </div>
          </div>
        ))}
        {!list.length && <div className="text-sm text-gray-500">Очередь пуста</div>}
      </div>
    </RoleGate>
  )
}