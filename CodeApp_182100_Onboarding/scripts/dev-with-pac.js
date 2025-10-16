#!/usr/bin/env node
const { spawn } = require('child_process')
const readline = require('readline')

function startVite() {
  // Start vite in a child process
  const proc = spawn('npx', ['vite'], { stdio: ['ignore', 'pipe', 'pipe'] })
  return proc
}

function startPac(appUrl) {
  // Start pac with port 8081 and provided appUrl
  const args = ['code', 'run', '--port', '8081', '--appUrl', appUrl]
  const proc = spawn('pac', args, { stdio: 'inherit' })
  return proc
}

function findLocalUrlFromLine(line) {
  // Try to match e.g. Local:   http://localhost:3000/
  const m = line.match(/Local:\s+(https?:\/\/[^\s]+)/i)
  if (m) return m[1]
  // sometimes Vite prints: ➜  Local:   http://localhost:3000/
  const m2 = line.match(/https?:\/\/localhost:(\d+)/i)
  if (m2) return `http://localhost:${m2[1]}`
  return null
}

async function main() {
  console.log('Starting Vite...')
  const vite = startVite()

  const rl = readline.createInterface({ input: vite.stdout })

  let appUrl = null
  rl.on('line', (line) => {
    console.log('[vite]', line)
    if (!appUrl) {
      const url = findLocalUrlFromLine(line)
      if (url) {
        appUrl = url
        console.log('Detected Vite local URL:', appUrl)
        // start pac
        pac = startPac(appUrl)
      }
    }
  })

  vite.stderr.on('data', (d) => process.stderr.write(`[vite] ${d}`))

  let pac = null

  function shutdown(code = 0) {
    if (pac && !pac.killed) pac.kill('SIGINT')
    if (vite && !vite.killed) vite.kill('SIGINT')
    process.exit(code)
  }

  process.on('SIGINT', () => shutdown(130))
  process.on('SIGTERM', () => shutdown(0))

  vite.on('close', (code) => {
    console.log('Vite exited with', code)
    shutdown(code)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
