import { useState } from 'react'
import LoadingScreen from './pages/LoadingScreen.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tracker from './pages/Tracker.jsx'
import Journal from './pages/Journal.jsx'
import ProDashboard from './pages/ProDashboard.jsx'
import './App.css'

const PAGES = [
  { id: 'loading', label: 'Loading', component: LoadingScreen },
  { id: 'dashboard', label: 'Dashboard', component: Dashboard },
  { id: 'tracker', label: 'Tracker', component: Tracker },
  { id: 'journal', label: 'Journal', component: Journal },
  { id: 'pro', label: 'Pro', component: ProDashboard },
]

function App() {
  const [activePage, setActivePage] = useState('loading')

  const ActiveComponent =
    PAGES.find((page) => page.id === activePage)?.component ?? LoadingScreen

  return (
    <div className="app">
      <nav className="app-nav" aria-label="Main navigation">
        {PAGES.map((page) => (
          <button
            key={page.id}
            type="button"
            className={activePage === page.id ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage(page.id)}
          >
            {page.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activePage === 'loading' ? (
          <LoadingScreen onInitialize={() => setActivePage('dashboard')} />
        ) : activePage === 'dashboard' ? (
          <Dashboard onNavigate={setActivePage} />
        ) : (
          <ActiveComponent />
        )}
      </main>
    </div>
  )
}

export default App
