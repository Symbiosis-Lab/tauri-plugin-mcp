import { readFileSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'

const pkg = JSON.parse(readFileSync(join(cwd(), 'package.json'), 'utf8'))

export default [
  // Library build (ESM + CJS) for npm consumers
  {
    input: 'guest-js/index.ts',
    output: [
      {
        file: pkg.exports.import,
        format: 'esm'
      },
      {
        file: pkg.exports.require,
        format: 'cjs'
      }
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: `./${pkg.exports.import.split('/')[0]}`
      })
    ],
    external: [
      /^@tauri-apps\/api/,
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]
  },
  // Auto-init IIFE for plugin injection via js_init_script.
  // Bundles @tauri-apps/api so the IIFE is self-contained and works
  // in js_init_script context where window.__TAURI__ may not exist yet.
  // The bundled @tauri-apps/api uses window.__TAURI_INTERNALS__ internally,
  // which IS available when plugin init scripts run.
  {
    input: 'guest-js/auto-init.ts',
    output: {
      file: 'src/scripts/init.iife.js',
      format: 'iife'
    },
    plugins: [
      resolve(),
      typescript({
        declaration: false
      })
    ]
    // No external — @tauri-apps/api is bundled into the IIFE
  }
]
