import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { productImageUrl } from '../utils/imageUrl';
import ConfirmationModal from '../components/ConfirmationModal';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartQuantityReadout = `(${totalQuantity}) ${totalQuantity === 1 ? 'item' : 'itens'} no seu carrinho de compras`;
  const summaryQuantityReadout = `Resumo: (${totalQuantity}) ${totalQuantity === 1 ? 'item' : 'itens'}`;

  const confirmClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error("Erro ao esvaziar carrinho:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-neutral-400">
        {/* xx-small (4px) a small (12px) de margem baseado no ritmo vertical */}
        <p className="text-sm mb-3">Seu carrinho está vazio</p>
        <Link to="/" className="text-xs uppercase tracking-wider font-semibold text-neutral-900 dark:text-neutral-100 underline underline-offset-2 hover:text-neutral-600 transition-colors">
          Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      
      {/* mb-6 mapeia para 24px (x-large), espaçamento intencional para separar fluxos de retorno */}
      <div className="mb-6">
        <Link to="/" className="text-xs uppercase tracking-wider font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          ← Continue Comprando
        </Link>
      </div>

      <h1 className="text-3xl font-light text-neutral-900 dark:text-neutral-100 mb-6">
        Carrinho de Compras
      </h1>

      {/* gap-8 equivale a 32px (xx-large) separando os dois blocos principais da estrutura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Lado Esquerdo: Lista de Produtos */}
        <div className="lg:col-span-2">
          {/* Alerta de quantidade com Light fill (Sem contorno chamativo, uso secundário) */}
          <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 p-4 font-medium rounded mb-6 text-sm sm:text-base">
            {cartQuantityReadout}
          </div>

          {/* space-y-6 aplica 24px (x-large) verticalmente entre cada produto da lista */}
          <div className="space-y-6">
            {items.map(({ product, quantity }) => (
              <div 
                key={product.id} 
                className="flex gap-4 items-start border-b border-neutral-100 dark:border-neutral-800 pb-6"
              >                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-normal text-neutral-900 dark:text-neutral-100 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {fmt.format(product.price)} por unidade
                  </p>
                  
                  {/* Controles de Quantidade: Botões interativos com bordas de 1px e transições suaves */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => quantity <= 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-600 dark:text-neutral-400 text-sm flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition-all"
                    >
                      −
                    </button>
                    <span className="text-sm w-5 text-center font-medium dark:text-neutral-200">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-600 dark:text-neutral-400 text-sm flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {fmt.format(product.price * quantity)}
                  </p>
                  <button 
                    type="button" 
                    onClick={() => removeItem(product.id)} 
                    className="mt-2 text-xs text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lado Direito: Resumo do Carrinho (Container Principal - Raio de 16px para destacar o propósito) */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 lg:sticky lg:top-6 bg-white dark:bg-neutral-900 shadow-sm">
          {/* x-small (8px) de margem abaixo do rótulo para criar agrupamento por proximidade */}
          <div className="text-sm text-neutral-500 mb-2">{summaryQuantityReadout}</div>
          
          <div className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            Total: <span className="font-bold">{fmt.format(total)}</span>
          </div>

          {/* Botão Primário: Dark fill (Contraste Máximo invertido para chamar atenção à ação principal sugerida) */}
          <Link 
            to="/checkout" 
            className="block w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-center py-3 text-sm uppercase tracking-wider font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors rounded-lg mb-3 shadow-xs"
          >
            Pagar
          </Link>

          {/* Botão Secundário Limpo: Sem preenchimento (Apenas link discreto para ações destrutivas secundárias) */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 underline underline-offset-2 py-2 transition-colors cursor-pointer"
          >
            Esvaziar Carrinho
          </button>
        </div>
      </div>

      {/* Modal de Confirmação: Totalmente invariante a este container, controlado estritamente pelo overlay global */}
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmClearCart}
      />

    </div>
  );
}