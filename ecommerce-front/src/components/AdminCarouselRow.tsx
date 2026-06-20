import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCarouselAdmin } from '../contexts/CarouselAdminContext';
import { Carousel } from './Carousel';
import ProductCard from './ProductCard';
import type { Carousel as CarouselType } from '../types';

interface AdminCarouselRowProps {
  carousel: CarouselType;
  index: number;
  onDelete: (id: string) => void; // 1. Alterado aqui de onOpenDelete para onDelete
}

export function AdminCarouselRow({ carousel, index, onDelete }: AdminCarouselRowProps) { // 2. Desestruturado onDelete aqui
  const navigate = useNavigate();
  const { carousels, isSaving, isSyncing, moveCarouselLocal } = useCarouselAdmin();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900/40 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm will-change-transform"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold px-2.5 py-0.5 rounded shadow-sm">
            Posição {carousel.position}
          </span>
          <h2 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 tracking-tight">
            {carousel.name}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm">
          {/* Editar */}
          <button
            type="button"
            disabled={isSaving || isSyncing}
            onClick={() => navigate(`/admin/carousel/${carousel.id}`)}
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            title="Editar vitrine"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Remover (Lixeira) */}
          <button
            type="button"
            disabled={isSaving || isSyncing}
            onClick={() => onDelete(carousel.id)} // 3. Corrigido na linha 60: alterado de onOpenDelete para onDelete
            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors cursor-pointer"
            title="Excluir vitrine"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* Mover para Cima */}
          <button
            type="button"
            disabled={index === 0 || isSaving || isSyncing}
            onClick={() => moveCarouselLocal(index, 'up')}
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-30 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Mover para Baixo */}
          <button
            type="button"
            disabled={index === carousels.length - 1 || isSaving || isSyncing}
            onClick={() => moveCarouselLocal(index, 'down')}
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-30 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {carousel.products && carousel.products.length > 0 ? (
        <Carousel readOnly>
          {carousel.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>
      ) : (
        <p className="text-xs text-neutral-400 italic py-4">Nenhum item adicionado a esta vitrine.</p>
      )}
    </motion.div>
  );
}