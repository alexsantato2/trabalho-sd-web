import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import NotificationToast from '../components/NotificationToast';
import type { Order } from '../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastOrderNotification } = useWebSocket({ userId: user?.userId });

  function loadOrders() {
    orderService.getMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadOrders(); }, []);

  useEffect(() => {
    if (lastOrderNotification) loadOrders();
  }, [lastOrderNotification]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">Carregando...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <NotificationToast notification={lastOrderNotification} />
      <h1 className="text-2xl font-light text-neutral-900 mb-8">Meus pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-400">Nenhum pedido realizado ainda.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-neutral-100 rounded-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-neutral-400 font-mono">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{item.productName} × {item.quantity}</span>
                    <span className="text-neutral-900">{fmt.format(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between">
                <span className="text-xs text-neutral-400">
                  {order.shippingCity} — {order.shippingStreet}, {order.shippingNumber}
                </span>
                <span className="text-sm font-medium text-neutral-900">{fmt.format(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
