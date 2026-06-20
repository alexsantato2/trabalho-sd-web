import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { useCarouselAdmin } from '../../../contexts/CarouselAdminContext';
import { CarouselItemsProvider, useCarouselItems } from '../../../contexts/CarouselItemsContext';

import CarouselDetailPreview from '../../../components/CarouselDetailPreview';
import CarouselManualProducts from '../../../components/CarouselManualProducts';
import type { Product, Carousel as CarouselType } from '../../../types';

export default function CarouselDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { carousels, updateCarouselLocal, saveChanges, createCarousel, deleteCarouselLocal, loading } =
    useCarouselAdmin();

  const [carouselName, setCarouselName] = useState('');
  const currentCarousel = carousels.find((c) => c.id === id);
  const isNew = location.state?.isNew ?? !id;
  const initialProducts: Product[] = currentCarousel?.products ?? [];

  useEffect(() => {
    if (currentCarousel) setCarouselName(currentCarousel.name);
  }, [currentCarousel]);

  if (loading && !currentCarousel) {
    return <div className="p-10 text-center">Carregando...</div>;
  }

  if (!id) {
    return <div className="p-10 text-center">ID não fornecido.</div>;
  }

  return (
    <CarouselItemsProvider key={id || 'new'} initialProducts={initialProducts}>
      <CarouselContentWrapper
        id={id}
        isNew={isNew}
        name={carouselName}
        setName={setCarouselName}
        onNavigate={() => navigate('/admin/carousel')}
        updateLocal={updateCarouselLocal}
        deleteLocal={deleteCarouselLocal}
        saveGlobal={saveChanges}
        createGlobal={createCarousel}
      />
    </CarouselItemsProvider>
  );
}

interface CarouselContentWrapperProps {
  id: string;
  isNew: boolean;
  name: string;
  setName: (name: string) => void;
  onNavigate: () => void;
  updateLocal: (id: string, updates: Partial<CarouselType>) => void;
  deleteLocal: (id: string) => void;
  saveGlobal: () => Promise<void>;
  createGlobal: (name: string) => Promise<CarouselType>;
}

function CarouselContentWrapper({
  id,
  isNew,
  name,
  setName,
  onNavigate,
  updateLocal,
  deleteLocal,
  saveGlobal,
  createGlobal,
}: CarouselContentWrapperProps) {
  const {
    state,
    updateState,
    saveItems,
    isSavingItems,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCarouselItems();

  // Destruturando também a função forceSync do contexto admin
  const { isSaving: isSavingGlobal, forceSync } = useCarouselAdmin();

  const addItem = (product: Product) => {
    if (state.linkedItems.some((p) => p.id === product.id)) return;
    updateState({ linkedItems: [...state.linkedItems, product] });
  };

  const removeItem = (productId: string) => {
    updateState({ linkedItems: state.linkedItems.filter((p) => p.id !== productId) });
  };

  const moveUp = (index: number) => {
    if (state.strategy === 'dynamic' || index === 0) return;
    const updated = [...state.linkedItems];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    updateState({ linkedItems: updated });
  };

  const moveDown = (index: number) => {
    if (state.strategy === 'dynamic' || index === state.linkedItems.length - 1) return;
    const updated = [...state.linkedItems];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updateState({ linkedItems: updated });
  };

  const setStrategy = (strategy: 'manual' | 'dynamic') => {
    updateState({ strategy });
  };

  const setDynamicFilter = (dynamicFilter: string) => {
    updateState({ dynamicFilter });
  };

  // Teclado (Undo/Redo)
  const historyRef = useRef({ undo, redo, canUndo, canRedo });
  useEffect(() => {
    historyRef.current = { undo, redo, canUndo, canRedo };
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const { undo, redo, canUndo, canRedo } = historyRef.current;
      if (isCtrl && isShift && key === 'z') { e.preventDefault(); if (canRedo) redo(); }
      else if (isCtrl && !isShift && key === 'z') { e.preventDefault(); if (canUndo) undo(); }
      else if (isCtrl && key === 'y') { e.preventDefault(); if (canRedo) redo(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleUnifiedSave() {
    if (isBusy) return;

    try {
      if (isNew) {
        // 1. Cria o carrossel direto no servidor
        const newCarousel = await createGlobal(name);
        
        if (!newCarousel || !newCarousel.id) {
          throw new Error("Erro: O servidor não retornou o ID do novo carrossel.");
        }

        // 2. Salva os produtos vinculados direto no servidor usando o ID retornado
        await saveItems(newCarousel.id);

      } else {
        // Para carrosséis existentes
        updateLocal(id, { name });
        await Promise.all([saveGlobal(), saveItems(id)]);
      }

      // 3. Força a sincronização global do contexto para recarregar as listas do servidor
      if (typeof forceSync === 'function') {
        await forceSync();
      }

      // Navega de volta apenas após a API confirmar o sucesso de tudo e sincronizar
      onNavigate();
      
    } catch (error) {
      console.error('Erro ao salvar carrossel globalmente:', error);
      alert('Falha ao criar vitrine no servidor. Tente novamente.');
    }
  }

  function handleCancel() {
    if (isNew) deleteLocal(id);
    onNavigate();
  }

  const isBusy = isSavingGlobal || isSavingItems;

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen p-6">
      <div className="flex justify-between border-b pb-4 mb-6 gap-4 items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-xl font-bold bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 flex-1 min-w-0"
          placeholder="Nome da vitrine"
        />

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo || isBusy}
            className="p-1.5 rounded text-neutral-500 hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            ←
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo || isBusy}
            className="p-1.5 rounded text-neutral-500 hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={handleCancel} disabled={isBusy} className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-neutral-100 dark:bg-neutral-900 border rounded cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleUnifiedSave} disabled={isBusy} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded font-semibold text-sm cursor-pointer whitespace-nowrap">
            {isBusy ? 'Salvando...' : isNew ? 'Criar Vitrine' : 'Salvar Vitrine'}
          </button>
        </div>
      </div>

      <CarouselDetailPreview
        products={state.linkedItems}
        strategy={state.strategy}
        dynamicFilter={state.dynamicFilter}
      />

      <CarouselManualProducts
        products={state.linkedItems}
        onAddProduct={addItem}
        onRemoveProduct={removeItem}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        strategy={state.strategy}
        onStrategyChange={setStrategy}
        dynamicFilter={state.dynamicFilter}
        onDynamicFilterChange={setDynamicFilter}
      />
    </div>
  );
}