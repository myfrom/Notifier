import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'demo/imports.js',
  output: {
    file: 'docs/bundle.js',
    format: 'iife'
  },
  plugins: [
    resolve()
  ]
}