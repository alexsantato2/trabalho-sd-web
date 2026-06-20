import { motion, AnimatePresence } from 'framer-motion';
import { useCarouselAdmin } from '../contexts/CarouselAdminContext';

interface AdminDraftBannerProps {
  onDiscard: () => void;
}

export function AdminDraftBanner({ onDiscard }: AdminDraftBannerProps) {
  const { isDirty, isSaving, saveChanges } = useCarouselAdmin();

  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: "auto", opacity: 1, marginBottom: "1.5rem" }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="sticky top-4 z-40 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 p-4 rounded-lg shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-sm text-amber-800 dark:text-amber-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-medium">Rascunho salvo localmente seguro contra recarregamentos! *</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDiscard}
                className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 px-3 py-1.5 rounded transition-colors"
              >
                Descartar alterações
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => saveChanges()}
                className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded shadow-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}