import { readFileSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import typescript from '@rollup/plugin-typescript'

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
  // Maps @tauri-apps/api imports to window.__TAURI__ globals
  // (requires withGlobalTauri: true in tauri.conf.json).
  {
    input: 'guest-js/auto-init.ts',
    output: {
      file: 'src/scripts/init.iife.js',
      format: 'iife',
      globals: {
        '@tauri-apps/api/event': '__TAURI__.event',
        '@tauri-apps/api/webviewWindow': '__TAURI__.webviewWindow'
      }
    },
    plugins: [
      typescript({
        declaration: false
      })
    ],
    external: [
      /^@tauri-apps\/api/
    ]
  }
]
