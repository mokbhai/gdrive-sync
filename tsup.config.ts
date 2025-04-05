import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
    entry: 'src/index.ts',
    compilerOptions: {
      moduleResolution: 'node',
      declaration: true,
      emitDeclarationOnly: true,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  platform: 'node',
  target: 'node16',
  shims: true,
});
