import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '概览', icon: '📊' },
  { to: '/questions', label: '题库', icon: '📚' },
  { to: '/study', label: '刷题', icon: '📝' },
  { to: '/review', label: '错题', icon: '🔁' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-slate-200
      pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 text-xs gap-0.5
              ${isActive ? 'text-indigo-600' : 'text-slate-500'}`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[11px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
