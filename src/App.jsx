import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomerOrder from "./pages/CustomerOrder";
import KitchenDisplay from "./pages/KitchenDisplay";
import TableLanding from "./pages/TableLanding";
import Login from "./pages/Login";
import CustomerMenu from "./pages/CustomerMenu";
import CustomerTableLanding from "./pages/CustomerTableLanding";
import AboutBusiness from "./pages/AboutBusiness";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem("current_user");
    const role = localStorage.getItem("user_role");

    console.log("App auth check:", { currentUser, role });

    if (currentUser && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-island-page flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-orange-300 border-t-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-ocean-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      {isAuthenticated ? (
        <>
          {userRole === "customer" ? (
            <>
              <Route
                path="/customer-tables"
                element={<CustomerTableLanding />}
              />
              <Route path="/order/:tableId" element={<CustomerOrder />} />
              <Route path="/menu" element={<CustomerMenu />} />
              <Route path="/about" element={<AboutBusiness />} />
            </>
          ) : (
            <>
              <Route path="/table" element={<TableLanding />} />
              <Route path="/kitchen" element={<KitchenDisplay />} />
            </>
          )}
        </>
      ) : (
        <>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
