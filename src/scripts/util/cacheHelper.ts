
const FIREBASE_STORAGE_CACHE_PROXY = "https://firebase-storage-cache.taptwice.dev"

export const getSrc = (url: string) => {
  return `${FIREBASE_STORAGE_CACHE_PROXY}/?url=${url}`
}
