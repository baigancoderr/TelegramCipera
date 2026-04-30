'use client';

import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Wallet, Send, ChevronDown,Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const WithdrawUSDT = () => {
  const navigate = useNavigate();
  // const [loading, setLoading] = useState(false);
  const [referralBalance, setReferralBalance] = useState();
  const [roiBalance, setRoiBalance] = useState();

  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [walletType, setWalletType] = useState("referral");
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");


  const handleCopy = (text) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied ");
};

 const handleWithdraw = () => {
  if (!walletType || !amount || !address) {
    return toast.error("All fields are required ");
  }

  if (amount < 5) {
    return toast.error("Minimum withdrawal is 5 USDC ");
  }
  

  // First request OTP
  requestOtpMutation.mutate();
};

const handleConfirmWithdraw = () => {
  if (!otp || otp.length < 4) {
    return toast.error("Please enter valid OTP");
  }

  if (withdrawMutation.isPending) return;

  withdrawMutation.mutate({ otp });
};

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.walletAddress) {
      setAddress(user.walletAddress);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.wallets) {
      setReferralBalance(user.wallets.referral?.amount || 0);
      setRoiBalance(user.wallets.roi?.amount || 0);
    }

    if (user?.walletAddress) {
      setAddress(user.walletAddress);
    }
  }, []);

  // 🔥 Dummy Data
  // const withdrawHistory = Array.from({ length: 25 }, (_, i) => ({
  //   id: "#W" + (12345 + i),
  //   amount: "$" + (50 + i * 10),
  //   address: "0xA1B2C3D4...XYZ" + i,
  //   date: "12 Mar 2026",
  //   status: i % 2 === 0 ? "Success" : "Pending",
  // }));

 const fetchWithdrawalHistory = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/user/withdrawal-history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data.withdrawals;
};

const fetchUserOverview = async () => {
  const res = await api.get("/user/overview");
  if (res.data.status === "success" || res.data.success) {
    return res.data.data;
  }
  throw new Error(res.data.message || "Failed to load overview");
};

const {
  data: overviewData,
  isLoading: overviewLoading,
} = useQuery({
  queryKey: ["user-overview"],
  queryFn: fetchUserOverview,
  staleTime: 1000 * 60,
  cacheTime: 1000 * 60 * 5,
  refetchOnWindowFocus: true,
});

const {
  data: withdrawHistory = [],
  isLoading: historyLoading,
} = useQuery({
  queryKey: ["withdrawal-history"],
  queryFn: fetchWithdrawalHistory,

  // 🔥 IMPORTANT OPTIONS
  staleTime: 1000 * 60 * 5, 
  cacheTime: 1000 * 60 * 10, 
  refetchOnWindowFocus: false, 
});

const queryClient = useQueryClient();

useEffect(() => {
  if (overviewData?.wallets) {
    setReferralBalance(overviewData.wallets.referral || 0);
    setRoiBalance(overviewData.wallets.roi || 0);
  }

  if (overviewData?.walletAddress) {
    setAddress(overviewData.walletAddress);
  }
}, [overviewData]);

// Request OTP Mutation
const requestOtpMutation = useMutation({
  mutationFn: async () => {
    const token = localStorage.getItem("token");
    const res = await api.post(
      "/user/request-withdrawal-otp",
        {
        walletType,             
        amount: Number(amount), 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },
  onSuccess: (data) => {
    console.log("OTP Response:", data);
    if (data.success || data.status === "success") {
      toast.success(data.message || "OTP sent to your registered email/phone");
      setShowOtpField(true);
    } else {
      toast.error(data.message || "Failed to send OTP");
    }
  },
  onError: (err) => {
    console.log("OTP Error:", err);
    toast.error(err?.response?.data?.message || "Error sending OTP");
  },
});

const withdrawMutation = useMutation({
  mutationFn: async (otpCode) => {
    const token = localStorage.getItem("token");

    const res = await api.post(
      "/user/withdraw",
      {
        amount: Number(amount),
        walletType,
        walletAddress: address,
        otp,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  },

 onSuccess: (data) => {
    console.log("Withdraw Response:", data);
    if (data.success || data.status === "success") {
      toast.success(data.message || "Withdraw Success ✅");
      setAmount("");
      setShowOtpField(false);
      setOtp("");

      // Refresh wallet balances from API
      queryClient.invalidateQueries({ queryKey: ["user-overview"] });
      
      // Also update local state
      if (data.data?.balances) {
        setReferralBalance(data.data.balances.referral);
        setRoiBalance(data.data.balances.roi);

        // UPDATE LOCAL STORAGE
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.wallets.referral.amount = data.data.balances.referral;
          user.wallets.roi.amount = data.data.balances.roi;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      queryClient.invalidateQueries({ queryKey: ["withdrawal-history"] });
    } else {
      toast.error(data.message || "Failed");
    }
  },

  onError: (err) => {
    console.error(err);
    toast.error(err?.response?.data?.message || "API Error ");
  },
});


  // 🔥 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(withdrawHistory.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

      // Mapping
const currentData = withdrawHistory.slice(indexOfFirst, indexOfLast).map((item) => ({
  id: item.transactionHash,
  amount: `${item.amount}`,
  walletType: item.walletType,
  address: item.walletAddress,
  date: new Date(item.createdAt).toLocaleDateString(),
  status: item.status,
}));

  return (
    <div className="min-h-screen flex justify-center px-2 py-3 pb-24 text-white ">
      <div className="w-full max-w-md mx-auto">

        {/* 🔷 HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="p-2 rounded-lg bg-[#00000033] border border-[#444385]"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold">Withdraw</h2>
          </div>

          <div
            onClick={() => navigate("/settings/profile")}
            className="w-10 h-10 flex items-center justify-center rounded-xl 
            bg-gradient-to-r from-[#587FFF] to-[#09239F] 
            shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <User size={18} />
          </div>
        </div>

        {/* 🔥 BALANCE */}
        <div className="grid grid-cols-2 gap-3 mb-5">

          {/* Referral Wallet */}
          <div className="rounded-2xl border border-[#444385] p-4 bg-[#00000033]">
            <div className="flex gap-3 items-center">
              <Wallet size={18} />
              <div>
                <p className="text-xs text-gray-400">Referral Wallet</p>
                <p className="text-lg font-bold">
                ${Number(referralBalance ?? 0).toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          {/* ROI Wallet */}
          <div className="rounded-2xl border border-[#444385] p-4 bg-[#00000033]">
            <div className="flex gap-3 items-center">
              <Wallet size={18} />
              <div>
                <p className="text-xs text-gray-400">ROI Wallet (CIP)</p>
                <p className="text-lg font-bold">
                  {Number(roiBalance ?? 0).toFixed(3)}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 🔥 FORM */}
        <div className="rounded-2xl border border-[#81ECFF66] p-[1px] mb-5
      bg-[linear-gradient(217deg,_rgba(88,127,255,0.4),_rgba(0,7,64,0.2))]">

          <div className="rounded-2xl bg-[#0B0F1A] p-4 space-y-4">

            {/* ✅ Wallet Type */}
            <div>
              <label className="text-xs text-[#81ECFF]">Select Wallet</label>

              <div className="relative mt-1">
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg 
      bg-[#0B0F1A] text-white border border-[#444B55]
      focus:outline-none focus:ring-2 focus:ring-[#587FFF]
      appearance-none"
                >
                  <option className="bg-[#0B0F1A] text-white" value="referral">
                    Referral Wallet
                  </option>
                  <option className="bg-[#0B0F1A] text-white" value="roi">
                    ROI Wallet
                  </option>
                </select>

                {/* 🔽 Custom Arrow */}
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* ✅ Amount */}
            <div>
              <label className="text-xs text-[#81ECFF]">Amount</label>
              <input
                type="number"
                placeholder={walletType === "roi" ? "Enter Token (Min 5 CIP)" : "Enter amount (min 5 USDC)"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg 
            bg-[#00000033] border border-[#444B55] text-white
            focus:outline-none focus:ring-2 focus:ring-[#587FFF]"
              />
            </div>

            {/* ✅ Wallet Address */}
            <div>
              <label className="text-xs text-[#81ECFF]">Wallet Address</label>
              <input
                type="text"
                placeholder="Enter wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg 
            bg-[#00000033] border border-[#444B55] text-white
            focus:outline-none focus:ring-2 focus:ring-[#587FFF]"
              />
            </div>

            {/* ✅ OTP Field - Show after requesting OTP */}
            {showOtpField && (
              <div>
                <label className="text-xs text-[#81ECFF]">Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg 
              bg-[#00000033] border border-[#444B55] text-white
              focus:outline-none focus:ring-2 focus:ring-[#587FFF]"
                />
              </div>
            )}

            {/* ✅ Button */}
            <button
              onClick={showOtpField ? handleConfirmWithdraw : handleWithdraw}
              disabled={withdrawMutation.isPending || requestOtpMutation.isPending}
              className={`w-full py-3 rounded-full
  bg-gradient-to-r from-[#587FFF] to-[#09239F]
  flex items-center justify-center gap-2
  ${withdrawMutation.isPending || requestOtpMutation.isPending ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
  transition`}
            >
              <Send size={16} />
             {withdrawMutation.isPending ? "Processing..." : requestOtpMutation.isPending ? "Sending OTP..." : showOtpField ? "Confirm Withdraw" : "Withdraw Now"}
            </button>

          </div>
        </div>

        {/* 🔥 HISTORY */}
        <div className="space-y-3">

          {/* HEADING */}
          <h2 className="text-lg font-semibold 
          bg-gradient-to-r from-[#587FFF] to-[#09239F] 
          bg-clip-text text-transparent">
            Withdraw History
          </h2>

          {/* TABLE */}
          <div className="rounded-2xl border border-[#81ECFF66] p-[1px]
bg-[linear-gradient(217deg,_rgba(88,127,255,0.4),_rgba(0,7,64,0.2))]">

  <div className="rounded-2xl bg-[#0B0F1A]">

    <div className="overflow-x-auto">

      <table className="min-w-[700px] w-full text-sm">

        {/* HEADER */}
        <thead className="bg-[linear-gradient(90deg,_rgba(88,127,255,0.1),_transparent)] uppercase">
          <tr className="text-gray-400 border-b border-[#1f2430]">
            <th className="px-3 py-3 text-left">S.No</th>
            <th className="px-3 py-3 text-left">Txn ID</th>
            <th className="px-3 py-3 text-left">Amount</th>
            <th className="px-3 py-3 text-left">Address</th>
            <th className="px-3 py-3 text-left">Date</th>
            <th className="px-3 py-3 text-right">Status</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>

          {/* LOADING STATE */}
          {historyLoading ? (
            <tr>
              <td colSpan="6" className="text-center py-5 text-gray-400">
                Loading withdrawal history...
              </td>
            </tr>
          ) : currentData.length > 0 ? (

            currentData.map((item, i) => (
              <tr
                key={item.id || i}
                className="border-b border-[#1f2430]
                hover:bg-[linear-gradient(90deg,_rgba(88,127,255,0.1),_transparent)]"
              >

                {/* S.NO */}
                <td className="px-3 py-3 text-blue-400 font-medium">
                  {indexOfFirst + i + 1}
                </td>

                {/* TXN ID */}
                <td className="px-3 py-3 text-white">
  <div className="flex items-center gap-2">

    {/* Short Hash */}
    <span>
      {item.id ? `${item.id.slice(0, 10)}...` : "-"}
    </span>

    {/* Copy Button */}
    {item.id && (
      <button
        onClick={() => handleCopy(item.id)}
        className="text-gray-400 hover:text-blue-400 transition"
      >
        <Copy size={14} />
      </button>
    )}

  </div>
</td>

                {/* AMOUNT */}
                <td className="px-3 py-3 text-white">
                  {item.walletType === "roi" ? `${item.amount} CIP` : `$${item.amount}`}
                </td>

                {/* ADDRESS */}
                <td className="px-3 py-3 truncate max-w-[120px] text-gray-300">
                  {item.address}
                </td>

                {/* DATE */}
                <td className="px-3 py-3 text-gray-300">
                  {item.date}
                </td>

                {/* STATUS */}
                <td className="px-3 py-3 text-right">
                  {(() => {
                    const normalizedStatus = String(item.status || "").toLowerCase();
                    const isSuccess = normalizedStatus === "success" || normalizedStatus === "completed" || normalizedStatus === "complete";
                    const isPending = normalizedStatus === "pending" || normalizedStatus === "in progress" || normalizedStatus === "processing";
                    const statusClass = isSuccess
                      ? "bg-green-500/20 text-green-300"
                      : isPending
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300";

                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {item.status}
                      </span>
                    );
                  })()}
                </td>

              </tr>
            ))

          ) : (

            /* EMPTY STATE */
            <tr>
              <td colSpan="6" className="text-center py-5 text-gray-400">
                No Withdrawal Records Found
              </td>
            </tr>

          )}

        </tbody>

      </table>

    </div>
  </div>
</div>

          {/* 🔥 PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">

              <p className="text-xs text-gray-400">
                Page <span className="text-white">{currentPage}</span> of {totalPages}
              </p>

              <div className="flex gap-2">

                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">
                  ⏮
                </button>

                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">
                  ←
                </button>

                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">
                  →
                </button>

                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-[#444385] rounded disabled:opacity-40">
                  ⏭
                </button>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default WithdrawUSDT;