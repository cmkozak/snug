import fs from 'fs';
import path from 'path';
import { parseSync } from '@swc/core';
import { getSyntax } from './utils.js';

export type GraphModule = {
  filePath: string;
  deps: string[];
  content: string;
};

export function parseModule(filePath: string): GraphModule {
  const content = fs.readFileSync(filePath, 'utf-8');
  const syntax = getSyntax(filePath);
  const ast = parseSync(content, {
    syntax,
    jsx: syntax === 'ecmascript',
    tsx: syntax === 'typescript',
  });

  const deps: string[] = [];
  for (const item of ast.body) {
    if (item.type === 'ImportDeclaration') {
      deps.push(item.source.value);
    }
  }

  return { filePath, deps, content };
}

export function buildGraph(entry: string): Map<string, GraphModule> {
  const entryPath = path.resolve(entry);
  const modules = new Map<string, GraphModule>();

  function traverse(filePath: string) {
    if (modules.has(filePath)) return;
    const mod = parseModule(filePath);
    modules.set(filePath, mod);

    for (const dep of mod.deps) {
      const depPath = path.resolve(path.dirname(filePath), dep);
      traverse(depPath);
    }
  }

  traverse(entryPath);
  return modules;
}
