interface DynamicSettingsProps {
  filter: string;
  onFilterChange: (value: string) => void;
}

export default function CarouselDynamicSettings({ filter, onFilterChange }: DynamicSettingsProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 h-full">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Configuração do filtro inteligente</h3>
        <p className="text-xs text-neutral-400 mt-0.5">As regras dinâmicas calculam e atualizam o conteúdo sem intervenção manual de ordenação.</p>
      </div>
      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-xs font-medium text-neutral-500">Regra de ordenação automática</label>
        <select 
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 text-sm bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-neutral-900 dark:focus:border-neutral-100 cursor-pointer"
        >
          <option value="best-sellers">Mais vendidos globalmente</option>
          <option value="new-arrivals">Lançamentos e novidades</option>
          <option value="high-discount">Maiores descontos ativos</option>
        </select>
      </div>
    </div>
  );
}