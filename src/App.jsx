import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Homepage from "./Pages/Homepage";
import Wallet from "./Pages/Wallet";
import Upgrade from "./Pages/Upgrade";
import Settings from "./Pages/Settings";
import AddFund from "./Pages/AddFund";

import MagicRings from "./Layout/MagicRings";
import Loader from "./Context/Loader"; // 👈 correct path
import { Toaster } from "react-hot-toast";


// 🔥 ROUTE WRAPPER
function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // smooth timing

    return () => clearTimeout(timer);
  }, [location.pathname]); // 👈 IMPORTANT

  return (
    <>
      {/* ✅ LOADER */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
          <Loader />
        </div>
      )}

      {/* ✅ ROUTES */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/invest" element={<Upgrade />} />
        <Route path="/addfund" element={<AddFund />} />

        {/* SETTINGS */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<Settings />} />
        <Route path="/settings/referral" element={<Settings />} />
        <Route path="/settings/referral-earning-history" element={<Settings />} />
        <Route path="/settings/wallet-breakdown" element={<Settings />} />
        <Route path="/settings/deposit-history" element={<Settings />} />
        <Route path="/settings/withdraw-usdt" element={<Settings />} />
        <Route path="/settings/faqs" element={<Settings />} />
        <Route path="/settings/privacy" element={<Settings />} />
        <Route path="/settings/term-condition" element={<Settings />} />
      </Routes>
    </>
  );
}


// 🔥 MAIN APP
function App() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-black/90 -z-[5]">
        <MagicRings
          color="#fc42ff"
          colorTwo="#42fcff"
          ringCount={6}
          speed={0.8}
          opacity={0.8}
          followMouse={true}
          clickBurst={true}
        />
      </div>

      <div className="fixed inset-0 bg-black/90 -z-10"></div>

      {/* ROUTER */}
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <AppWrapper />
      </BrowserRouter>
    </div>
  );
}

export default App;