import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { productImageUrl } from '../utils/imageUrl';
import { productService } from '../services/productService';
import ProductFilterBar from './ProductFilterBar';
import CarouselDynamicRules from './CarouselDynamicRules';

interface ManualProductsProps {
  products: Product[];
  onAddProduct?: (product: Product) => void;
  onRemoveProduct?: (productId: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  strategy?: 'manual' | 'dynamic';
  onStrategyChange?: (strategy: 'manual' | 'dynamic') => void;
  dynamicFilter?: string;
  onDynamicFilterChange?: (filter: string) => void;
  onDynamicProductsFetch?: (products: Product[]) => void;
}

export default function CarouselManualProducts({ 
  products, 
  onAddProduct, 
  onRemoveProduct,
  onMoveUp,
  onMoveDown,
  strategy = 'manual',
  onStrategyChange,
  dynamicFilter = 'best-sellers',
  onDynamicFilterChange,
  onDynamicProductsFetch
}: ManualProductsProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'search'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  const isDynamicMode = strategy === 'dynamic';

  // Carrega automaticamente todos os produtos ao abrir a aba de busca ou trocar a categoria (Modo Manual)
  useEffect(() => {
    if (activeTab === 'search' && !isDynamicMode) {
      setSearching(true);
      productService
        .getProducts({ 
          name: searchQuery || undefined, 
          category: selectedCategory || undefined 
        }, 0, 1000)
        .then((res) => setSearchResults(res.content || []))
        .catch((err) => console.error("Erro ao carregar catálogo inicial:", err))
        .finally(() => setSearching(false));
    }
  }, [activeTab, selectedCategory, isDynamicMode]);

  // Função disparada manualmente ao clicar no botão de pesquisar da barra
  async function handleSearch() {
    setSearching(true);
    try {
      const filters: any = {};
      if (searchQuery) filters.name = searchQuery;
      if (selectedCategory) filters.category = selectedCategory;

      const response = await productService.getProducts(filters, 0, 1000);
      setSearchResults(response.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col min-h-[500px]">
      
      {/* SELEÇÃO DO TIPO DE FILTRAGEM (ESTRATÉGIA) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5 mb-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">Conteúdo da Vitrine</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Determine como os produtos entram neste carrossel.</p>
        </div>
        <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-800/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onStrategyChange?.('manual')}
            className={`flex-1 sm:flex-none text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${strategy === 'manual' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-xs' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
          >
            Seleção Manual
          </button>
          <button
            type="button"
            onClick={() => onStrategyChange?.('dynamic')}
            className={`flex-1 sm:flex-none text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${strategy === 'dynamic' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-xs' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
          >
            Regras Dinâmicas
          </button>
        </div>
      </div>

      {/* COMPARTILHAMENTO DE ABAS */}
      <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('current')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'current' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50' : 'text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950'}`}
        >
          Vinculados ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'search' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50' : 'text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950'}`}
        >
          {isDynamicMode ? 'Critérios Dinâmicos' : 'Buscar e Adicionar'}
        </button>
      </div>

      {/* ABA 1: VINCULADOS */}
      {activeTab === 'current' && (
        <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-2">
          {products.length > 0 ? (
            products.map((p, index) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 group">
                <div className="flex items-center gap-3">
                  <img src={productImageUrl(p.imageUrl)} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-neutral-200" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">{p.name}</span>
                    <span className="text-[10px] text-neutral-400 font-medium">{p.category} • R$ {p.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isDynamicMode && (
                    <>
                      <button
                        type="button"
                        onClick={() => onMoveUp?.(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 disabled:opacity-20 cursor-pointer text-xs"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveDown?.(index)}
                        disabled={index === products.length - 1}
                        className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 disabled:opacity-20 cursor-pointer text-xs"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveProduct?.(p.id)}
                        className="p-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Remover
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <p className="text-xs text-neutral-400 italic">Nenhum produto associado a esta vitrine.</p>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CONFIGURAÇÃO / CATÁLOGO */}
      {activeTab === 'search' && (
        <div className="w-full flex-1">
          {isDynamicMode ? (
            <div className="w-full">
              <CarouselDynamicRules 
                dynamicFilter={dynamicFilter} 
                onDynamicFilterChange={onDynamicFilterChange!} 
                onFetchPreview={onDynamicProductsFetch}
              />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <ProductFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onSearch={handleSearch}
              />

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-y-auto max-h-[290px] p-2 bg-neutral-50/50 dark:bg-neutral-950/30">
                {searching ? (
                  <p className="text-xs text-neutral-400 italic py-4 text-center">Buscando banco de dados...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((p) => {
                    const isAlreadyAdded = products.some((item) => item.id === p.id);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-2.5 hover:bg-white dark:hover:bg-neutral-900 rounded-lg transition-colors">
                        <div className="flex items-center gap-2.5">
                          <img src={productImageUrl(p.imageUrl)} alt={p.name} className="w-8 h-8 object-cover rounded-md bg-neutral-200" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{p.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{p.category}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => onAddProduct?.(p)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded transition-colors ${isAlreadyAdded ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-default' : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 cursor-pointer'}`}
                        >
                          {isAlreadyAdded ? 'Adicionado' : 'Adicionar'}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-400 italic py-4 text-center">Nenhum produto cadastrado na base de dados.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}