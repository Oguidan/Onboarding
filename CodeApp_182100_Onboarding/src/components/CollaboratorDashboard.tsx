import { useEffect, useState } from 'react'
import { getUserProcesses, updateProcessStatus } from '../api/client'
import type { UserProcesses, ProcessItem } from '../api/client'
import { initPowerAppsBridge, onPowerAppsContext } from '../powerappsBridge'
import { Card } from '@fluentui/react-components'
import SideNav from './SideNav'
import type { MenuKey } from './SideNav'

function ProcessList({ items, onUpdate }: { items: ProcessItem[]; onUpdate?: (id: string, status: ProcessItem['status']) => Promise<void> }) {
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleChange(id: string, value: ProcessItem['status']) {
    setUpdating(id)
    try {
      if (onUpdate) await onUpdate(id, value)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="process-list">
      {items.map((it) => (
        <Card key={it.id} className="process-card">
          <div className="process-row">
            <div className="process-left">
              <div className="process-title">{it.title}</div>
              <div className="process-sub">{it.dueDate ?? ''}</div>
            </div>
            <div className="process-right">
              <select value={it.status} onChange={(e) => handleChange(it.id, e.target.value as ProcessItem['status'])} disabled={updating === it.id}>
                <option value="NotStarted">Not Started</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: it.status === 'Completed' ? '100%' : it.status === 'InProgress' ? '50%' : '4%' }} />
          </div>
        </Card>
      ))}
    </div>
  )
}

function KPI({ items, active, onClick }: { items: ProcessItem[]; active?: ProcessItem['status'] | null; onClick?: (status: ProcessItem['status'] | null) => void }) {
  const counts = items.reduce(
    (acc, cur) => {
      acc[cur.status] = (acc[cur.status] || 0) + 1
      return acc
    },
    { NotStarted: 0, InProgress: 0, Completed: 0 } as Record<string, number>,
  )

  const total = counts.InProgress + counts.NotStarted + counts.Completed

  return (
    <div>
      <div className="controls-row">
        {onClick && (
          <button className="btn-clear" onClick={() => onClick(null)} hidden={!active}>
            Clear filter
          </button>
        )}
      </div>
      <div className="kpi-row">
        <div className={`kpi-card total-card`}>
          <div className="kpi-number">{total}</div>
          <div className="kpi-label">Total</div>
        </div>
        <div className={`kpi-card ${active === 'InProgress' ? 'active' : ''}`} onClick={() => onClick && onClick('InProgress')}>
          <div className="kpi-number">{counts.InProgress}</div>
          <div className="kpi-label">In Progress</div>
        </div>
        <div className={`kpi-card ${active === 'NotStarted' ? 'active' : ''}`} onClick={() => onClick && onClick('NotStarted')}>
          <div className="kpi-number">{counts.NotStarted}</div>
          <div className="kpi-label">Not Started</div>
        </div>
        <div className={`kpi-card ${active === 'Completed' ? 'active' : ''}`} onClick={() => onClick && onClick('Completed')}>
          <div className="kpi-number">{counts.Completed}</div>
          <div className="kpi-label">Completed</div>
        </div>
      </div>
    </div>
  )
}

export default function CollaboratorDashboard() {
  const [context, setContext] = useState<Record<string, unknown> | null>(null)
  const [processes, setProcesses] = useState<UserProcesses | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<MenuKey>('onboarding')
  const [selectedFilter, setSelectedFilter] = useState<ProcessItem['status'] | null>(null)

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
        {loading && <div>Loading...</div>}
        {!loading && processes && (
          <div>
            {selected === 'onboarding' && (
              <div>
                <h3>Onboarding</h3>
                <KPI items={processes.onboarding} active={selectedFilter} onClick={(s) => setSelectedFilter(s)} />
                <ProcessList
                  items={selectedFilter ? processes.onboarding.filter((p) => p.status === selectedFilter) : processes.onboarding}
                  onUpdate={async (id, status) => {
                    // optimistic update
                    setProcesses((prev) => {
                      if (!prev) return prev
                      const copy: UserProcesses = { ...prev, onboarding: prev.onboarding.map((p) => (p.id === id ? { ...p, status } : p)) }
                      return copy
                    })
                    try {
                      await updateProcessStatus(processes.userId, id, status)
                      } catch {
                      // on error, refetch to ensure consistency
                      const data = await getUserProcesses(undefined, processes.userId)
                      setProcesses(data)
                    }
                  }}
                />
              </div>
            )}
            {selected === 'offboarding' && (
              <div>
                <h3>Offboarding</h3>
                <KPI items={processes.offboarding} active={selectedFilter} onClick={(s) => setSelectedFilter(s)} />
                <ProcessList
                  items={selectedFilter ? processes.offboarding.filter((p) => p.status === selectedFilter) : processes.offboarding}
                  onUpdate={async (id, status) => {
                    setProcesses((prev) => {
                      if (!prev) return prev
                      const copy: UserProcesses = { ...prev, offboarding: prev.offboarding.map((p) => (p.id === id ? { ...p, status } : p)) }
                      return copy
                    })
                    try {
                      await updateProcessStatus(processes.userId, id, status)
                      } catch {
                      const data = await getUserProcesses(undefined, processes.userId)
                      setProcesses(data)
                    }
                  }}
                />
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
