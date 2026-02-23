import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerOrder from './pages/CustomerOrder'
import KitchenDisplay from './pages/KitchenDisplay'
import TableLanding from './pages/TableLanding'
import Login from './pages/Login'
import CustomerMenu from './pages/CustomerMenu'
import CustomerTableLanding from './pages/CustomerTableLanding'
import AboutBusiness from './pages/AboutBusiness'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/table" element={<TableLanding />} />
      <Route path="/customer-tables" element={<CustomerTableLanding />} />
      <Route path="/order/:tableId" element={<CustomerOrder />} />
      <Route path="/menu" element={<CustomerMenu />} />
      <Route path="/about" element={<AboutBusiness />} />
      <Route path="/login" element={<Login />} />
      <Route path="/kitchen" element={<KitchenDisplay />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App