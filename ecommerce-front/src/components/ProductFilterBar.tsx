interface ProductFilterBarProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const CATEGORIES = ['Decoração', 'Acessórios', 'Móveis', 'Iluminação', 'Áudio'];

export default function ProductFilterBar({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: ProductFilterBarProps) {
  
  const inputClass = 
    'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 placeholder-neutral-400 fallback-transition';

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar produtos..."
        className={`${inputClass} flex-1`}
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={`${inputClass} min-w-40 cursor-pointer`}
      >
        <option value="">Todas as categorias</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}