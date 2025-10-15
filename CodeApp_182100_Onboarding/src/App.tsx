import './App.css'
import CollaboratorDashboard from './components/CollaboratorDashboard'
import Header from './components/Header'

function App() {
  return (
    <div>
      <Header />
      <main id="root">
        <CollaboratorDashboard />
      </main>
    </div>
  )
}

export default App
