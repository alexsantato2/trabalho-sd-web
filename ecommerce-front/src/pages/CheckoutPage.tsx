import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { fetchAddress } from '../services/viaCepService';
import { orderService } from '../services/orderService';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface AddressForm {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState<AddressForm>({
    cep: '', street: '', neighborhood: '', city: '', state: '', number: '', complement: '',
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCepBlur() {
    const cleaned = address.cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    setCepError('');
    try {
      const data = await fetchAddress(cleaned);
      setAddress((prev) => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }));
    } catch {
      setCepError('CEP não encontrado');
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await orderService.placeOrder({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingCep: address.cep,
        shippingStreet: address.street,
        shippingNeighborhood: address.neighborhood,
        shippingCity: address.city,
        shippingState: address.state,
        shippingNumber: address.number,
        shippingComplement: address.complement,
      });
      clearCart();
      navigate('/orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Erro ao finalizar pedido');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-light text-neutral-900 mb-10">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Endereço de entrega</h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">CEP</label>
            <input
              name="cep"
              value={address.cep}
              onChange={handleChange}
              onBlur={handleCepBlur}
              required
              placeholder="00000-000"
              className={inputClass}
            />
            {cepLoading && <p className="text-xs text-neutral-400 mt-1">Buscando CEP...</p>}
            {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Logradouro</label>
            <input name="street" value={address.street} onChange={handleChange} required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Número</label>
              <input name="number" value={address.number} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Complemento</label>
              <input name="complement" value={address.complement} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Bairro</label>
            <input name="neighborhood" value={address.neighborhood} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Cidade</label>
              <input name="city" value={address.city} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Estado</label>
              <input name="state" value={address.state} onChange={handleChange} required maxLength={2} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full mt-4 bg-neutral-900 text-white py-3 text-sm uppercase tracking-wider font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Processando...' : 'Confirmar pedido'}
          </button>
        </form>

        <div>
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-4">Resumo</h2>
          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-neutral-700">{product.name} × {quantity}</span>
                <span className="text-neutral-900 font-medium">{fmt.format(product.price * quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between">
            <span className="text-sm font-medium text-neutral-900">Total</span>
            <span className="text-sm font-medium text-neutral-900">{fmt.format(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
