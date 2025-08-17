import fs from 'fs';
import path from 'path';
import { buildGraph } from './graph.js';
import { parseFileSync } from '@swc/core';

export type Module = {
  id: string;
  code: string;
  dependencies: string[];
};

export function createModule(filename: string): Module {
  const absolutePath = path.resolve(filename);
  const source = fs.readFileSync(absolutePath, 'utf-8');

  // parse file to AST
  const ast = parseFileSync(absolutePath, {
    // TODO handle all js file
    syntax: 'typescript',
    // todo handle tsx later
    tsx: false,
  });

  const dependencies: string[] = [];
  for (const item of ast.body) {
    if (item.type === 'ImportDeclaration') {
      dependencies.push(item.source.value);
    }
  }

  return {
    id: absolutePath,
    code: source,
    dependencies,
  };
}
