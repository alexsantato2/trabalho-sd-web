export default function CarouselSkeleton() {
  // Criamos uma array fake com 4 itens para simular os produtos preenchendo a tela
  const dummyItems = Array(4).fill(null);

  return (
    <div className="relative w-full px-1">
      
      {/* Container de Scroll Estático (Espelha perfeitamente o container original) */}
      <div className="flex w-full gap-x-6 overflow-hidden pb-4 pt-2">
        {dummyItems.map((_, index) => (
          <div 
            key={index} 
            className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 first:pl-1 last:pr-1"
          >
            {/* Bloco do "Produto" em estado de esqueleto.
              Injetamos o style inline para acelerar o ciclo de 2s para 1.2s (fica bem mais dinâmico e intenso)
            */}
            <div 
              className="w-full flex flex-col gap-y-4 animate-pulse"
              style={{ animationDuration: '1.2s' }}
            >
              
              {/* 1. Esqueleto da Imagem do Produto 
                Alterado de neutral-200 para neutral-300/neutral-700 para dar maior profundidade ao pulso
              */}
              <div className="w-full aspect-square rounded-lg bg-neutral-300 dark:bg-neutral-700" />
              
              {/* Corpo de textos alinhados */}
              <div className="flex flex-col gap-y-2 px-1">
                {/* 2. Esqueleto do Título/Marca */}
                <div className="h-4 w-3/4 rounded bg-neutral-300 dark:bg-neutral-700" />
                
                {/* 3. Esqueleto da Avaliação/Preço */}
                <div className="h-3 w-1/2 rounded bg-neutral-300 dark:bg-neutral-700" />
                
                {/* 4. Esqueleto do Preço */}
                <div className="h-5 w-1/3 rounded bg-neutral-300 dark:bg-neutral-700 mt-1" />
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}