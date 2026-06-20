import api from './api';

export async function uploadImage(productId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  await api.post(`/images/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
