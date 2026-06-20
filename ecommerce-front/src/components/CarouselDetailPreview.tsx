import { Carousel } from './Carousel';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface PreviewProps {
  strategy: 'manual' | 'dynamic';
  dynamicFilter: string;
  products: Product[];
}

export default function CarouselDetailPreview({ strategy, dynamicFilter, products = [] }: PreviewProps) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/40 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 mb-8 flex flex-col items-center justify-center">
      
      {/* Indicador de Status Superior */}
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Visualização em tempo real
        </span>
        <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono px-2 py-0.5 rounded font-semibold uppercase">
          Modo: {strategy === 'manual' ? 'Manualmente Fixado' : `Regra Dinâmica (${dynamicFilter})`}
        </span>
      </div>

      <div className="w-full max-w-5xl">
        {/* CASO 1: Lista manual vazia */}
        {strategy === 'manual' && products.length === 0 ? (
          <p className="text-sm text-neutral-400 italic text-center py-8">
            Nenhum produto associado a esta vitrine.
          </p>
        ) : 
        /* CASO 2: Regra dinâmica, mas a API ainda não retornou dados */
        strategy === 'dynamic' && products.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 p-4 w-full">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 block animate-pulse">
              Carregando dados da API...
            </span>
            <p className="text-xs text-neutral-400 mt-1">
              {dynamicFilter === 'best-sellers' && 'Buscando os produtos mais vendidos diretamente da API do servidor.'}
              {dynamicFilter === 'new-arrivals' && 'Buscando os últimos lançamentos registrados na plataforma.'}
              {dynamicFilter === 'special-offers' && 'Filtrando os itens com os melhores preços ativos.'}
              {dynamicFilter === 'highly-rated' && 'Buscando itens com as maiores avaliações dos clientes.'}
            </p>
          </div>
        ) : (
          /* CASO 3: Renderiza o Carrossel Real com os dados na tela (Funciona para os dois modos agora!) */
          <Carousel readOnly>
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </Carousel>
        )}
      </div>
    </div>
  );
}