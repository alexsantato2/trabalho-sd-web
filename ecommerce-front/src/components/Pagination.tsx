interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const btnBase = 'w-8 h-8 text-xs flex items-center justify-center rounded transition-colors';

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`${btnBase} border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btnBase} ${
            p === currentPage
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
              : 'border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={`${btnBase} border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        ›
      </button>
    </div>
  );
}
