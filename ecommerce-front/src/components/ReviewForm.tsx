import { useState, useEffect, type FormEvent } from 'react';
import StarRating from './StarRating';
import ConfirmationModal from './ConfirmationModal'; // [!code ++] Importa o modal
import { reviewService } from '../services/reviewService';

interface Props {
  productId: string;
  onSubmitted: () => void;
}

export default function ReviewForm({ productId, onSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // [!code ++] Estado para controlar a abertura do modal

  useEffect(() => {
    async function checkExistingReview() {
      try {
        const alreadyReviewed = await reviewService.checkIfReviewed(productId);
        setHasReviewed(alreadyReviewed);
      } catch (err) {
        console.error('Erro ao checar se usuário já avaliou:', err);
      }
    }

    if (productId) {
      checkExistingReview();
    }
  }, [productId]);

  // Função isolada que faz o envio real para o backend
  async function executeReviewSubmission() { // [!code ++]
    setError(''); // [!code ++]
    setLoading(true); // [!code ++]
    try { // [!code ++]
      await reviewService.createReview(productId, { rating, comment }); // [!code ++]
      setComment(''); // [!code ++]
      setRating(5); // [!code ++]
      setHasReviewed(true); // [!code ++]
      onSubmitted(); // [!code ++]
    } catch (err: unknown) { // [!code ++]
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error; // [!code ++]
      setError(msg ?? 'Erro ao enviar avaliação'); // [!code ++]
    } finally { // [!code ++]
      setLoading(false); // [!code ++]
    } // [!code ++]
  } // [!code ++]

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Se já enviou antes, abre o modal e printa no console dos devs
    if (hasReviewed) {
      console.log('⚠️ [Dev] Já foi feito: Este usuário já enviou uma avaliação. Abrindo modal de confirmação...');
      setIsModalOpen(true); // [!code ++] Abre o modal ao invés de dar 'return' direto
      return;
    }

    // Se for a primeira vez, envia direto normalmente
    await executeReviewSubmission(); // [!code ++]
  }

  // Função chamada quando o desenvolvedor/usuário clica no botão vermelho de confirmar do modal
  async function handleConfirmModal() { // [!code ++]
    setIsModalOpen(false); // Fecha o modal // [!code ++]
    console.log('🚀 [Dev] Usuário confirmou no modal. Forçando o envio da duplicata...'); // [!code ++]
    await executeReviewSubmission(); // Executa o envio mesmo já tendo feito antes // [!code ++]
  } // [!code ++]

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">Sua avaliação</p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Nota:</span>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={3}
          placeholder="Conte sua experiência com o produto..."
          className="w-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs uppercase tracking-wider font-medium hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Publicar avaliação'}
        </button>
      </form>

      {/* Renderiza o modal sem alterar a estrutura interna dele */}
      <ConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmModal} 
        title="Publicar nova avaliação" 
        description="Esta ação substitui sua avaliação anterior para este produto." 
        cancelText="Cancelar" 
        confirmText="Publicar" 
      /> {/* [!code ++] */}
    </>
  );
}