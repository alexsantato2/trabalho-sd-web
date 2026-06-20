import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.login({ email, password });
      login(user);
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch {
      setError('E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  // Abstração estrita do Input (idêntico ao RegisterPage)
  const inputClass = `
    w-full border px-3 py-2.5 text-sm focus:outline-none transition-colors
    border-color-border-input-default dark:border-color-border-input-default-dark 
    bg-color-background-input-default dark:bg-color-background-input-default-dark 
    text-color-text-input-default dark:text-color-text-input-default-dark 
    rounded-[var(--radius-border-radius-input)] 
    focus:border-color-border-input-focused dark:focus:border-color-border-input-focused-dark
  `;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-color-background-layout-main dark:bg-color-background-layout-main-dark">
      <div className="w-full max-w-sm">
        
        {/* Título Principal */}
        <h1 className="text-2xl font-light mb-1 text-color-text-heading-default dark:text-color-text-heading-default-dark">
          Entrar
        </h1>
        
        {/* Parágrafo de Contexto e Link */}
        <p className="text-sm mb-8 text-color-text-paragraph-secondary dark:text-color-text-paragraph-secondary-dark">
          Novo por aqui?{' '}
          <Link 
            to="/register" 
            className="underline underline-offset-2 hover:opacity-80 transition-opacity text-color-text-link-default dark:text-color-text-link-default-dark"
          >
            Criar conta
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Caixa de Alerta (Erro) */}
          {error && (
            <p className="text-sm px-3 py-2 border rounded-[var(--radius-border-radius-alert)] text-color-text-alert-error bg-color-background-alert-error border-color-border-alert-error">
              {error}
            </p>
          )}

          {/* Campo: E-mail */}
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 text-color-text-label-form dark:text-color-text-label-form-dark">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="seu@email.com"
            />
          </div>

          {/* Campo: Senha */}
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 text-color-text-label-form dark:text-color-text-label-form-dark">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="••••••"
            />
          </div>

          {/* Botão Primário */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm uppercase tracking-wider font-medium transition-colors disabled:opacity-50 text-color-text-button-primary bg-color-background-button-primary-default hover:bg-color-background-button-primary-hover"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
        </form>
      </div>
    </div>
  );
}