import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import SkeletonRow from '../../components/SkeletonRow';
import ConfirmationModal from '../../components/ConfirmationModal';
import type { Product } from '../../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleActivate(id: string) {
    await productService.activateProduct(id);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: true } : p));
  }

  async function handleDeactivate(id: string) {
    await productService.deactivateProduct(id);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: false } : p));
  }

  async function handleDelete() {
    if (!productToDelete) return;
    setDeleteError(null);
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      setDeleteError(msg ?? 'Erro ao excluir produto.');
      setProductToDelete(null);
    }
  }

  async function handleStockDelta(id: string, delta: number) {
    const updated = await productService.updateStock(id, delta);
    setProducts((prev) => prev.map((p) => p.id === id ? updated : p));
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-light text-neutral-900 dark:text-neutral-100">Produtos</h1>
        </div>
        <table className="w-full text-sm">
          <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-light text-neutral-900">Produtos</h1>
        <Link
          to="/admin/products/new"
          className="bg-neutral-900 text-white px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-neutral-700 transition-colors"
        >
          + Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
              <th className="pb-3 font-medium">Nome</th>
              <th className="pb-3 font-medium">Categoria</th>
              <th className="pb-3 font-medium">Preço</th>
              <th className="pb-3 font-medium text-center">Estoque</th>
              <th className="pb-3 font-medium text-center">Status</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {products.map((p) => (
              <tr key={p.id} className={`hover:bg-neutral-50 ${!p.active ? 'opacity-50' : ''}`}>
                <td className="py-3 text-neutral-900">{p.name}</td>
                <td className="py-3 text-neutral-500">{p.category}</td>
                <td className="py-3 text-neutral-900">{fmt.format(p.price)}</td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleStockDelta(p.id, -1)}
                      disabled={!p.active}
                      className="w-6 h-6 border border-neutral-200 rounded text-neutral-600 hover:border-neutral-400 text-xs disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{p.stockQuantity}</span>
                    <button
                      onClick={() => handleStockDelta(p.id, 1)}
                      disabled={!p.active}
                      className="w-6 h-6 border border-neutral-200 rounded text-neutral-600 hover:border-neutral-400 text-xs disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span className={`text-xs font-medium ${p.active ? 'text-green-600' : 'text-neutral-400'}`}>
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Editar
                    </Link>
                    {p.active ? (
                      <button
                        onClick={() => handleDeactivate(p.id)}
                        className="text-xs text-neutral-400 hover:text-amber-500 transition-colors"
                      >
                        Inativar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(p.id)}
                        className="text-xs text-neutral-400 hover:text-green-600 transition-colors"
                      >
                        Ativar
                      </button>
                    )}
                    <button
                      onClick={() => { setDeleteError(null); setProductToDelete(p); }}
                      className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteError && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {deleteError}
        </p>
      )}

      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir produto permanentemente"
        description={`Tem certeza que deseja excluir "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
      />
    </div>
  );
}
