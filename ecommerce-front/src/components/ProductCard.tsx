import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { productImageUrl } from '../utils/imageUrl';
import type { Product } from '../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <div
        className="aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-lg cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {productImageUrl(product.imageUrl) && (
          <img
            src={productImageUrl(product.imageUrl)}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}
      </div>

      <div className="mt-4 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
            {product.category}
          </span>
          <h3 className="mt-1 text-sm font-normal text-neutral-800 dark:text-neutral-200 tracking-tight">
            {product.name}
          </h3>
        </div>

        <div className="mt-2 pt-1 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-900">{fmt.format(product.price)}</p>
          <button
            className="text-xs uppercase tracking-wider font-semibold text-neutral-950 hover:text-neutral-500 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={product.stockQuantity === 0}
            onClick={() => addItem(product)}
          >
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
