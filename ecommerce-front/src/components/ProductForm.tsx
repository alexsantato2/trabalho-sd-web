import { useRef, useState, type FormEvent } from 'react';
import { productImageUrl } from '../utils/imageUrl';
import type { Product } from '../types';
import { CATEGORIES } from '../constants/categories';

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageFile: File | null;
}

interface Props {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, loading }: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '');
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity?.toString() ?? '');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.imageUrl ? productImageUrl(initialData.imageUrl) : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({
      name,
      description,
      category,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      imageFile,
    });
  }

  const inputClass = 'w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Imagem do produto</label>

        {imagePreview ? (
          <div className="relative w-40 h-40">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border border-neutral-100"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-900 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-40 h-40 border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <span className="text-2xl mb-1">+</span>
            <span className="text-xs uppercase tracking-wider">Selecionar</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {imagePreview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs text-neutral-400 hover:text-neutral-700 transition-colors underline underline-offset-2"
          >
            Trocar imagem
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Categoria</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputClass}>
          <option value="">Selecione uma categoria</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Descrição</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Preço (R$)</label>
          <input type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Estoque</label>
          <input type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required className={inputClass} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-neutral-900 text-white py-2.5 text-sm uppercase tracking-wider font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
