import React, { useState } from "react";
import { ArrowLeft, Users, TrendingUp, User, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";

const ReferralEarningsHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Same pattern as Referral.jsx - using TanStack Query
  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ["referralEarnings", currentPage],
    queryFn: async () => {
      const tg = window.Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id || localStorage.getItem("userId");

      if (!telegramId) {
        throw new Error("No telegram ID found");
      }

      const res = await api.get("/user/referral-income", {
        params: { telegramId, page: currentPage, limit: 10 }
      });

      if (res.data.status === "success" || res.data.success) {
        return res.data.data;
      }
      throw new Error("Failed to fetch");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Default values
  const data = apiData || {
    selfInvestment: 0,
    teamInvestment: 0,
    referralCount: 0,
    totalReferralIncome: 0,
    referrals: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
  };

  // Filter by tab
  const filteredData =
    activeTab === "all"
      ? data.referrals
      : activeTab === "direct"
      ? data.referrals.filter((r) => r.level === 1)
      : data.referrals.filter((r) => r.level > 1);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center px-2 py-3 pb-24 text-white">
        <Loader className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex justify-center items-center px-2 py-3 pb-24 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load referral earnings</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center px-2 py-3 pb-24 text-white">
      <div className="w-full max-w-md mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="p-2 rounded-lg bg-[#00000033] border border-[#444385]"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold">Referral Earnings</h2>
          </div>

          <div
            onClick={() => navigate("/settings/profile")}
            className="w-10 h-10 flex items-center justify-center rounded-xl 
              bg-gradient-to-r from-[#587FFF] to-[#09239F] 
              shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 transition"
          >
            <User size={18} />
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl border border-[#444385] p-3 bg-[#00000033]">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#587FFF33] flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Referral Count</p>
                <p className="text-lg font-bold">
                  {data.referralCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#444385] p-3 bg-[#00000033]">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#587FFF33] flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Earnings</p>
                <p className="text-lg font-bold text-emerald-400">
                  ${Number(data.totalReferralIncome || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="space-y-4 border border-[#444385] rounded-lg px-2 py-4 bg-[#00000033]">

          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold">Referral Earnings</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
              {data.pagination?.total || 0} Records
            </span>
          </div>

          {/* TABS */}
          <div className="flex bg-[#1B2028] border border-[#444B55] rounded-full p-1">
            {["all", "direct", "level"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`flex-1 py-2 text-sm rounded-full transition capitalize ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[#587FFF] to-[#09239F] text-white"
                    : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Empty */}
          {filteredData.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10">
              No referral earnings found.
            </div>
          )}

          {/* TABLE */}
          {filteredData.length > 0 && (
            <div className="rounded-lg border border-[#81ECFF66] p-[1px] bg-[linear-gradient(217deg,_rgba(88,127,255,0.4),_rgba(0,7,64,0.2))]">
              <div className="rounded-lg bg-[#0B0F1A] backdrop-blur-xl overflow-x-auto">
                <table className="min-w-[700px] w-full text-sm">
                  <thead className="bg-[linear-gradient(90deg,_rgba(88,127,255,0.1),_transparent)]">
                    <tr className="text-white border-b border-[#1f2430]">
                      <th className="px-3 py-3 text-left">Sr</th>
                      <th className="px-3 py-3 text-left">User ID</th>
                      <th className="px-3 py-3 text-left">Type</th>
                      <th className="px-3 py-3 text-center">Invested</th>
                      <th className="px-3 py-3 text-center">Commission</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-3 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, i) => (
                      <tr
                        key={item.investmentId || i}
                        className="border-b border-[#1f2430] hover:bg-[linear-gradient(90deg,_rgba(88,127,255,0.1),_transparent)]"
                      >
                        <td className="px-3 py-3 text-blue-400 font-medium">{item.sr}</td>

                        <td className="px-3 py-3 font-mono text-xs">{item.referredId}</td>

                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.level === 1
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-green-500/20 text-green-300"
                          }`}>
                            {item.level === 1 ? "Direct" : `Level ${item.level}`}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center text-white font-medium">
                          ${item.investmentAmount}
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-[#81ECFF]">
                          +${item.commissionAmount}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right text-xs text-gray-400">
                          {formatDate(item.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGINATION */}
          {data.pagination?.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-gray-400">
                Page <span className="text-white">{currentPage}</span> of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">⏮</button>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">←</button>
                <button onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))} disabled={currentPage === data.pagination.totalPages}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">→</button>
                <button onClick={() => setCurrentPage(data.pagination.totalPages)} disabled={currentPage === data.pagination.totalPages}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">⏭</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReferralEarningsHistory;
