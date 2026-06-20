import { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { useWebSocket } from '../../hooks/useWebSocket';
import StatusBadge from '../../components/StatusBadge';
import NotificationToast from '../../components/NotificationToast';
import type { Order, OrderStatus } from '../../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const { lastOrderNotification } = useWebSocket({ isAdmin: true });

  async function load() {
    const filters = statusFilter ? { status: statusFilter as OrderStatus } : {};
    const data = await orderService.getAllOrders(filters);
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter]);

  useEffect(() => {
    if (lastOrderNotification) load();
  }, [lastOrderNotification]);

  async function handleApprove(id: string) {
    await orderService.approveOrder(id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'APPROVED' } : o));
  }

  async function handleReject(id: string) {
    await orderService.rejectOrder(id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'REJECTED' } : o));
  }

  if (loading) {
    return <p className="text-sm text-neutral-400">Carregando...</p>;
  }

  return (
    <div>
      <NotificationToast notification={lastOrderNotification} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-light text-neutral-900">Pedidos</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-400"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-neutral-100 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-400 font-mono">#{order.id.slice(0, 8)}</p>
                <p className="text-sm font-medium text-neutral-900 mt-0.5">{order.userName}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {order.shippingStreet}, {order.shippingNumber} — {order.shippingCity}/{order.shippingState}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                <p className="text-sm font-medium text-neutral-900">{fmt.format(order.totalAmount)}</p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-4 border-t border-neutral-50 pt-3 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.productImageUrl && (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="w-8 h-8 object-cover rounded border border-neutral-100 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-700 truncate">{item.productName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-neutral-400">{item.quantity}× {fmt.format(item.unitPrice)}</p>
                      <p className="text-xs font-medium text-neutral-700">{fmt.format(item.quantity * item.unitPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {order.status === 'PENDING' && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleApprove(order.id)}
                  className="px-4 py-1.5 bg-neutral-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-700 transition-colors rounded"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleReject(order.id)}
                  className="px-4 py-1.5 border border-neutral-200 text-neutral-600 text-xs uppercase tracking-wider font-medium hover:border-red-400 hover:text-red-500 transition-colors rounded"
                >
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-sm text-neutral-400">Nenhum pedido encontrado.</p>
        )}
      </div>
    </div>
  );
}
