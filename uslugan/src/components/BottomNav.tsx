import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const items = [
  { to: '/', label: 'Главная', icon: '🏠' },
  { to: '/catalog', label: 'Каталог', icon: '📚' },
  { to: '/profile', label: 'Профиль', icon: '👤' },
]

export function BottomNav() {
  const { profile } = useAuth()
  const list = [...items]
  if (profile?.role === 'provider')
    list.splice(2, 0, { to: '/provider/me', label: 'Мои услуги', icon: '🛠' })
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-flow-col auto-cols-fr">
        {list.map(i => (
          <NavLink key={i.to} to={i.to} end
            className={({ isActive }) =>
              `flex flex-col items-center py-2 text-xs ${isActive ? 'text-brand font-semibold' : 'text-gray-500'}`}>
            <span className="text-lg">{i.icon}</span>{i.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}