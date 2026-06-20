import { useEffect, useState } from 'react';
import type { OrderNotification } from '../types';

interface Props {
  notification: OrderNotification | null;
}

export default function NotificationToast({ notification }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  if (!visible || !notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-sm px-5 py-3 rounded-lg shadow-xl max-w-xs">
      <p className="font-medium">{notification.message}</p>
      <p className="text-neutral-400 text-xs mt-0.5">Pedido #{notification.orderId.slice(0, 8)}</p>
    </div>
  );
}
