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
 * Relative URLs resolve against the editor's base URI, as the editor's dereference does.
 */
const loadArazzoSources = (content) =>
  loadSources(content, fetchText, cache, globalThis.document?.baseURI ?? globalThis.location?.href);

export default loadArazzoSources;
