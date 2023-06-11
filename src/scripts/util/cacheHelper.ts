const THUMBNAIL_SIZE = 600;

const FIREBASE_STORAGE_CACHE_PROXY = "https://firebase-storage-cache.taptwice.dev"
const FIREBASE_STORAGE_CACHE_PROXY_THUMBNAIL = `${FIREBASE_STORAGE_CACHE_PROXY}/scale/${THUMBNAIL_SIZE}`

const srcFromResponse = async (response: Response): Promise<string> => {
    return URL.createObjectURL(await response.blob());
}

const cacheKeyFromUrl = (url: string): string => {
    const splits = url.split("?");
    // Remove the query string from the original url
    return splits.slice(0, splits.length - 1).join("?");
}

/**
 * Gets the src for the given url, caching it if it's not already cached.
 * Note: This will fetch the image from the network if it's not already cached, thus may be slow.
 * @param proxiedUrl The url of the image
 */
export const getSrcAndCache = async (proxiedUrl: string): Promise<string> => {
    const cache = await caches.open("v1");

    const cacheKey = cacheKeyFromUrl(proxiedUrl);

    const existing = await cache.match(cacheKey);

    if (existing) {
        return srcFromResponse(existing);
    }

    const response = await fetch(proxiedUrl);

    if (response.ok) {
        await cache.put(cacheKey, response.clone());
    }

    return srcFromResponse(response);
}

/**
 * Gets the src for the given url if it's cached, otherwise returns the original url (not caching).
 * @param proxiedUrl The url of the image
 */
export const getIfHasCachedOrUncachedOtherwise = async (proxiedUrl: string): Promise<string> => {
    const cache = await caches.open("v1");

    const cacheKey = cacheKeyFromUrl(proxiedUrl);

    const existing = await cache.match(cacheKey);

    if (existing) {
        return srcFromResponse(existing);
    }
    return proxiedUrl;
}



const createProxyResolver = (proxy: string) => (url: string): string | null => {
    if (!url || url.length == 0) return null;
    return `${proxy}/?url=${url}`;
}

export const getSrc = createProxyResolver(FIREBASE_STORAGE_CACHE_PROXY);

export const getThumbnailSrc = createProxyResolver(FIREBASE_STORAGE_CACHE_PROXY_THUMBNAIL);


// export const cacheImage = async ()
