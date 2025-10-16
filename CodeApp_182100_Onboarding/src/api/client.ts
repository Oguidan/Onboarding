export type ProcessItem = {
  id: string
  title: string
  status: 'NotStarted' | 'InProgress' | 'Completed'
  assignedTo?: string
  dueDate?: string
}

export type UserProcesses = {
  userId: string
  onboarding: ProcessItem[]
  offboarding: ProcessItem[]
}
// In-memory mock store for demo purposes
const store: Record<string, UserProcesses> = {}

function makeMock(userId?: string): UserProcesses {
  return {
    userId: userId || 'unknown',
    onboarding: [
      { id: 'on-1', title: 'Submit Documents', status: 'Completed', dueDate: '2025-10-01' },
      { id: 'on-2', title: 'Setup Laptop', status: 'InProgress', dueDate: '2025-10-05' },
      { id: 'on-3', title: 'Orientation Session', status: 'NotStarted', dueDate: '2025-10-07' },
      { id: 'on-4', title: 'Complete HR Forms', status: 'NotStarted', dueDate: '2025-10-09' },
    ],
    offboarding: [
      { id: 'off-1', title: 'Return Assets', status: 'NotStarted' },
      { id: 'off-2', title: 'Exit Interview', status: 'NotStarted' },
      { id: 'off-3', title: 'Revoke Access', status: 'NotStarted' },
    ],
  }
}

// Always return mocked data for demo/local use. No Dataverse calls.
export async function getUserProcesses(_baseUrl: string | undefined, userId: string | undefined): Promise<UserProcesses> {
  const id = userId || 'unknown'
  if (!store[id]) store[id] = makeMock(id)
  // small simulated latency
  return new Promise((r) => setTimeout(() => r(store[id]), 200))
}

export async function updateProcessStatus(userId: string | undefined, processId: string, newStatus: ProcessItem['status']): Promise<ProcessItem | null> {
  const id = userId || 'unknown'
  const data = store[id]
  if (!data) return null
  const all = [...data.onboarding, ...data.offboarding]
  const p = all.find((x) => x.id === processId)
  if (!p) return null
  p.status = newStatus
  // simulate latency
  return new Promise((r) => setTimeout(() => r(p), 150))
}
