// @vitest-environment node
import parseWithApiDOM from '../parse.js';

describe('ApiDOM preview parsing', () => {
  const data = {
    arazzo: '1.1.0',
    info: { title: 'Parsed with ApiDOM', version: '1' },
    sourceDescriptions: [],
    workflows: [{ workflowId: 'w', steps: [{ stepId: 's', operationId: 'op' }] }],
    'x/a~b': 'value',
  };
  test('should parse JSON through the namespace and preserve source locations', async () => {
    const result = await parseWithApiDOM(JSON.stringify(data));
    expect(result).toEqual({
      ok: true,
      document: data,
      problems: [],
      lines: expect.objectContaining({ '': 1, '/workflows/0/steps/0': 1, '/x~1a~0b': 1 }),
    });
  });
  test('should parse YAML through the namespace and preserve source lines', async () => {
    const result = await parseWithApiDOM(
      'arazzo: 1.1.0\ninfo: {title: Parsed with ApiDOM, version: "1"}\nsourceDescriptions: []\nworkflows:\n  - workflowId: w\n    steps:\n      - stepId: s\n        operationId: op\nx/a~b: value\n'
    );
    expect(result).toEqual({
      ok: true,
      document: data,
      problems: [],
      lines: expect.objectContaining({ '': 1, '/workflows/0/steps/0': 7, '/x~1a~0b': 9 }),
    });
  });
  test('should report invalid syntax instead of rendering a recovered document', async () => {
    const result = await parseWithApiDOM('arazzo: 1.1.0\nworkflows: [unclosed');
    expect(result).toEqual({ ok: false, error: expect.any(String) });
  });
});
