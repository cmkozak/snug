import fs from 'fs';
import path from 'path';
import { transformSync } from '@swc/core';
import { buildGraph, type GraphModule } from './graph.js';
import { getSyntax } from './utils.js';

// Rewrite relative import specifiers to absolute paths before transformation
// so that after SWC converts them to require() calls, they match the module map keys.
function resolveImports(content: string, deps: string[], filePath: string): string {
  let result = content;
  for (const dep of deps) {
    const abs = path.resolve(path.dirname(filePath), dep);
    result = result.split(`'${dep}'`).join(`'${abs}'`);
    result = result.split(`"${dep}"`).join(`"${abs}"`);
  }
  return result;
}

function transformModule(content: string, filePath: string): string {
  const syntax = getSyntax(filePath);
  const { code } = transformSync(content, {
    filename: filePath,
    module: { type: 'commonjs' },
    jsc: {
      parser: syntax === 'typescript' ? { syntax, tsx: false } : { syntax, jsx: false },
      target: 'es2020',
    },
  });
  return code;
}

function generateBundle(modules: Map<string, GraphModule>, entry: string): string {
  const entries = Array.from(modules.entries()).map(([filePath, mod]) => {
    const resolved = resolveImports(mod.content, mod.deps, filePath);
    const transformed = transformModule(resolved, filePath);
    return `  ${JSON.stringify(filePath)}: function(require, module, exports) {\n${transformed}}`;
  });

  return `(function(modules) {
  var cache = {};
  function require(id) {
    if (cache[id]) return cache[id].exports;
    var mod = { exports: {} };
    cache[id] = mod;
    modules[id](require, mod, mod.exports);
    return mod.exports;
  }
  require(${JSON.stringify(entry)});
})({
${entries.join(',\n')}
});`;
}

export function bundle(entry: string, output: string = 'out/bundle.js'): void {
  const absoluteEntry = path.resolve(entry);
  const graph = buildGraph(absoluteEntry);
  const code = generateBundle(graph, absoluteEntry);

  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(output, code, 'utf-8');
  console.log(`Bundled ${graph.size} module${graph.size === 1 ? '' : 's'} → ${output}`);
}
