import { createContext, useContext, useState, ReactNode } from 'react';
import { carouselService } from '../services/carouselService';
import type { Product } from '../types';

export interface CarouselScreenSnapshot {
  linkedItems: Product[];   // Lista única de produtos vinculados ao carrossel (vale para os dois modos)
  strategy: 'manual' | 'dynamic'; // Apenas controla qual aba de edição está ativa
  dynamicFilter: string;
  pageSize: number;
}

interface CarouselItemsContextType {
  state: CarouselScreenSnapshot;
  updateState: (newState: Partial<CarouselScreenSnapshot>, skipHistory?: boolean) => void;
  saveItems: (carouselId: string) => Promise<void>;
  isSavingItems: boolean;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CarouselItemsContext = createContext<CarouselItemsContextType | undefined>(undefined);

export function CarouselItemsProvider({
  children,
  initialProducts,
}: {
  children: ReactNode;
  initialProducts: Product[];
}) {
  const [isSavingItems, setIsSavingItems] = useState(false);

  
  const [history, setHistory] = useState<CarouselScreenSnapshot[]>([
    {
      linkedItems: initialProducts,
      strategy: 'manual',
      dynamicFilter: 'best-sellers',
      pageSize: 8,
    },
  ]);

  const [pointer, setPointer] = useState(0);

  const currentState = history[pointer];

  const updateState = (newState: Partial<CarouselScreenSnapshot>, skipHistory = false) => {
    setHistory((prev) => {
      const currentSnapshot = prev[pointer];
      const mergedSnapshot: CarouselScreenSnapshot = {
        linkedItems: newState.linkedItems !== undefined ? newState.linkedItems : currentSnapshot.linkedItems,
        strategy: newState.strategy !== undefined ? newState.strategy : currentSnapshot.strategy,
        dynamicFilter: newState.dynamicFilter !== undefined ? newState.dynamicFilter : currentSnapshot.dynamicFilter,
        pageSize: newState.pageSize !== undefined ? newState.pageSize : currentSnapshot.pageSize,
      };

      if (skipHistory) {
        const updatedHistory = [...prev];
        updatedHistory[pointer] = mergedSnapshot;
        return updatedHistory;
      } else {
        const cleanHistory = prev.slice(0, pointer + 1);
        setPointer(cleanHistory.length);
        return [...cleanHistory, mergedSnapshot];
      }
    });
  };

  const undo = () => {
    if (pointer > 0) setPointer((p) => p - 1);
  };

  const redo = () => {
    if (pointer < history.length - 1) setPointer((p) => p + 1);
  };

  
  async function saveItems(carouselId: string) {
    if (!carouselId) return;
    setIsSavingItems(true);
    try {
      const productIds = currentState.linkedItems.map((p) => p.id);
      await carouselService.updateCarouselProducts(carouselId, productIds);
    } finally {
      setIsSavingItems(false);
    }
  }

  return (
    <CarouselItemsContext.Provider
      value={{
        state: currentState,
        updateState,
        saveItems,
        isSavingItems,
        undo,
        redo,
        canUndo: pointer > 0,
        canRedo: pointer < history.length - 1,
      }}
    >
      {children}
    </CarouselItemsContext.Provider>
  );
}

export const useCarouselItems = () => {
  const context = useContext(CarouselItemsContext);
  if (!context) throw new Error('useCarouselItems deve ser usado dentro de um CarouselItemsProvider');
  return context;
};