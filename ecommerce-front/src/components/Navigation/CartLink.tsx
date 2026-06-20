import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CartLinkProps {
  quantity: number;
}

export default function CartLink({ quantity }: CartLinkProps) {
  const quantityRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const quantityElem = quantityRef.current;
    if (!quantityElem) return;

    quantityElem.style.width = 'auto';
    quantityElem.style.height = 'auto';

    const offsetWidth = quantityElem.offsetWidth;
    const offsetHeight = quantityElem.offsetHeight;

    if (offsetWidth > offsetHeight) {
      quantityElem.style.height = `${offsetWidth}px`;
    } else {
      quantityElem.style.width = `${offsetHeight}px`;
    }
  }, [quantity]);

  // Cria uma mensagem clara para o leitor de telas (Acessibilidade Cloudscape)
  const cartAriaLabel = quantity > 0 
    ? `Carrinho de compras, ${quantity} ${quantity === 1 ? 'item' : 'itens'}` 
    : 'Carrinho de compras vazio';

  return (
    <Link 
      to="/cart" 
      className="relative p-2 text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors flex items-center"
      aria-label={cartAriaLabel} //
    >
      <span className="text-sm uppercase tracking-wider font-medium">Carrinho</span>
      
      {quantity > 0 && (
        <span 
          ref={quantityRef}
          className="absolute -top-1 -right-3 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 text-[10px] font-bold text-white dark:text-neutral-900 p-1 leading-none min-w-[16px] min-h-[16px]"
          style={{ display: 'inline-flex' }}
          aria-hidden="true" // O leitor de tela já lê o número no link acima, evita redundância
        >
          {quantity}
        </span>
      )}
    </Link>
  );
}