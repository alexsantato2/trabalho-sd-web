import { useEffect, useState, type FormEvent } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userService.getProfile()
      .then((u) => { setProfile(u); setName(u.name); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const updated = await userService.updateProfile(name);
      setProfile(updated);
      updateUser({ name: updated.name });
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-4">
        <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2" />
        <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded w-full mt-8" />
      </div>
    );
  }

  const inputClass = 'w-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500';

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-light text-neutral-900 dark:text-neutral-100 mb-8">Meu perfil</h1>

      <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-sm space-y-1">
        <p className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider font-medium">E-mail</p>
        <p className="text-neutral-800 dark:text-neutral-200">{profile?.email}</p>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider font-medium mt-3">Papel</p>
        <p className="text-neutral-800 dark:text-neutral-200">{profile?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {success && (
          <p className="text-sm text-green-600 dark:text-green-400">Nome atualizado com sucesso.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 py-2.5 text-sm uppercase tracking-wider font-medium hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  );
}
