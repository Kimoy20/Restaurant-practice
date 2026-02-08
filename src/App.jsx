import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerOrder from './pages/CustomerOrder'
import KitchenDisplay from './pages/KitchenDisplay'
import TableLanding from './pages/TableLanding'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/table" replace />} />
      <Route path="/table" element={<TableLanding />} />
      <Route path="/order/:tableId" element={<CustomerOrder />} />
      <Route path="/login" element={<Login />} />
      <Route path="/kitchen" element={<KitchenDisplay />} />
      <Route path="*" element={<Navigate to="/table" replace />} />
    </Routes>
  )
}

export default App