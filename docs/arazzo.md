# Arazzo support

SwaggerEditor edits and previews [Arazzo](https://spec.openapis.org/arazzo/latest.html) workflow
descriptions: versions 1.0.0, 1.0.1 and 1.1.0.

Arazzo support uses the existing ApiDOM language plugin plus the [`arazzo-viewer`](https://github.com/swagger-api/arazzo-viewer)
package. Preview documents are parsed with the ApiDOM Arazzo JSON/YAML adapters and converted through the optional
`arazzo-viewer/apidom` adapter. The viewer renders the resulting plain data and source lines without reparsing it.
The existing ApiDOM worker is the sole language implementation. The dedicated Arazzo language plugin and the
viewer language service have been removed.

## What you get

- **Content detection.** A document whose top-level `arazzo` key holds a `1.x.y` version is detected as Arazzo
  (YAML or JSON). OpenAPI and AsyncAPI keys take precedence if they sit alongside it. `selectIsContentTypeArazzo`
  reports the result.
- **Preview.** The preview pane renders `<arazzo-viewer>`: workflows, steps, a flow diagram, inputs, outputs,
  reusable components and the operation each step calls.
- **Editor language features.** Completion (YAML and JSON), hover and diagnostics, version aware (a 1.1 field in a
  1.0.x document is reported).
- **Two-way navigation.** Activating a line button in the preview moves the Monaco cursor. Moving the cursor
  reveals the matching workflow, step or component in the preview without taking focus.
- **Source descriptions.** Absolute `http(s)` `sourceDescriptions` URLs are fetched (cached, debounced 500 ms) and
  used to link each step to its OpenAPI, AsyncAPI or Arazzo operation or workflow, and to check `operationId`s.
  Relative URLs resolve against the editor's base URI. Fetches are subject to browser CORS. The worker supplies a
  cached, abort-aware `sourceDocuments` provider to ApiDOM; failed requests are retried rather than cached permanently.
  The preview also receives a base URL and fetcher for external references supported by the viewer.
- **Examples.** File > Load Example has six Arazzo samples (Petstore, Pet Coupons, OAuth, BNPL, FAPI PAR and an
  Arazzo 1.1 AsyncAPI sample).

## Plugins

| Plugin | Path | Role |
| --- | --- | --- |
| `EditorPreviewArazzoPlugin` | `plugins/editor-preview-arazzo` | Renders `<arazzo-viewer>`, loads source descriptions, links the cursor and the viewer |
| `EditorMonacoLanguageApiDOMPlugin` | `plugins/editor-monaco-language-apidom` | Provides completion, hover and diagnostics through the ApiDOM worker, including Arazzo |
| `EditorContentTypePlugin` | `plugins/editor-content-type` | Contains `selectIsContentTypeArazzo` |

The ApiDOM and preview plugins are part of the `monaco` preset; the preview plugin is also part of the `textarea` preset.
To compose them yourself:

```js
import EditorContentTypePlugin from 'swagger-editor/plugins/editor-content-type';
import EditorPreviewArazzoPlugin from 'swagger-editor/plugins/editor-preview-arazzo';
import EditorMonacoLanguageApiDOMPlugin from 'swagger-editor/plugins/editor-monaco-language-apidom';
```

The viewer follows the editor's light theme (`theme="light"`).

## Building Git dependencies

`npm install` (or `npm ci` with an up-to-date lockfile) builds the unpublished Arazzo dependencies
automatically during `prepare`. Git and the upstream projects' Node.js/npm build prerequisites are required.
No sibling checkouts or global `npm link` registrations are needed.

- ApiDOM is fetched from [YOU54F/apidom](https://github.com/YOU54F/apidom/tree/arazzo-support),
  pinned to the revision in `vite/scripts/build-git-dependencies.js`.
- Arazzo Viewer is fetched from [YOU54F/arazzo-viewer](https://github.com/YOU54F/arazzo-viewer/tree/arazzo),
  pinned by its Git dependency in `package.json`.
- Sources and build outputs live in the ignored `.git-dependencies` directory. The built ApiDOM workspace
  packages and viewer are linked into this installation's `node_modules`, not the global npm prefix.

To rebuild them explicitly, run `npm run build:git-deps`. To update a fork, change its pinned commit and
run `npm install` again. Installing with `--ignore-scripts` skips these builds; run `npm run prepare`
before starting or building the editor in that case.

## Limitations

- Detection accepts any `1.x.y`, so a future 1.x is treated as Arazzo.
- Source descriptions that are not reachable from the browser (CORS, private networks) are not linked.
- Preview parsing follows the API Design Systems integration pattern and runs on the main thread. It has stale-result
  protection, but is not yet shared with the Monaco worker's parse cache.
- The viewer still uses its own source-linking helpers for presentation. Diagnostics, runtime-reference completion
  and source-target hover use the shared ApiDOM resolver and target index.
- Relative URLs still use the editor page's base URI, not the original imported document's URL.

## Tests

Unit tests live in `__tests__` folders next to each plugin (`editor-content-type`, `editor-preview-arazzo`,
`editor-monaco-language-apidom`, `top-bar`) and run with `npm run test:run`.
