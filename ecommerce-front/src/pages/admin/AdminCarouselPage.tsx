import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useCarouselAdmin } from '../../contexts/CarouselAdminContext';
import { CarouselSkeleton } from '../../components/Carousel';
import ConfirmationModal from '../../components/ConfirmationModal';

// Nossos subcomponentes modulados
import { AdminDraftBanner } from '../../components/AdminDraftBanner';
import { AdminCarouselRow } from '../../components/AdminCarouselRow';
import { AdminSessionLog } from '../../components/AdminSessionLog';

export default function AdminCarouselPage() {
  const navigate = useNavigate();

  const {
    carousels,
    isDirty,
    isSaving,
    isSyncing,
    loading,
    error,
    saveError,
    clearSaveError,
    deleteCarousel,
    createCarouselLocal,
    discardChanges,
    saveChanges,
    forceSync
  } = useCarouselAdmin();

  // Estados dos Modais unificados
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false); 
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);       
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);       
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  async function handleDelete(id: string) {
    await deleteCarousel(id);
  }

  function handleOpenDiscardModal() {
    setPendingRoute(null);
    setIsDiscardModalOpen(true);
  }

  async function handleExitModalConfirm(shouldSave: boolean) {
    setIsExitModalOpen(false);
    if (shouldSave) {
      try { await saveChanges(); } catch (err) { return; }
    } else {
      discardChanges();
    }
    if (pendingRoute) navigate(pendingRoute);
  }

  // Interceptador SPA para links e menus laterais
  useEffect(() => {
    if (!isDirty) return;
    const handleInternalNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !link.hasAttribute('download') && link.target !== '_blank') {
          e.preventDefault(); 
          setPendingRoute(href); 
          setIsExitModalOpen(true);
        }
      }
    };
    document.addEventListener('click', handleInternalNavigation, true);
    return () => document.removeEventListener('click', handleInternalNavigation, true);
  }, [isDirty]);

  function handleConfirmDiscard() {
    setIsDiscardModalOpen(false);
    discardChanges();
    if (pendingRoute) navigate(pendingRoute);
  }

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4">
        
        {/* Banner Sticky Modulado */}
        <AdminDraftBanner onDiscard={handleOpenDiscardModal} />

        {/* CABEÇALHO */}
        <div className="flex items-center justify-between mb-8 border-b border-neutral-100 dark:border-neutral-900 pb-4">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
            Gerenciamento de Vitrines {isDirty && <span className="text-amber-500 animate-pulse">*</span>}
          </h1>
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            disabled={loading || isSaving || isSyncing}
            className="text-xs font-semibold uppercase tracking-wider bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors disabled:opacity-50 min-w-[190px] cursor-pointer"
          >
            {isSyncing ? 'atualizando...' : 'Atualizar'}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-center gap-2.5 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 p-4 rounded text-sm text-red-800 dark:text-red-200">
            <span>Não foi possível carregar os carrosséis. Verifique a conexão com a API.</span>
          </div>
        )}

        {saveError && (
          <div role="alert" className="mb-6 flex items-center justify-between gap-2.5 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 p-4 rounded text-sm text-red-800 dark:text-red-200">
            <span>{saveError}</span>
            <button type="button" onClick={clearSaveError} className="text-red-500 hover:text-red-700 font-semibold text-xs shrink-0">Fechar</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LISTAGEM DOS CARROSSEIS */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="space-y-12"><CarouselSkeleton /><CarouselSkeleton /></div>
            ) : (
              <>
                {/* Renderiza a lista ou o estado vazio */}
                {carousels.length > 0 ? (
                  <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {carousels.map((carousel, index) => (
                        <AdminCarouselRow 
                          key={carousel.id} 
                          carousel={carousel} 
                          index={index} 
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-12">
                    Nenhuma vitrine ativa.
                  </p>
                )}

                {/* O Botão agora fica sempre disponível após o carregamento */}
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    disabled={isSaving || isSyncing}
                    onClick={() => {
                      const newCarouselId = createCarouselLocal(); 
                      if (newCarouselId) navigate(`/admin/carousel/${newCarouselId}`, { state: { isNew: true } });
                    }}
                    className="flex items-center gap-2 text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-5 py-3 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow transition-colors cursor-pointer"
                  >
                    Adicionar Nova Vitrine
                  </button>
                </div>
              </>
            )}
          </div>

          {/* HISTÓRICO DE LOGS */}
          <AdminSessionLog />
        </div>
      </div>

      {/* CENTRAL DE MODAIS DE CONFIRMAÇÃO */}
      <ConfirmationModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={handleConfirmDiscard}
        title="Descartar rascunho"
        description="Esta ação remove as alterações de ordem feitas nesta sessão."
        cancelText="Continuar editando"
        confirmText="Descartar"
      />

      <ConfirmationModal
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
        onConfirm={() => { setIsSyncModalOpen(false); forceSync(); }} 
        title="Atualizar Carrosséis"
        description="A sincronização substitui as modificações locais pelo estado atual do servidor."
        cancelText="Cancelar" 
        confirmText="Atualizar"
      />

      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => handleExitModalConfirm(false)} 
        onConfirm={() => handleExitModalConfirm(true)} 
        title="Salvar alterações pendentes"
        description="Deseja aplicar as modificações de vitrines antes de sair?"
        cancelText="Sair sem salvar" 
        confirmText="Salvar e sair"  
      />
    </div>
  );
}
