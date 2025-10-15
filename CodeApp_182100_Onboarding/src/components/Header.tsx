import { Badge, FluentProvider, teamsLightTheme } from '@fluentui/react-components'

export default function Header() {
  return (
    <FluentProvider theme={teamsLightTheme}>
      <header className="app-header">
        <div className="brand">
          <img src="/vite.svg" alt="logo" />
          <div>
            <div className="brand-title">AGL Collaborator Portal</div>
            <div className="brand-sub">Onboarding & Offboarding</div>
          </div>
        </div>
        <div className="header-right">
          <Badge appearance="ghost">Demo</Badge>
        </div>
      </header>
    </FluentProvider>
  )
}
