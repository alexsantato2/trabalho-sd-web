import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import type { User } from '../../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-400">Carregando...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-light text-neutral-900 mb-6">Usuários</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
              <th className="pb-3 font-medium">Nome</th>
              <th className="pb-3 font-medium">E-mail</th>
              <th className="pb-3 font-medium">Papel</th>
              <th className="pb-3 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50">
                <td className="py-3 text-neutral-900">{u.name}</td>
                <td className="py-3 text-neutral-500">{u.email}</td>
                <td className="py-3">
                  <span className={`text-xs font-medium ${u.role === 'ADMIN' ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 text-neutral-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
