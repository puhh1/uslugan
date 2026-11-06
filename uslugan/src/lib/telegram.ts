type TgUser = { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string }

export function getTelegramUser(): TgUser | null {
  const tg = (window as any).Telegram?.WebApp
  if (!tg) return null
  tg.ready(); tg.expand()
  return tg.initDataUnsafe?.user ?? null
}