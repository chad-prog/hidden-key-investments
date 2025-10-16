import { HashRouter, Route, Routes } from 'react-router'
import Home from './pages/Home'
import SystemTesting from './pages/SystemTesting'
import InvestorDashboard from './pages/InvestorDashboard'
import AccreditedInvestors from './pages/AccreditedInvestors'

/**
 * Main application component with routing
 */
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/system-testing" element={<SystemTesting />} />
        <Route path="/investor-dashboard" element={<InvestorDashboard />} />
        <Route path="/accredited-investors" element={<AccreditedInvestors />} />
      </Routes>
    </HashRouter>
  )
}

export default App