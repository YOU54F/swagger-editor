import { detect as detectJSON } from '@swagger-api/apidom-parser-adapter-json';
import { parse as parseJSON } from '@swagger-api/apidom-parser-adapter-arazzo-json-1';
import { parse as parseYAML } from '@swagger-api/apidom-parser-adapter-arazzo-yaml-1';
// eslint-disable-next-line import/no-unresolved
import { fromApiDOM } from 'arazzo-viewer/apidom';

const parseArazzoDocument = async (content) => {
  try {
    const parse = (await detectJSON(content)) ? parseJSON : parseYAML;
    return fromApiDOM(await parse(content, { sourceMap: true }));
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
};

export default parseArazzoDocument;
