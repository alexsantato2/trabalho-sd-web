import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { OrderNotification, StockNotification } from '../types';

interface UseWebSocketOptions {
  userId?: string;
  isAdmin?: boolean;
}

export function useWebSocket({ userId, isAdmin }: UseWebSocketOptions = {}) {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastOrderNotification, setLastOrderNotification] = useState<OrderNotification | null>(null);
  const [lastStockNotification, setLastStockNotification] = useState<StockNotification | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);

        if (userId) {
          client.subscribe(`/topic/orders/${userId}`, (msg) => {
            setLastOrderNotification(JSON.parse(msg.body));
          });
        }

        if (isAdmin) {
          client.subscribe('/topic/admin/orders', (msg) => {
            setLastOrderNotification(JSON.parse(msg.body));
          });
        }

        client.subscribe('/topic/stock', (msg) => {
          setLastStockNotification(JSON.parse(msg.body));
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId, isAdmin]);

  return { connected, lastOrderNotification, lastStockNotification };
}
