# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # tsc compile → run dist/index.js (the build script)
node dist/bundle.js  # run the bundled output after a successful build
```

No test runner is configured. Node v22.14.0 (`.nvmrc`).

## What this project is

A JavaScript/TypeScript bundler built from scratch using SWC for parsing and transformation. The bundler takes an entry file, traverses its dependency graph, transforms each module from TS→JS (CommonJS), and emits a single `dist/bundle.js` with a self-contained runtime loader.

## Target output format

The final `dist/bundle.js` wraps all modules in an IIFE:

```js
(function (modules) {
  const cache = {};
  function require(filename) {
    if (cache[filename]) return cache[filename].exports;
    const module = { exports: {} };
    modules[filename](require, module.exports);
    cache[filename] = module;
    return module.exports;
  }
  require(entry);
})(modules);
```

Where `modules` is a map of absolute file paths to factory functions:
```js
{
  "/abs/path/file.ts": function(require, exports) { /* transformed CJS code */ }
}
```

## Pipeline

```
entry file
  → graph.ts: parseModule() per file, buildGraph() recursively
  → SWC: transform each module TS → CommonJS JS
  → bundler.ts: wrap modules in runtime template → string
  → write to dist/bundle.js
```

## Current state vs intended architecture

**`src/graph.ts`** is the most complete piece — `parseModule()` reads a file, parses with SWC `parseSync`, extracts `ImportDeclaration` nodes to get deps, and `buildGraph()` recursively traverses from entry into a cycle-safe `Map<absolutePath, {filePath, deps, content}>`.

**`src/bundler.ts`** has a `Module` type and `createModule()` but only parses a single entry file — it doesn't call `buildGraph` yet. The transformation step (SWC TS→CJS) and the emit step (writing the IIFE bundle) are not implemented.

**`src/utils.ts`** is empty.

The two parsing paths (`parseModule` in graph.ts and `createModule` in bundler.ts) overlap and should be consolidated.

## SWC usage

- **Parsing** (AST only): `parseSync` / `parseFileSync` from `@swc/core`
- **Transformation** (TS → CJS JS): will use `transform` / `transformSync` from `@swc/core` with `{ module: { type: 'commonjs' } }`
- `graph.ts` uses `syntax: 'ecmascript'`; `bundler.ts` uses `syntax: 'typescript'` — file extension should determine which to use

## Known limitations (intentional)

- No `node_modules` resolution — only relative imports
- `.ts` extension assumed; `.js`, `.tsx`, `.jsx` not yet handled
- No circular dependency safeguards beyond the `Map` cycle check in `buildGraph`
- No source maps, no tree shaking, no code splitting, no CSS/assets, no dynamic imports

## Planned extensions

- Watch mode / HMR (dev server, Vite-like)
- Node-style module resolution
- Support for `.js`, `.tsx`, `.jsx`
- Source maps
- Plugins/loaders
