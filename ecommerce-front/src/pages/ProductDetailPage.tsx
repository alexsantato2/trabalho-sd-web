import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { productImageUrl } from '../utils/imageUrl';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import type { Product, Review } from '../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  function loadProduct() {
    if (!id) return;
    productService.getProduct(id).then(setProduct).catch(() => navigate('/'));
  }

  function loadReviews() {
    if (!id) return;
    reviewService.getReviews(id).then(setReviews);
  }

  useEffect(() => {
    if (!id) return;
    Promise.all([
      productService.getProduct(id),
      reviewService.getReviews(id),
    ])
      .then(([p, r]) => { setProduct(p); setReviews(r); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
          <div className="space-y-4 py-8">
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-full" />
            <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-5/6" />
            <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 dark:bg-neutral-950">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
          {productImageUrl(product.imageUrl) && (
            <img src={productImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-medium">{product.category}</span>
          <h1 className="mt-2 text-2xl font-light text-neutral-900 dark:text-neutral-100">{product.name}</h1>

          {product.averageRating != null && product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={Math.round(product.averageRating)} size="sm" />
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {product.averageRating.toFixed(1)} ({product.reviewCount} avaliação{product.reviewCount !== 1 ? 'ões' : ''})
              </span>
            </div>
          )}

          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{product.description}</p>
          <p className="mt-6 text-xl font-medium text-neutral-900 dark:text-neutral-100">{fmt.format(product.price)}</p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            {product.stockQuantity > 0 ? `${product.stockQuantity} em estoque` : 'Fora de estoque'}
          </p>
          <button
            disabled={product.stockQuantity === 0}
            onClick={() => addItem(product)}
            className="mt-8 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 py-3 text-sm uppercase tracking-wider font-medium hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Adicionar ao carrinho
          </button>
        </div>
      </div>

      <div className="mt-16">
        {product.reviewCount > 0 && (
          <h2 className="text-lg font-light text-neutral-900 dark:text-neutral-100 mb-6">Avaliações</h2>
        )
        }

        {product.averageRating != null && (
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-3xl font-light text-neutral-900 dark:text-neutral-100">
              {product.averageRating.toFixed(1)}
            </span>
            <div>
              <StarRating value={Math.round(product.averageRating)} />
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                {product.reviewCount} avaliação{product.reviewCount !== 1 ? 'ões' : ''}
              </p>
            </div>
          </div>
        )}

        <ReviewList reviews={reviews} />

        {isAuthenticated && (
          <div className="mt-8">
            <ReviewForm
              productId={product.id}
              onSubmitted={() => {
                loadReviews();
                loadProduct();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
