#!/usr/bin/env node
// Simple CSV exporter that reads mock processes via getUserProcesses
// and outputs a CSV suitable for importing into Dataverse for the
// `agl_t_182100_task` table. This maps a small set of fields from the
// mock objects into the schema expected by the table.

import fs from 'fs'
import path from 'path'
import { getUserProcesses } from '../src/api/client.js'

function escapeCsv(v) {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

async function run() {
  const args = process.argv.slice(2)
  const userId = args[0] || 'unknown'
  const out = args[1] || './agltasks-export.csv'

  const data = await getUserProcesses(undefined, userId)
  const rows = []

  // header: choose a subset of fields expected by the dataverse schema
  const header = [
    'agl_t_182100_taskid',
    'agl_c_182100_task',
    'agl_c_182100_processname',
    'agl_c_182100_processtype',
    'agl_c_182100_taskprogress',
    'agl_c_182100_tasktemplatename',
    'agl_c_182100_adminname',
    'agl_c_182100_managername',
    'createdon',
    'owneridname',
    'statecode'
  ]

  rows.push(header.join(','))

  const now = new Date().toISOString()

  function pushItem(item, kind) {
    const id = item.id
    const title = item.title
    const processName = kind === 'onboarding' ? 'Onboarding' : 'Offboarding'
    const processType = kind
    const progress = item.status === 'Completed' ? 'Completed' : item.status === 'InProgress' ? 'InProgress' : 'NotStarted'
    const templateName = item.template ?? (kind === 'onboarding' ? 'Default Onboard' : 'Default Offboard')
    const admin = item.adminName ?? 'system'
    const manager = item.managerName ?? 'manager'
    const createdOn = item.createdOn ?? now
    const owner = item.ownerName ?? 'owner'
    const state = progress === 'Completed' ? 'Active' : 'Active'

    const row = [
      escapeCsv(id),
      escapeCsv(title),
      escapeCsv(processName),
      escapeCsv(processType),
      escapeCsv(progress),
      escapeCsv(templateName),
      escapeCsv(admin),
      escapeCsv(manager),
      escapeCsv(createdOn),
      escapeCsv(owner),
      escapeCsv(state)
    ]
    rows.push(row.join(','))
  }

  for (const it of data.onboarding) pushItem(it, 'onboarding')
  for (const it of data.offboarding) pushItem(it, 'offboarding')

  fs.writeFileSync(path.resolve(out), rows.join('\n'))
  console.log('Exported', rows.length - 1, 'rows to', out)
}

run().catch((e) => { console.error(e); process.exit(2) })
