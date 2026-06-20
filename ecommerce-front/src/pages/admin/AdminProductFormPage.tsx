import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm, { type ProductFormData } from '../../components/ProductForm';
import { productService } from '../../services/productService';
import { uploadImage } from '../../services/imageService';
import type { Product } from '../../types';

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      productService.getProduct(id).then(setProduct);
    }
  }, [id]);

  async function handleSubmit(data: ProductFormData) {
    setLoading(true);
    try {
      let saved: Product;

      const productData = {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        stockQuantity: data.stockQuantity,
      };

      if (isEdit && id) {
        saved = await productService.updateProduct(id, productData);
      } else {
        saved = await productService.createProduct(productData);
      }

      if (data.imageFile) {
        await uploadImage(saved.id, data.imageFile);
      }

      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-light text-neutral-900 mb-8">
        {isEdit ? 'Editar produto' : 'Novo produto'}
      </h1>
      <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
