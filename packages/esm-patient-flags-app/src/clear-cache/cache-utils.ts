/* eslint-disable no-console */
export async function removeFromOmrsCache(urls: Array<string>) {
  if (urls.length === 0) {
    return;
  }
  const omrsCacheName = 'omrs-spa-cache-v1';
  const cache = await caches.open(omrsCacheName);
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        console.log(`[SW] Removing ${url} from the OMRS cache`, url);
        await cache.delete(url);
        return { url, success: true };
      } catch (e) {
        return { url, success: false };
      }
    }),
  );

  const removed = results.filter((r) => r.success);
  const failedToRemove = results.filter((r) => !r.success);

  if (removed.length > 0) {
    console.debug(
      `[SW] Successfully removed ${removed.length} URLs from the OMRS cache. URLs: `,
      removed.map((r) => r.url),
    );
  }

  if (failedToRemove.length > 0) {
    console.error(
      `[SW] Failed to remove ${failedToRemove.length} URLs from the cache. URLs: `,
      failedToRemove.map((r) => r.url),
    );
  }
}
