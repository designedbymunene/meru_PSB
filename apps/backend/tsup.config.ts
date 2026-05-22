import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  noExternal: ['@meru/shared'],
  sourcemap: true,
  dts: false,
});
