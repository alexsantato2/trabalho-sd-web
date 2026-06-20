import { useEffect, useRef, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { carouselService } from '../services/carouselService'; // Novo serviço importado
import type { PageResponse, Product, Carousel as CarouselType } from '../types'; // Tipo Carousel incluído

// Import unificado através do novo index gerenciador
import ProductFilterBar from '../components/ProductFilterBar';
import { Carousel, CarouselSkeleton } from '../components/Carousel';

export default function Home() {
  // Estados para a busca tradicional paginada
  const [data, setData] = useState<PageResponse<Product> | null>(null);
  // Estado para armazenar as vitrines/carrosséis da Home dinâmicos
  const [carousels, setCarousels] = useState<CarouselType[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Define se o usuário está executando uma busca ativa por filtros
  const isFiltering = search.trim() !== '' || category !== '';

  function load(name: string, cat: string) {
    setLoading(true);
    setError(false);

    // Se houver qualquer filtro ativo, carrega a API tradicional de produtos filtrados
    if (name.trim() !== '' || cat !== '') {
      productService
        .getProducts({ name: name || undefined, category: cat || undefined }, 0, 24)
        .then((res) => {
          setData(res);
          setCarousels([]); // Limpa os carrosséis durante a busca
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    } else {
      // Se a Home estiver limpa, carrega os carrosséis ordenados por GAP vindos do banco
      carouselService
        .getCarousels()
        .then((res) => {
          setCarousels(res);
          setData(null); // Limpa o estado da paginação
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }

  useEffect(() => {
    load(search, category);
  }, [category]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(value, category), 300);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
  }

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen">
      
      {/* CONTEÚDO PRINCIPAL (Seguindo a estrutura de 'full-page' do Card View) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* FLASH MESSAGE: Só aparece em caso de falha de requisição no sistema */}
        {error && (
          <div 
            role="alert" 
            className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 p-4 rounded text-sm text-red-800 dark:text-red-200"
          >
            <div className="flex items-center gap-2.5">
              <svg className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Não foi possível recuperar as vitrines. Ocorreu um problema de conexão com o servidor.</span>
            </div>
            <button 
              type="button"
              onClick={() => load(search, category)}
              className="text-xs font-semibold uppercase tracking-wider bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0 text-neutral-800 dark:text-neutral-200"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* CABEÇALHO DO RESOURCE VIEW */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Vitrines
          </h1>
        </div>

        {/* ÁREA DE FILTROS REUTIIZÁVEL */}
        <div className="mb-8">
          <ProductFilterBar 
            search={search}
            category={category}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* CONTADOR DE ELEMENTOS */}
        <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-wider text-neutral-400 font-medium">
          <span>{isFiltering ? 'Resultado da busca' : 'Destaques'}</span>
          {!loading && isFiltering && data && (
            <span>{data.totalElements} produto{data.totalElements !== 1 ? 's' : ''} encontrado{data.totalElements !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* EXIBIÇÃO DE CONTEÚDO / MULTIPLOS CARROSSEIS */}
        {loading ? (
          <div className="space-y-12">
            <CarouselSkeleton />
            {!isFiltering && <CarouselSkeleton />}
          </div>
        ) : isFiltering ? (
          /* MODO BUSCA ATIVO: Renderiza um único carrossel com o resultado do filtro */
          data?.content && data.content.length > 0 ? (
            <Carousel>
              {data.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Carousel>
          ) : (
            <p className="text-sm text-neutral-500">Nenhum produto corresponde à sua busca.</p>
          )
        ) : (
          /* MODO HOME LIMPO: Renderiza múltiplos carrosséis sequenciais vindos do banco */
          carousels.length > 0 ? (
            <div className="space-y-12">
              {carousels.map((carousel) => (
                <div key={carousel.id} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-2">
                    <h2 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 tracking-tight">
                      {carousel.name}
                    </h2>
                  </div>
                  
                  {carousel.products && carousel.products.length > 0 ? (
                    <Carousel>
                      {carousel.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </Carousel>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">Nenhum item adicionado a esta vitrine.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Nenhum carrossel cadastrado na página inicial.</p>
          )
        )}
      </main>
    </div>
  );
}