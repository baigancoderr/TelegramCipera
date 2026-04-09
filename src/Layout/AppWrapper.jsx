import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ReferralLogin from "./ReferralLogin";
import HomeDashboard from "../Pages/Homepage";        // ← Your HomeDashboard component
import Wallet from "../Pages/Wallet";
import Upgrade from "../Pages/Upgrade";
import Settings from "../Pages/Settings";
import AddFund from "../Pages/AddFund";
import PaymentScreen from "../Components/AddFund/PaymentScreen";
import ReferralTeamTree from "../Components/Settings/Pages/ReferralTeamTree";

function AppWrapper() {
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const token = localStorage.getItem("token");

  // Check authentication once on app load
  useEffect(() => {
    setIsCheckingAuth(false);
  }, []);

  // Protect routes
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If not logged in and not on login page → redirect to login
  if (!token && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  // If logged in and trying to access login page → redirect to home
  if (token && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<ReferralLogin />} />
      <Route path="/" element={<HomeDashboard />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/invest" element={<Upgrade />} />
      <Route path="/addfund" element={<AddFund />} />
      <Route path="/payment" element={<PaymentScreen />} />
      <Route path="/referral-team-tree" element={<ReferralTeamTree />} />

      {/* Settings Routes */}
      <Route path="/settings/*" element={<Settings />} />
    </Routes>
  );
}

export default AppWrapper;