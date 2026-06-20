import { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import type { Order, User } from '../../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderService.getAllOrders(), userService.getAllUsers()])
      .then(([o, u]) => { setOrders(o); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-400">Carregando...</p>;
  }

  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const revenue = orders
    .filter((o) => o.status === 'APPROVED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: 'Total de pedidos', value: orders.length },
    { label: 'Pendentes', value: pending },
    { label: 'Usuários', value: users.length },
    { label: 'Receita aprovada', value: fmt.format(revenue) },
  ];

  return (
    <div>
      <h1 className="text-xl font-light text-neutral-900 mb-8">Visão geral</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-neutral-100 rounded-lg p-5">
            <p className="text-xs uppercase tracking-wider text-neutral-400">{label}</p>
            <p className="text-2xl font-light text-neutral-900 mt-2">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
