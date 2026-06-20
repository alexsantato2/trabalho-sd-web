import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Produtos' },
  { to: '/admin/orders', label: 'Pedidos' },
  { to: '/admin/users', label: 'Usuários' },
  { to: '/admin/carousel', label: "Carrossel"},
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <aside className="w-44 flex-shrink-0">
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-4">Admin</p>
          <nav className="space-y-1">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `block text-sm py-1.5 transition-colors ${isActive ? 'text-neutral-900 font-medium' : 'text-neutral-500 hover:text-neutral-900'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
