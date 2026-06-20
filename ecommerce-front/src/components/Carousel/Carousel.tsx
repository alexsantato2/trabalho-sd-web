import { Children, type ReactNode, useRef, useState, useEffect, useCallback } from 'react';

interface CarouselProps {
  children: ReactNode;
  readOnly?: boolean; // Novo parâmetro opcional
}

// Adicionado o valor padrão readOnly = false na desestruturação
export default function Carousel({ children, readOnly = false }: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  useEffect(() => {
    checkScroll();
  }, [children, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const childrenArray = Children.toArray(children);

  const arrowBtnBase = `
    absolute top-1/2 -translate-y-1/2 z-30 
    hidden sm:flex h-10 w-10 items-center justify-center 
    rounded-full border border-neutral-200 dark:border-neutral-800 
    bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm
    text-neutral-600 dark:text-neutral-400 
    hover:text-neutral-900 dark:hover:text-neutral-100
    hover:bg-white dark:hover:bg-neutral-900 hover:shadow-md
    transition-all duration-300 ease-out
    opacity-0 group-hover/carousel:opacity-100
    disabled:opacity-0 disabled:pointer-events-none
  `;

  return (
    <div className="relative w-full group/carousel px-1" role="region" aria-label="Carrossel de produtos">
      
      {/* Seta Esquerda (Anterior) */}
      <button
        type="button"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`${arrowBtnBase} left-4 -translate-x-2 group-hover/carousel:translate-x-0`}
        aria-label="Produtos anteriores"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Container de Scroll Horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex w-full gap-x-6 overflow-x-auto scroll-smooth pb-4 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {childrenArray.map((child, index) => (
          <div 
            key={index} 
            className={`w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start first:pl-1 last:pr-1 transition-opacity
              ${readOnly ? 'pointer-events-none select-none opacity-90' : ''}`}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Seta Direita (Próximo) */}
      <button
        type="button"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`${arrowBtnBase} right-4 translate-x-2 group-hover/carousel:translate-x-0`}
        aria-label="Próximos produtos"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}