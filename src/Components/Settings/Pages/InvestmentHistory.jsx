import { ArrowLeft, User, Coins, CheckCircle, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../api/axios";

const InvestmentHistory = () => {
  const navigate = useNavigate();

  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({
    totalInvestedAmount: 0,
    totalReturnTokens: 0,
    totalClaimedTokens: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Same pattern as UpgradeHero
  const getTelegramId = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) return tg.initDataUnsafe.user.id;

    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) return savedUserId;

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.userId || user._id || user.id;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    return null;
  };

  const fetchInvestments = async (page = 1) => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      setError("Session expired. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/user/investments`, {
        params: { telegramId, page, limit: 10 },
      });

      const data = res.data;

      if (data.status === "success") {
        setInvestments(data.data.investments);
        setSummary(data.data.summary);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to fetch investments.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Network error. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments(currentPage);
  }, [currentPage]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDaysProgress = (investment) =>
    Math.min(investment.claimedDays || 0, investment.totalDays || 700);

  return (
    <div className="min-h-screen px-3 pb-24 py-3 text-white ">
      <div className="max-w-md mx-auto space-y-5">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="p-2 rounded-lg bg-[#00000033] border border-[#444385]"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold">Investment History</h2>
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

        {/* SUMMARY */}
        <div className="rounded-2xl p-4 border border-[#444385] bg-[#00000033] space-y-3">
          <div>
            <p className="text-gray-400 text-xs">TOTAL INVESTED</p>
            <h2 className="text-2xl font-bold mt-1">
              {summary.totalInvestedAmount.toLocaleString()} USDC
            </h2>
            <p className="text-xs text-gray-400 mt-1">Across all plans</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <div>
              <p className="text-gray-400 text-xs">Total Return Tokens</p>
              <p className="text-emerald-400 font-semibold text-sm mt-0.5">
                {summary.totalReturnTokens.toFixed(4)} CIP
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Claimed Tokens</p>
              <p className="text-cyan-400 font-semibold text-sm mt-0.5">
                {summary.totalClaimedTokens.toFixed(4)} CIP
              </p>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4 border border-[#444385] rounded-lg px-2 py-4 bg-[#00000033]">

          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-[#587FFF] to-[#09239F] bg-clip-text text-transparent">
              Investment History
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
              {pagination.total} Records
            </span>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader size={24} className="text-blue-400 animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-400 text-sm py-6 border border-red-500/20 rounded-xl bg-red-500/5">
              {error}
              <button
                onClick={() => fetchInvestments(currentPage)}
                className="block mx-auto mt-3 text-xs text-blue-400 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && investments.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10">
              No investments found.
            </div>
          )}

          {!loading &&
            investments.map((item) => {
              const isActive = item.status === "active";
              const daysCompleted = getDaysProgress(item);
              const progress = (daysCompleted / (item.totalDays || 700)) * 100;

              return (
                <div
                  key={item._id}
                  className="group rounded-2xl border border-[#444385] overflow-hidden hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div
                    className="bg-[#00000033] p-4 backdrop-blur-[20px]
                    group-hover:bg-[linear-gradient(180deg,#020204,#2C6096)]
                    transition-all duration-300"
                  >
                    {/* TOP */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-xl ${isActive ? "bg-blue-500/10" : "bg-green-500/10"}`}>
                          {isActive ? (
                            <Loader size={16} className="text-blue-400 animate-spin" />
                          ) : (
                            <CheckCircle size={16} className="text-green-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <Coins size={16} className="text-purple-400" />
                            <span className="text-white text-sm font-semibold">
                              {item.amount} USDC
                            </span>
                          </div>
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            {item.tokensReceived?.toFixed(2)} CIP tokens
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-[10px] flex flex-col items-end gap-1">
                        <div className={`flex items-center gap-2 ${isActive ? "" : "flex-col items-end gap-1"}`}>
                          <p className="text-gray-400">{formatTime(item.startDate)}</p>
                          <span className={`px-2 py-1 rounded-full text-[10px] ${
                            isActive
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {isActive ? "Active" : "Completed"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[9px]">{formatDate(item.startDate)}</p>
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-cyan-400 text-sm font-medium">
                        {item.dailyIncomeTokens?.toFixed(4)} CIP / day
                      </p>
                      <p className="text-xs text-gray-400">
                        {daysCompleted} / {item.totalDays} days
                      </p>
                    </div>

                    {/* EXTRA INFO */}
                    <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                      <span>Total Return: <span className="text-emerald-400">{item.totalReturnTokens?.toFixed(4)} CIP</span></span>
                      <span>Ends: {formatDate(item.endDate)}</span>
                    </div>

                    {/* PROGRESS */}
                    <div className="w-full h-2 bg-[#111] rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#587FFF] to-[#09239F]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-5">
            <p className="text-xs text-gray-400">
              Page <span className="text-white">{pagination.page}</span> of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40"
              >⏮</button>
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40"
              >←</button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40"
              >→</button>
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40"
              >⏭</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvestmentHistory;
