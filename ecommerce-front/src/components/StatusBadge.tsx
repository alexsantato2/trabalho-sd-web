import type { OrderStatus } from '../types';

const styles: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const labels: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
