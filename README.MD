# 🧩 Mini JavaScript/TypeScript Bundler

## Overview

This project is a **minimal JavaScript/TypeScript bundler** built from scratch. Its purpose is to demonstrate how modern build tools (like Webpack, Vite, or esbuild) work under the hood—specifically how they:

- Traverse dependency graphs
- Transform source code
- Bundle multiple modules into a single executable file

Instead of relying on large ecosystems, this project uses **SWC** for parsing and transforming code, while implementing the rest of the bundling logic manually.

---

## 🎯 Goals

The primary goals of this project are:

### 1. Learn how bundlers work internally

Understand the core mechanics behind:

- Dependency resolution
- AST parsing
- Module transformation
- Runtime execution

### 2. Build a dependency graph

Starting from an entry file, recursively discover and map all imported modules.

### 3. Transpile TypeScript → JavaScript

Use SWC to convert modern TypeScript into runnable JavaScript.

### 4. Bundle into a single file

Combine all modules into one output file (`dist/bundle.js`) that can run independently in Node.js.

### 5. Implement a simple module system

Recreate a minimal version of `require()` with:

- Module caching
- Dependency execution
- Export handling

---

## 🏗️ Project Structure

```
.
├── src/
│   ├── graph.ts      # Builds dependency graph
│   ├── bundler.ts    # Converts graph → bundled string
│   └── index.ts      # Your app entry point (example code)
├── index.ts          # Build script (runs the bundler)
├── dist/
│   └── bundle.js     # Output bundle (generated)
├── tsconfig.json
└── package.json
```

---

## ⚙️ How It Works

### 1. Entry Point

The process starts from:

```ts
bundle('./src/index.ts');
```

This file is treated as the root of the application.

---

### 2. Dependency Graph Creation (`graph.ts`)

- Reads each file from disk
- Parses it using SWC
- Extracts `import` statements
- Resolves relative paths
- Recursively visits dependencies

Each module is stored as:

```ts
{
  filename: string;
  dependencies: string[];
  code: string;
}
```

---

### 3. Code Transformation

SWC is used to:

- Parse TypeScript
- Convert it to JavaScript
- Output CommonJS modules

---

### 4. Bundling (`bundler.ts`)

The graph is transformed into a structure like:

```js
{
  "/abs/path/file1.ts": function(require, exports) { ... },
  "/abs/path/file2.ts": function(require, exports) { ... }
}
```

Then wrapped in a runtime:

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

---

### 5. Output

The final result is written to:

```
dist/bundle.js
```

This file contains:

- All modules
- A runtime loader
- Your app entry execution

---

## 🚀 Usage

### Install dependencies

```bash
npm install
```

### Build the bundle

```bash
npm run build
```

### Run the bundled output

```bash
node dist/bundle.js
```

---

## 🧠 Key Concepts Demonstrated

- Abstract Syntax Trees (AST)
- Static analysis of imports
- Recursive graph traversal
- Code transformation pipelines
- Module systems (CommonJS-style)
- Runtime execution environments

---

## ⚠️ Limitations

This is a **learning-focused bundler**, so it intentionally skips many real-world features:

- No support for:
  - Node modules (`node_modules`)
  - Dynamic imports
  - CSS/assets
  - Tree shaking
  - Code splitting

- Naive file resolution (`.ts` assumed)
- No circular dependency handling safeguards
- No source maps

---

## 🌱 Future Improvements

If you want to extend this project:

- Add support for `.js`, `.tsx`, and `.jsx`
- Implement better module resolution (Node-style)
- Handle circular dependencies gracefully
- Add source maps
- Support ES modules output
- Introduce plugins/loaders
- Build a watch mode for incremental builds

---

## 💡 Why This Matters

Modern tooling can feel like a black box. Building a bundler yourself:

- Demystifies tools like Webpack/Vite
- Strengthens understanding of JavaScript execution
- Improves debugging intuition
- Makes you a stronger frontend engineer

---

## 🧪 Example

**src/index.ts**

```ts
import { message } from './message';

console.log(message);
```

**src/message.ts**

```ts
export const message = 'Hello from the bundler!';
```

After bundling:

```bash
node dist/bundle.js
```

Output:

```
Hello from the bundler!
```

---

## 🏁 Summary

This project is a **from-scratch bundler** that:

- Starts from an entry file
- Builds a dependency graph
- Transpiles code with SWC
- Outputs a single executable bundle

It’s intentionally simple—but that’s the point. Every line exists to help you understand what bigger tools are doing behind the scenes.

---

If you want, next step we can level this up into something **Vite-like with dev server + HMR**, which is where things get really fun.
