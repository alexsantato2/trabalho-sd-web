const backendBase = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');

export function productImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return backendBase + imageUrl;
}
