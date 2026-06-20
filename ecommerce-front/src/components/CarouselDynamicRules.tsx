import { useState, useEffect, useRef } from 'react';
import { productService } from '../services/productService';
import { useCarouselItems } from '../contexts/CarouselItemsContext';

interface DynamicRule {
  id: string;
  name: string;
  description: string;
}

interface CarouselDynamicRulesProps {
  dynamicFilter: string;
  onDynamicFilterChange: (filter: string) => void;
}

export default function CarouselDynamicRules({
  dynamicFilter = 'best-sellers',
  onDynamicFilterChange,
}: CarouselDynamicRulesProps) {
  const { state, updateState } = useCarouselItems();
  const [loadingRule, setLoadingRule] = useState(false);

  // Controle de tempo para aglutinação (Debounce inteligente de Undo/Redo)
  const isTypingRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dynamicRules: DynamicRule[] = [
    {
      id: 'best-sellers',
      name: 'Mais Vendidos',
      description: 'Exibe automaticamente os produtos com maior volume de vendas recente.'
    },
    {
      id: 'new-arrivals',
      name: 'Novidades / Lançamentos',
      description: 'Alimenta a vitrine com os produtos cadastrados mais recentemente.'
    },
    {
      id: 'special-offers',
      name: 'Promoções / Descontos',
      description: 'Seleciona apenas itens que possuem menor preço.'
    },
    {
      id: 'highly-rated',
      name: 'Melhores Avaliados',
      description: 'Filtra os itens que receberam as maiores notas de review dos clientes.'
    }
  ];

  // Busca a regra dinâmica e SUBSTITUI integralmente a lista vinculada (linkedItems).
  // Essa é a mesma lista que é salva no carrossel e exibida no preview/aba "Vinculados",
  // então aplicar uma regra aqui tem efeito imediato e visível nos dois lugares.
  async function applyDynamicRule(filterId: string, currentSize: number, skipHistory = false) {
    setLoadingRule(true);
    try {
      let response;
      switch (filterId) {
        case 'best-sellers':
          response = await productService.getProducts({ sort: 'salesCount,desc' }, 0, currentSize);
          break;
        case 'new-arrivals':
          response = await productService.getProducts({ sort: 'createdAt,desc' }, 0, currentSize);
          break;
        case 'special-offers':
          response = await productService.getProducts({ specialOffers: true as any }, 0, currentSize);
          break;
        case 'highly-rated':
          response = await productService.getProducts({ sort: 'rating,desc' }, 0, currentSize);
          break;
        default:
          response = { content: [] };
      }
      updateState({ linkedItems: response.content || [] }, skipHistory);
    } catch (err) {
      console.error("Erro ao buscar produtos da regra dinâmica no servidor:", err);
    } finally {
      setLoadingRule(false);
    }
  }

  function handleRuleSelect(filterId: string) {
    if (filterId !== dynamicFilter) {
      onDynamicFilterChange(filterId);
    }
  }

  // Dispara a busca sempre que a regra ou o tamanho da página mudam (inclui Undo/Redo,
  // que reposiciona dynamicFilter/pageSize e precisa refletir o resultado na lista vinculada).
  useEffect(() => {
    applyDynamicRule(dynamicFilter, state.pageSize, true);
  }, [dynamicFilter, state.pageSize]);

  // Modifica o input numérico aplicando a unificação de tempo
  function handlePageSizeChange(val: number) {
    const nextValue = Math.max(1, val || 1);

    if (timerRef.current) clearTimeout(timerRef.current);

    // Se ele começou a digitar agora, cria um ponto de histórico normal.
    // Se continuar digitando rápido, aglutina as seguintes alterações na mesma ação.
    const skip = isTypingRef.current;
    isTypingRef.current = true;

    updateState({ pageSize: nextValue }, skip);

    timerRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 400); // Critério de aglutinação
  }

  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
            Qtd. Itens:
          </label>
          <input
            id="pageSize"
            type="number"
            min="1"
            max="50"
            value={state.pageSize}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 text-xs border rounded bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        {loadingRule && (
          <span className="text-[10px] text-neutral-400 italic animate-pulse">Atualizando lista vinculada...</span>
        )}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
        {dynamicRules.map((rule) => {
          const isSelected = dynamicFilter === rule.id;
          return (
            <div
              key={rule.id}
              onClick={() => handleRuleSelect(rule.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                isSelected
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 border-neutral-900 dark:border-neutral-100 shadow-md'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                isSelected ? 'border-white dark:border-neutral-950' : 'border-neutral-400'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-950" />}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold tracking-tight">{rule.name}</span>
                <span className={`text-xs leading-relaxed ${
                  isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'
                }`}>
                  {rule.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
