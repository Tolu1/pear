import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client.ts',
    'src/memory/index.ts',
    'src/actions/index.ts',
    'src/connectors/index.ts',
    'src/transport/index.ts',
    'src/web/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  target: 'es2023',
});
