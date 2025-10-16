#!/usr/bin/env node
// Print the mock dataset inline so this script can run without importing TS source.
const args = process.argv.slice(2)
const userId = args[0] || 'unknown'

function makeMock(userId) {
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

const data = makeMock(userId)
console.log('User:', data.userId)
console.log('\nOnboarding:')
console.table(data.onboarding.map((i) => ({ id: i.id, title: i.title, status: i.status, dueDate: i.dueDate ?? '' })))
console.log('\nOffboarding:')
console.table(data.offboarding.map((i) => ({ id: i.id, title: i.title, status: i.status })))
process.exit(0)
