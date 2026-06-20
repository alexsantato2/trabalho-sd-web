import type { ViaCEPResponse } from '../types';

export async function fetchAddress(cep: string): Promise<ViaCEPResponse> {
  const cleaned = cep.replace(/\D/g, '');

  const res = await fetch(`${import.meta.env.VITE_VIACEP_BASE_URL}/${cleaned}/json/`);
  const data: ViaCEPResponse = await res.json();
  if (data.erro) {
    throw new Error('CEP não encontrado');
    
  }
  return data;
}
