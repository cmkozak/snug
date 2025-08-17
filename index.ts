import { bundle } from './src/bundler.js';

const entry = process.argv[2] || './example/index.js';
bundle(entry);
