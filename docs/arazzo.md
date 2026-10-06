# Arazzo support

SwaggerEditor edits and previews [Arazzo](https://spec.openapis.org/arazzo/latest.html) workflow
descriptions: versions 1.0.0, 1.0.1 and 1.1.0.

Arazzo support is delivered by two plugins plus the [`arazzo-viewer`](https://github.com/swagger-api/arazzo-viewer)
package, which does the parsing, rendering and language features. SwaggerEditor does not use ApiDOM
for Arazzo editing.

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
  Relative URLs resolve against the editor's base URI. Fetches are subject to browser CORS.
- **Examples.** File > Load Example has six Arazzo samples (Petstore, Pet Coupons, OAuth, BNPL, FAPI PAR and an
  Arazzo 1.1 AsyncAPI sample).

## Plugins

| Plugin | Path | Role |
| --- | --- | --- |
| `EditorPreviewArazzoPlugin` | `plugins/editor-preview-arazzo` | Renders `<arazzo-viewer>`, loads source descriptions, links the cursor and the viewer |
| `EditorMonacoLanguageArazzoPlugin` | `plugins/editor-monaco-language-arazzo` | Registers completion, hover and diagnostics on the `apidom` Monaco language, inert for non-Arazzo content |
| `EditorContentTypePlugin` | `plugins/editor-content-type` | Contains `selectIsContentTypeArazzo` |

Both Arazzo plugins are part of the `monaco` preset; the preview plugin is also part of the `textarea` preset.
To compose them yourself:

```js
import EditorContentTypePlugin from 'swagger-editor/plugins/editor-content-type';
import EditorPreviewArazzoPlugin from 'swagger-editor/plugins/editor-preview-arazzo';
import EditorMonacoLanguageArazzoPlugin from 'swagger-editor/plugins/editor-monaco-language-arazzo';
```

The viewer follows the editor's light theme (`theme="light"`).

## Limitations

- Detection accepts any `1.x.y`, so a future 1.x is treated as Arazzo.
- Source descriptions that are not reachable from the browser (CORS, private networks) are not linked.
- The viewer is linked as a local dependency (`arazzo-viewer`, `file:../arazzo-viewer`) until it is published.

## Tests

Unit tests live in `__tests__` folders next to each plugin (`editor-content-type`, `editor-preview-arazzo`,
`editor-monaco-language-arazzo`, `top-bar`) and run with `npm run test:run`.
