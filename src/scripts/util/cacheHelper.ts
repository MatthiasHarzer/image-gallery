const THUMBNAIL_SIZE = 600;

const FIREBASE_STORAGE_CACHE_PROXY = "https://firebase-storage-cache.taptwice.dev"
const FIREBASE_STORAGE_CACHE_PROXY_THUMBNAIL = `${FIREBASE_STORAGE_CACHE_PROXY}/scale/${THUMBNAIL_SIZE}/`

export const getSrc = (url: string) => {
  if (!url || url.length == 0) return null;
  return `${FIREBASE_STORAGE_CACHE_PROXY}/?url=${url}`
}

export const getThumbnailSrc = (url: string) => {
  if (!url || url.length == 0) return null;
  return `${FIREBASE_STORAGE_CACHE_PROXY_THUMBNAIL}/?url=${url}`
}
