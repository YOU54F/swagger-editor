import { loadSources } from 'arazzo-viewer';

const cache = new Map();

const fetchText = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};

/**
 * Fetch the OpenAPI documents listed in an Arazzo document's sourceDescriptions.
 * Responses are cached per URL for the page's lifetime, so editing does not refetch.
 */
const loadArazzoSources = (content) => loadSources(content, fetchText, cache);

export default loadArazzoSources;
