export const STORAGE_KEYS = {
  CAROUSELS: '@admin-ecommerce:carousels-draft',
  LOG: '@admin-ecommerce:changelog-draft',
  POINTER: '@admin-ecommerce:pointer-draft',
  SAVED_INDEX: '@admin-ecommerce:saved-index-draft'
};

export const storageManager = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
  clearAll: () => Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
};