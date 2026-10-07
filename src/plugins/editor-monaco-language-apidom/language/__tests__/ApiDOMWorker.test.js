// @vitest-environment node
const mocks = vi.hoisted(() => ({ doValidation: vi.fn(), getLanguageService: vi.fn() }));
vi.mock('@swagger-api/apidom-ls', () => ({
  getLanguageService: mocks.getLanguageService,
  LogLevel: { WARN: 'warn' },
  ReferenceValidationMode: { APIDOM_INDIRECT_EXTERNAL: 'external' },
}));
vi.mock('@swagger-api/apidom-ns-openapi-2', () => ({}));
vi.mock('@swagger-api/apidom-ns-openapi-3-0', () => ({}));

const { ApiDOMWorker } = await import('../ApiDOMWorker.js');
const makeWorker = () => {
  mocks.getLanguageService.mockReturnValue({ doValidation: mocks.doValidation });
  const models = ['first', 'second'].map((name) => ({
    uri: { toString: () => `https://example.com/${name}.yaml` },
    version: 1,
    getValue: () => 'arazzo: 1.1.0',
  }));
  return new ApiDOMWorker(
    { getMirrorModels: () => models },
    { languageId: 'apidom', baseURI: 'https://example.com/' }
  );
};

describe('ApiDOM worker validation isolation', () => {
  test('does not cancel one model when validating another', async () => {
    const worker = makeWorker();
    const pending = [];
    mocks.doValidation.mockImplementation(
      (document, context) =>
        new Promise((resolve) => {
          pending.push({ document, context, resolve });
        })
    );
    const first = worker.doValidation('https://example.com/first.yaml');
    const second = worker.doValidation('https://example.com/second.yaml');
    expect(pending[0].context.signal.aborted).toBe(false);
    expect(pending[0].context.baseURI).toBe('https://example.com/');
    expect(pending[1].context.signal.aborted).toBe(false);
    pending[0].resolve([{ message: 'first' }]);
    pending[1].resolve([{ message: 'second' }]);
    expect(await first).toEqual([{ message: 'first' }]);
    expect(await second).toEqual([{ message: 'second' }]);
  });
  test('aborts an older request only for the same model', async () => {
    const worker = makeWorker();
    const pending = [];
    mocks.doValidation.mockImplementation(
      (document, context) =>
        new Promise((resolve) => {
          pending.push({ document, context, resolve });
        })
    );
    const old = worker.doValidation('https://example.com/first.yaml');
    const current = worker.doValidation('https://example.com/first.yaml');
    expect(pending[0].context.signal.aborted).toBe(true);
    pending[1].resolve([{ message: 'current' }]);
    expect(await current).toEqual([{ message: 'current' }]);
    pending[0].resolve([{ message: 'stale' }]);
    expect(await old).toEqual([{ message: 'current' }]);
  });
  test('installs the worker-owned source provider and base URI', () => {
    makeWorker();
    const context = mocks.getLanguageService.mock.calls[0][0];
    expect(typeof context.sourceDocuments).toBe('function');
    expect(context.referenceOptions.resolve.baseURI).toBe('https://example.com/');
  });
});
