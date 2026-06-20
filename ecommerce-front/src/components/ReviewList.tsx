import StarRating from './StarRating';
import type { Review } from '../types';

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    // return <p className="text-sm text-neutral-400 dark:text-neutral-500">Nenhuma avaliação ainda.</p>;
    return null;
  }

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div key={r.id} className="border-b border-neutral-100 dark:border-neutral-800 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase">
                {r.userName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{r.userName}</p>
                <StarRating value={r.rating} size="sm" />
              </div>
            </div>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">
              {new Date(r.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
            </span>
          </div>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
