const createSourceDocumentProvider = (baseURI, fetcher = globalThis.fetch, now = Date.now) => {
  const cache = new Map();
  return async (request, signal) => {
    if (signal?.aborted) return undefined;
    let url;
    try {
      const base = request.referencedFrom
        ? new URL(request.referencedFrom, baseURI ?? request.documentUri).href
        : (baseURI ?? request.documentUri);
      url = new URL(request.url, base);
    } catch {
      return undefined;
    }
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    const key = url.href;
    let entry = cache.get(key);
    if (!entry || now() - entry.created > 60000) {
      const promise = Promise.resolve()
        .then(() => fetcher(key, { signal }))
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status} ${key}`);
          return response.text();
        })
        .catch(() => {
          if (cache.get(key)?.promise === promise) cache.delete(key);
          return undefined;
        });
      entry = { promise, created: now() };
      cache.set(key, entry);
    }
    const content = await entry.promise;
    return signal?.aborted ? undefined : content;
  };
};

export default createSourceDocumentProvider;
