#!/usr/bin/env node
// Push mock tasks to Dataverse Web API using either an ACCESS_TOKEN env var
// or client credentials (CLIENT_ID, CLIENT_SECRET, TENANT_ID and DATAVERSE_URL).
// Usage:
//  - Dry run (default): node scripts/push-to-dataverse.js
//  - Push: node scripts/push-to-dataverse.js --push
//  - Provide userId to source mock data: node scripts/push-to-dataverse.js someUserId --push

import fetch from 'node-fetch'
import { getUserProcesses } from '../src/api/client.js'

const args = process.argv.slice(2)
const userId = args.find((a) => !a.startsWith('-')) || 'unknown'
const doPush = args.includes('--push')

const DATAVERSE_URL = process.env.DATAVERSE_URL || process.env.ENV_URL // e.g. https://yourorg.api.crm.dynamics.com
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const TENANT_ID = process.env.TENANT_ID

async function obtainToken() {
  if (ACCESS_TOKEN) return ACCESS_TOKEN
  if (!(CLIENT_ID && CLIENT_SECRET && TENANT_ID && DATAVERSE_URL)) {
    throw new Error('Missing credentials: set ACCESS_TOKEN or CLIENT_ID,CLIENT_SECRET,TENANT_ID and DATAVERSE_URL')
  }
  // Acquire token via client credentials for Azure AD v2 endpoint
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
  const params = new URLSearchParams()
  params.append('client_id', CLIENT_ID)
  params.append('client_secret', CLIENT_SECRET)
  params.append('scope', `${DATAVERSE_URL}/.default`)
  params.append('grant_type', 'client_credentials')

  const res = await fetch(tokenUrl, { method: 'POST', body: params })
  if (!res.ok) {
    const t = await res.text()
    throw new Error('Failed to obtain token: ' + res.status + ' ' + t)
  }
  const json = await res.json()
  return json.access_token
}

function mapItemToEntity(item, kind) {
  // map from mock ProcessItem to dataverse entity fields
  return {
    agl_c_182100_task: item.title,
    agl_c_182100_processname: kind === 'onboarding' ? 'Onboarding' : 'Offboarding',
    agl_c_182100_processtype: kind,
    agl_c_182100_taskprogress: item.status === 'Completed' ? 'Completed' : item.status === 'InProgress' ? 'InProgress' : 'NotStarted',
    agl_c_182100_tasktemplatename: item.template ?? (kind === 'onboarding' ? 'Default Onboard' : 'Default Offboard'),
    agl_c_182100_adminname: item.adminName ?? 'system',
    agl_c_182100_managername: item.managerName ?? 'manager',
    createdon: item.createdOn ?? new Date().toISOString(),
    owneridname: item.ownerName ?? 'owner',
    statecode: 'Active'
  }
}

async function push() {
  const data = await getUserProcesses(undefined, userId)
  const entities = []
  for (const it of data.onboarding) entities.push({ entity: mapItemToEntity(it, 'onboarding'), id: it.id })
  for (const it of data.offboarding) entities.push({ entity: mapItemToEntity(it, 'offboarding'), id: it.id })

  console.log('Prepared', entities.length, 'entities')
  if (!doPush) {
    console.log('Dry run mode — no requests sent. Use --push to actually create records in Dataverse.')
    return
  }

  const token = await obtainToken()
  const baseUrl = DATAVERSE_URL
  if (!baseUrl) throw new Error('DATAVERSE_URL is required as environment variable')
  const entitySet = 'agl_t_182100_tasks'

  for (const e of entities) {
    const url = `${baseUrl}/api/data/v9.2/${entitySet}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json'
      },
      body: JSON.stringify(e.entity)
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('Failed to create', e.id, res.status, body)
    } else {
      const loc = res.headers.get('odata-entityid') || 'created'
      console.log('Created', e.id, loc)
    }
  }
}

push().catch((err) => { console.error(err); process.exit(2) })
