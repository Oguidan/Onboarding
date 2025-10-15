import { useEffect, useState } from 'react'
import { getUserProcesses } from '../api/client'
import type { UserProcesses, ProcessItem } from '../api/client'
import { initPowerAppsBridge, onPowerAppsContext } from '../powerappsBridge'
import { Card } from '@fluentui/react-components'
import SideNav from './SideNav'
import type { MenuKey } from './SideNav'

function ProcessList({ items }: { items: ProcessItem[] }) {
  return (
    <div className="process-list">
      {items.map((it) => (
        <Card key={it.id} className="process-card">
          <div className="process-row">
            <div className="process-left">
              <div className="process-title">{it.title}</div>
              <div className="process-sub">{it.dueDate ?? ''}</div>
            </div>
            <div className="process-right">{it.status}</div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: it.status === 'Completed' ? '100%' : it.status === 'InProgress' ? '50%' : '4%' }} />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function CollaboratorDashboard() {
  const [context, setContext] = useState<Record<string, unknown> | null>(null)
  const [processes, setProcesses] = useState<UserProcesses | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<MenuKey>('onboarding')

  useEffect(() => {
    initPowerAppsBridge()
    const off = onPowerAppsContext((payload) => setContext(payload))
    return off
  }, [])

  useEffect(() => {
  let userId = context?.userId as string | undefined
  let baseUrl = context?.baseUrl as string | undefined
    if (!userId) {
      // Optionally read from querystring
      const params = new URLSearchParams(window.location.search)
      userId = userId || params.get('userId') || undefined
      baseUrl = baseUrl || params.get('baseUrl') || undefined
    }

    setLoading(true)
    getUserProcesses(baseUrl, userId)
      .then((data) => setProcesses(data))
      .finally(() => setLoading(false))
  }, [context])

  return (
    <div className="dashboard-root">
      <div>
        <SideNav value={selected} onChange={setSelected} />
      </div>
      <div className="dashboard-main">
        <h2>My Onboarding / Offboarding</h2>
        {loading && <div>Loading...</div>}
        {!loading && processes && (
          <div>
            {selected === 'onboarding' && (
              <div>
                <h3>Onboarding</h3>
                <ProcessList items={processes.onboarding} />
              </div>
            )}
            {selected === 'offboarding' && (
              <div>
                <h3>Offboarding</h3>
                <ProcessList items={processes.offboarding} />
              </div>
            )}
            {selected === 'documents' && (
              <div>
                <h3>Documents</h3>
                <p>Document list would appear here (mocked).</p>
              </div>
            )}
          </div>
        )}
        {!loading && !processes && <div>No processes found.</div>}
      </div>
    </div>
  )
}
