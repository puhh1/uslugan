import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getTelegramUser } from '../lib/telegram'

export type Role = 'guest' | 'client' | 'provider' | 'moderator' | 'admin'
export type Profile = {
  id: string; telegram_id?: number; username?: string; full_name?: string
  avatar_url?: string; phone?: string; role: Role
}

type Ctx = { profile: Profile | null; loading: boolean; signOut: () => Promise<void>; refresh: () => Promise<void> }
const AuthContext = createContext<Ctx>({} as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data as Profile ?? null)
  }

  async function bootstrap() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { await loadProfile(session.user.id); return }

      // Демо-вход через Telegram initData (в проде — Edge Function с проверкой подписи)
      const tgUser = getTelegramUser()
      if (!tgUser) { setProfile(null); return }

      const email = `tg_${tgUser.id}@uslugan.local`
      const password = `tg_${tgUser.id}_secret`
      let { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const r = await supabase.auth.signUp({ email, password })
        data = r.data
      }
      const uid = data.user!.id
      await supabase.from('profiles').upsert({
        id: uid, telegram_id: tgUser.id, username: tgUser.username,
        full_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
        avatar_url: tgUser.photo_url, role: 'client'
      })
      await loadProfile(uid)
    } finally { setLoading(false) }
  }

  useEffect(() => { bootstrap() }, [])

  return (
    <AuthContext.Provider value={{
      profile, loading,
      signOut: async () => { await supabase.auth.signOut(); setProfile(null) },
      refresh: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) await loadProfile(session.user.id)
      }
    }}>{children}</AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)