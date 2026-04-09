import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Users,
  Coins,
  BarChart3,
  Copy,
  Share2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";

import api from "../api/axios";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler);

const HomeDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [apiUser, setApiUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("1D");

  // Fetch User Dashboard Data (No login again)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Session expired. Please login again.");
          window.location.replace("/login");
          return;
        }

        // Optional: Get Telegram user for display
        const tg = window.Telegram?.WebApp;
        if (tg) {
          tg.ready();
        }

        // 🔥 Fetch dashboard data
        const res = await api.get("/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        if (data.success) {
          setApiUser(data.user);
          setDashboardData(data.dashboard || data); // adjust according to your API response
          
          // Update localStorage with latest user info
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          toast.error(data.message || "Failed to load dashboard");
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to load data. Please try again.");
        
        // Optional: Logout if token is invalid
        if (error.response?.status === 401) {
          localStorage.clear();
          window.location.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Dynamic Referral Link
  const referralLink = `https://t.me/cipera_bot?startapp=${apiUser?.referralCode || "loading..."}`;

  const handleShare = () => {
    const text = "Join and earn with CIPERA 🚀";
    const url = referralLink;

    if (window.Telegram?.WebApp) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else if (navigator.share) {
      navigator.share({ title: "Join Now", text, url });
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied! ✅");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Fallback stats if API data not loaded yet
  const stats = dashboardData?.stats || [
    { title: "LIVE PRICE", value: "$0.12", icon: <TrendingUp size={18} /> },
    { title: "TOTAL DEPOSIT", value: "$0", icon: <DollarSign size={18} /> },
    { title: "WALLET BALANCE", value: "$0", icon: <Wallet size={18} /> },
    { title: "TOTAL CLAIMED", value: "0 CIP", icon: <Coins size={18} /> },
    { title: "MATURED TOKEN", value: "0 CIP", icon: <BarChart3 size={18} /> },
    { title: "TEAM", value: "0 Users", icon: <Users size={18} /> },
  ];

  // Chart Data (Static for now - you can make it dynamic later)
  const chartDataset = {
    "1D": [20, 40, 30, 60, 50, 70, 55],
    "1W": [100, 200, 150, 300, 250, 400, 350],
    "1M": [500, 700, 600, 900, 800, 1100, 1000],
    "1Y": [2000, 3000, 2500, 4000, 3500, 5000, 4500],
  };

  const labelsMap = {
    "1D": ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM", "12AM"],
    "1W": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "1M": ["W1", "W2", "W3", "W4"],
    "1Y": ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
  };

  const chartData = {
    labels: labelsMap[activeFilter] || labelsMap["1D"],
    datasets: [
      {
        data: chartDataset[activeFilter] || chartDataset["1D"],
        borderColor: "#587FFF",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, "rgba(88,127,255,0.5)");
          gradient.addColorStop(1, "rgba(88,127,255,0)");
          return gradient;
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#888" }, grid: { display: false } },
      y: { ticks: { color: "#888" }, grid: { color: "#1f1f2e" } },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-3 py-3">
      <div className="max-w-md mx-auto space-y-5">

        {/* HEADER */}
        <div className="flex items-center justify-between border border-[#444385] rounded-2xl px-4 py-3">
          <div>
            <p className="text-xs text-gray-400">User ID</p>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-[#587FFF] bg-clip-text text-transparent">
              {apiUser?.userId || apiUser?._id || "Loading..."}
            </h2>
          </div>

          <div
            onClick={() => navigate("/settings")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#587FFF] to-[#09239F] cursor-pointer active:scale-95 transition"
          >
            <User size={18} />
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((item, i) => (
            <div key={i} className="group rounded-2xl border-2 border-[#444385] overflow-hidden">
              <div className="bg-[#00000033] p-3 backdrop-blur-[20px] transition-all duration-300 group-hover:bg-[linear-gradient(180deg,#020204,#2C6096)]">
                <div className="flex justify-between">
                  <p className="text-gray-400 text-xs">{item.title}</p>
                  <div className="text-blue-400">{item.icon}</div>
                </div>
                <p className="text-white text-md font-semibold mt-1">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CHART SECTION */}
        <div className="rounded-2xl border-2 border-[#444385] overflow-hidden">
          <div className="bg-[#00000033] p-4 backdrop-blur-[20px]">
            <p className="text-gray-300 text-sm mb-3">Investment Overview</p>
            <Line data={chartData} options={chartOptions} />

            <div className="flex justify-between mt-4">
              {["1D", "1W", "1M", "1Y"].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveFilter(item)}
                  className={`text-xs px-3 py-1 rounded-full transition ${
                    activeFilter === item
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* REFERRAL SECTION */}
        <div className="rounded-2xl border-2 border-[#444385] overflow-hidden">
          <div className="bg-[#00000033] p-4 backdrop-blur-[20px]">
            <p className="text-sm text-gray-300 mb-2">Referral Link</p>
            <div className="bg-black border border-[#81ECFF] rounded-lg p-3 text-xs mb-3 break-all">
              {referralLink}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 bg-gradient-to-r from-[#587FFF] to-[#09239F] py-3 rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition"
              >
                <Copy size={16} />
                Copy
              </button>

              <button
                onClick={handleShare}
                className="flex-1 bg-gradient-to-r from-[#587FFF] to-[#09239F] py-3 rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS - You can later replace with real data from dashboardData */}
        <div className="rounded-2xl border-2 border-[#444385] overflow-hidden">
          <div className="bg-[#00000033] p-4 backdrop-blur-[20px]">
            <p className="text-sm text-gray-300 mb-3">Recent Buy</p>
            {/* Add real transactions from dashboardData.transactions if available */}
            <p className="text-gray-500 text-center py-6">No recent transactions yet</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeDashboard;