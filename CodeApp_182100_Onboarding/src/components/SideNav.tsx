// Side navigation for selecting content views

export type MenuKey = 'onboarding' | 'offboarding' | 'documents'

export default function SideNav({ value, onChange }: { value: MenuKey; onChange: (k: MenuKey) => void }) {
  return (
    <nav className="side-nav">
      <div className="menu-group">
        <button className={`menu-item ${value === 'onboarding' ? 'active' : ''}`} onClick={() => onChange('onboarding')}>
          Onboarding
        </button>
        <button className={`menu-item ${value === 'offboarding' ? 'active' : ''}`} onClick={() => onChange('offboarding')}>
          Offboarding
        </button>
        <button className={`menu-item ${value === 'documents' ? 'active' : ''}`} onClick={() => onChange('documents')}>
          Documents
        </button>
      </div>
    </nav>
  )
}
