// @vitest-environment node
import createSourceDocumentProvider from '../source-documents.js';

describe('ApiDOM source documents', () => {
  const request = {
    name: 'api',
    url: 'api.json',
    documentUri: 'https://example.com/workflow.yaml',
  };
  const response = (text) => ({ ok: true, text: async () => text });
  test('resolves relative URLs and caches successful responses', async () => {
    const fetcher = vi.fn(async () => response('document'));
    const provider = createSourceDocumentProvider('https://example.com/editor/', fetcher);
    expect(await provider(request)).toBe('document');
    expect(await provider(request)).toBe('document');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('https://example.com/editor/api.json', {
      signal: undefined,
    });
  });
  test('resolves referenced documents relative to their referring source', async () => {
    const fetcher = vi.fn(async () => response('reference'));
    const provider = createSourceDocumentProvider('https://example.com/editor/', fetcher);
    expect(
      await provider({
        ...request,
        url: '../paths.json',
        referencedFrom: 'https://example.com/specs/api.json',
      })
    ).toBe('reference');
    expect(fetcher).toHaveBeenCalledWith('https://example.com/paths.json', { signal: undefined });
  });
  test('retries failures instead of retaining a poisoned cache entry', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(response('recovered'));
    const provider = createSourceDocumentProvider(undefined, fetcher);
    expect(await provider(request)).toBeUndefined();
    expect(await provider(request)).toBe('recovered');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  test('expires successful entries', async () => {
    let time = 0;
    const fetcher = vi.fn(async () => response('document'));
    const provider = createSourceDocumentProvider(undefined, fetcher, () => time);
    await provider(request);
    time = 60001;
    await provider(request);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  test('does not fetch unsupported URLs or aborted requests', async () => {
    const fetcher = vi.fn();
    const provider = createSourceDocumentProvider(undefined, fetcher);
    expect(await provider({ ...request, url: 'file:///etc/passwd' })).toBeUndefined();
    const controller = new AbortController();
    controller.abort();
    expect(await provider(request, controller.signal)).toBeUndefined();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
