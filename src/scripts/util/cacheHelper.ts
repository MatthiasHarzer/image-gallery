
const FIREBASE_STORAGE_CACHE_PROXY = "https://firebase-storage-cache.taptwice.dev"

export const getSrc = (url: string) => {
  if (!url || url.length == 0) return null;
  return `${FIREBASE_STORAGE_CACHE_PROXY}/?url=${url}`
}
