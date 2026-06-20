import { createContext, useContext, useEffect, useState, type ReactNode, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { carouselService } from '../services/carouselService';
import { storageManager, STORAGE_KEYS } from '../services/storageManager';
import { useCarouselHistory } from '../hooks/useCarouselHistory';
import type { Carousel as CarouselType } from '../types';

type LogEntryType = 'UNDO' | 'REDO' | 'SAVE' | 'CREATE' | 'MOVE' | 'ROLLBACK' | 'RESTORE';

export interface LogEntry {
  id: string; timestamp: string; description: string; type: LogEntryType;
}

interface CarouselAdminContextType {
  carousels: CarouselType[];
  changeLog: LogEntry[];
  isDirty: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  loading: boolean;
  error: boolean;
  moveCarouselLocal: (index: number, direction: 'up' | 'down') => void;
  createCarouselLocal: () => string;
  createCarousel: (name: string) => Promise<CarouselType>;
  updateCarouselLocal: (id: string, updates: Partial<CarouselType>) => void;
  deleteCarousel: (id: string) => Promise<void>;
  deleteCarouselLocal: (id: string) => void; // 🌟 Adicionado na interface
  discardChanges: () => void;
  saveChanges: () => Promise<void>;
  forceSync: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveError: string | null;
  clearSaveError: () => void;
}

const CarouselAdminContext = createContext<CarouselAdminContextType | undefined>(undefined);

export function CarouselAdminProvider({ children }: { children?: ReactNode }) {
  const historyHook = useCarouselHistory<CarouselType>();
  const { carousels, history, historyPointer, savedHistoryIndex, push,
          setHistory, setHistoryPointer, setSavedHistoryIndex } = historyHook;
  
  const [changeLog, setChangeLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const isDirty = historyPointer !== savedHistoryIndex && history.length > 0;

  const keyboardHandlersRef = useRef<{ handleUndo: () => void; handleRedo: () => void }>({
    handleUndo: () => {},
    handleRedo: () => {},
  });

  function handleUndo() {
    if (historyHook.historyPointer > 0) {
      historyHook.undo();
      addLog('Desfez a última alteração', 'UNDO');
    }
  }
  
  function handleRedo() {
    if (historyHook.historyPointer < historyHook.history.length - 1) {
      historyHook.redo();
      addLog('Refez a última alteração', 'REDO');
    }
  }

  keyboardHandlersRef.current = { handleUndo, handleRedo };

  useEffect(() => {
    async function init() {
      try {
        const data = await carouselService.getCarousels();
        const localDraft = storageManager.get(STORAGE_KEYS.CAROUSELS);
        
        if (localDraft) {
          setHistory(JSON.parse(localDraft));
          setHistoryPointer(Number(storageManager.get(STORAGE_KEYS.POINTER)));
          setSavedHistoryIndex(Number(storageManager.get(STORAGE_KEYS.SAVED_INDEX)));
          setChangeLog(JSON.parse(storageManager.get(STORAGE_KEYS.LOG) || '[]'));
        } else {
          setHistory([data.sort((a, b) => a.position - b.position)]);
          setHistoryPointer(0);
        }
      } catch { setError(true); }
      finally { setLoading(false); isInitialMount.current = false; }
    }
    init();
  }, []);

  useEffect(() => {
    if (isInitialMount.current || loading || isSyncing || isSaving) return;
    storageManager.set(STORAGE_KEYS.CAROUSELS, JSON.stringify(history));
    storageManager.set(STORAGE_KEYS.POINTER, String(historyPointer));
    storageManager.set(STORAGE_KEYS.SAVED_INDEX, String(savedHistoryIndex));
    storageManager.set(STORAGE_KEYS.LOG, JSON.stringify(changeLog));
  }, [history, historyPointer, savedHistoryIndex, changeLog, loading, isSyncing, isSaving]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();
      
      if (isCtrl && isShift && key === 'z') {
        e.preventDefault();
        keyboardHandlersRef.current.handleRedo();
      } else if (isCtrl && !isShift && key === 'z') {
        e.preventDefault();
        keyboardHandlersRef.current.handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function addLog(description: string, type: LogEntryType) {
    setChangeLog(prev => [{ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), description, type }, ...prev]);
  }

  // Função interna auxiliar compartilhada para reordenar posições locais
  const applyLocalRemoval = (id: string) => {
    const remainingCarousels = carousels
      .filter(c => c.id !== id)
      .map((c, index) => ({ ...c, position: index }));
    push(remainingCarousels);
  };

  // 🌟 NOVA FUNÇÃO: Deleta estritamente local de forma síncrona (utilizado no botão cancelar)
  function deleteCarouselLocal(id: string) {
    const targetCarousel = carousels.find(c => c.id === id);
    const carouselName = targetCarousel ? targetCarousel.name : 'Vitrine';

    applyLocalRemoval(id);
    addLog(`Rascunho de vitrine "${carouselName}" descartado localmente`, 'ROLLBACK');
  }

  // Delete do banco com fallback imediato para o estado local
  async function deleteCarousel(id: string) {
    setIsSaving(true);

    const targetCarousel = carousels.find(c => c.id === id);
    const carouselName = targetCarousel ? targetCarousel.name : 'Vitrine';

    // Se o ID for temporário (gerado localmente por exemplo), apenas remove da tela
    if (id.includes('-') && id.startsWith('temp')) {
      applyLocalRemoval(id);
      addLog(`Rascunho de vitrine descartado localmente`, 'ROLLBACK');
      setIsSaving(false);
      return;
    }

    try {
      // 1. Tenta deletar no servidor remoto via API
      await carouselService.deleteCarousel(id);
      
      // 2. Se deu certo, atualiza o estado local
      applyLocalRemoval(id);
      addLog(`Removeu vitrine "${carouselName}" permanentemente`, 'ROLLBACK');
    } catch (error) {
      console.warn(`Falha ou 404 ao deletar carrossel ${id} no servidor. Forçando a remoção da tela...`, error);
      
      // Fallback: Executa a remoção local mesmo em caso de erro da API ou 404
      applyLocalRemoval(id);
      addLog(`Vitrine "${carouselName}" removida da tela (Não encontrada no servidor)`, 'ROLLBACK');
    } finally {
      setIsSaving(false);
    }
  }

  function updateCarouselLocal(id: string, updates: Partial<CarouselType>) {
    const updated = carousels.map(c => c.id === id ? { ...c, ...updates } : c);
    push(updated);
    addLog(`Atualizou "${updates.name || id}"`, 'SAVE');
  }

  function createCarouselLocal() {
    const newId = `temp-${crypto.randomUUID()}`;
    const newCarousel = { id: newId, name: "Nova Vitrine", position: carousels.length, products: [] };
    push([...carousels, newCarousel]);
    return newId;
  }

  async function createCarousel(name: string): Promise<CarouselType> {
    setIsSaving(true);
    try {
      // 1. Envia para a API criar o definitivo
      const newCarousel = await carouselService.createCarousel({ name });
      
      // 2. Remove o rascunho temporário 'temp-...' que o usuário estava editando na tela
      //    e adiciona o definitivo retornado pelo banco de dados.
      const updated = carousels
        .filter(c => !c.id.startsWith('temp-')) // Remove o temporário clonado
        .concat(newCarousel);                   // Adiciona o carrossel real do back-end
      
      push(updated); // Atualiza o histórico local sincronizado sem duplicar
      addLog(`Criou vitrine "${name}"`, 'CREATE');
      return newCarousel; 
    } catch (error) {
      console.error("Erro ao persistir novo carrossel:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  function moveCarouselLocal(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= carousels.length) return;
    const updated = [...carousels];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    push(updated.map((c, i) => ({ ...c, position: i })));
    addLog('Moveu vitrine', 'MOVE');
  }

  async function saveChanges() {
    setIsSaving(true);
    try {
      await carouselService.bulkSave(carousels);
      const freshData = await carouselService.getCarousels();
      setHistory([freshData.sort((a, b) => a.position - b.position)]);
      setHistoryPointer(0);
      setSavedHistoryIndex(0);
      storageManager.clearAll();
      addLog('Salvo no banco e sincronizado', 'SAVE');
    } catch {
      setSaveError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false); 
    }
  }

  async function forceSync() {
    setIsSyncing(true);
    try {
      storageManager.clearAll();
      const data = await carouselService.getCarousels();
      setHistory([data.sort((a, b) => a.position - b.position)]);
      setHistoryPointer(0);
      setSavedHistoryIndex(0);
      setChangeLog([]);
    } catch { setError(true); }
    finally { setIsSyncing(false); }
  }

  function discardChanges() {
    setHistoryPointer(savedHistoryIndex);
    setHistory(history.slice(0, savedHistoryIndex + 1));
    storageManager.clearAll();
  }

  function clearSaveError() {
    setSaveError(null);
  }

  return (
    <CarouselAdminContext.Provider value={{
      carousels, changeLog, isDirty, isSaving, isSyncing, loading, error,
      moveCarouselLocal, createCarouselLocal, createCarousel, updateCarouselLocal,
      deleteCarousel, deleteCarouselLocal, // 🌟 Passado no Provider value
      discardChanges, saveChanges, forceSync, undo:handleUndo, redo:handleRedo, 
      canUndo: historyPointer > 0, canRedo: historyPointer < history.length - 1,
      saveError, clearSaveError
    }}>
      {children || <Outlet />}
    </CarouselAdminContext.Provider>
  );
}

export const useCarouselAdmin = () => {
  const context = useContext(CarouselAdminContext);
  if (!context) throw new Error('useCarouselAdmin deve ser usado dentro de um CarouselAdminProvider');
  return context;
};