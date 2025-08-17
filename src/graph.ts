import fs from 'fs';
import path from 'path';
import { parseSync } from '@swc/core';

// Parse a single file and return its dependencies
export function parseModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ast = parseSync(content, {
    syntax: 'ecmascript',
    jsx: true,
  });

  const deps = [];
  for (const item of ast.body) {
    if (item.type === 'ImportDeclaration') {
      deps.push(item.source.value);
    }
  }

  return { filePath, deps, content };
}

// Recursively build dependency graph
export function buildGraph(entry) {
  const entryPath = path.resolve(entry);
  const modules = new Map();

  function traverse(filePath) {
    if (modules.has(filePath)) return; // avoid cycles
    const mod = parseModule(filePath);
    modules.set(filePath, mod);

    mod.deps.forEach((dep) => {
      const depPath = path.resolve(path.dirname(filePath), dep);
      traverse(depPath);
    });
  }

  traverse(entryPath);
  return modules;
}
