import { createModule } from './src/bundler.js';

function main() {
  const entry = './example/index.js';
  const mod = createModule(entry);

  console.log('Module: ', mod);
}

main();
