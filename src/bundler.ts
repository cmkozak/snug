import { buildGraph } from './graph.js';

export function bundle(entry) {
  const graph = buildGraph(entry);
  console.log('Dependency Graph:');

  graph.forEach((mod, file) => {
    console.log(file, '->', mod.deps);
  });
}
