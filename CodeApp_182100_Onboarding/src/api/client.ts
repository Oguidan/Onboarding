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

// Always return mocked data for demo/local use. No Dataverse calls.
export async function getUserProcesses(_baseUrl: string | undefined, userId: string | undefined): Promise<UserProcesses> {
  // Always return fake/mock data for local dev and demo purposes.
  const mock: UserProcesses = {
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

  // small simulated latency
  return new Promise((r) => setTimeout(() => r(mock), 200))
}
