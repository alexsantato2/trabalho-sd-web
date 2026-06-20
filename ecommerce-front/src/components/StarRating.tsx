interface Props {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
}

export default function StarRating({ value, onChange, size = 'md' }: Props) {
  const stars = [1, 2, 3, 4, 5];
  const sz = size === 'sm' ? 'text-sm' : 'text-xl';

  return (
    <div className="flex gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${sz} leading-none ${
            star <= value ? 'text-amber-400' : 'text-neutral-200 dark:text-neutral-700'
          } ${onChange ? 'hover:text-amber-300 cursor-pointer' : 'cursor-default'} transition-colors`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
