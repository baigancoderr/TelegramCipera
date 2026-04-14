import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Copy, Share2 } from "lucide-react";
import userimg2 from "../../../assets/setting/user-img.jpeg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axios";

// TanStack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States
  const [tgUser, setTgUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [inputReferral, setInputReferral] = useState("");

  // ==================== TANSTACK QUERY - User Profile ====================
  const { 
    data: apiUser, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        throw new Error("Not inside Telegram WebApp");
      }

      tg.ready();

      const user = tg.initDataUnsafe?.user;
      if (!user) {
        throw new Error("Telegram user not found");
      }

      setTgUser(user); // Set Telegram user

      // Get referral code from TG or URL
      const urlParams = new URLSearchParams(window.location.search);
      const refFromUrl = urlParams.get("ref");
      const refFromTG = tg.initDataUnsafe?.start_param;
      const referralCode = refFromTG || refFromUrl || "";

      const res = await api.post("/user/telegram-login", {
        telegramId: user.id,
        name: `${user.first_name} ${user.last_name || ""}`,
        username: user.username || "",
        referralCode: referralCode,
      });

      const data = res.data;

      if (!data.success) {
        if (data.isNewUser || data.message?.toLowerCase().includes("referral")) {
          setShowReferralPopup(true);
        }
        throw new Error(data.message || "Login failed");
      }

      // Save to localStorage on successful login
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.userId || data.user._id);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (referralCode) {
        localStorage.setItem("referral", referralCode);
      }

      return data.user;
    },
    staleTime: 5 * 60 * 1000,     // Data is fresh for 5 minutes → No API call
    gcTime: 10 * 60 * 1000,       // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Auto-fill wallet address when apiUser loads
  useEffect(() => {
    if (apiUser?.walletAddress) {
      setWalletAddress(apiUser.walletAddress);
      setIsSaved(true);
      setIsEditing(false);
    }
  }, [apiUser]);

  // ==================== Wallet Save/Update Mutation ====================
  const saveWalletMutation = useMutation({
    mutationFn: async ({ walletAddress }) => {
      const token = localStorage.getItem("token");
      const isUpdate = !!apiUser?.walletAddress;

      const endpoint = isUpdate ? "/user/update-wallet" : "/user/add-wallet";
      const res = await (isUpdate ? api.put : api.post)(
        endpoint,
        { walletAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.data;
    },
    onSuccess: (data) => {
      const updatedUser = data.user;

      // Update React Query cache
      queryClient.setQueryData(["userProfile"], updatedUser);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setWalletAddress(updatedUser.walletAddress || "");
      setIsSaved(true);
      setIsEditing(false);

      toast.success(data.message || "Wallet updated successfully ✅");
    },
    onError: (err) => {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save wallet ❌");
    },
  });

  const handleSave = () => {
    if (!walletAddress.trim()) {
      toast.error("Enter wallet address ❌");
      return;
    }
    saveWalletMutation.mutate({ walletAddress });
  };

  const handleUpdate = () => {
    setIsEditing(true);
  };

  // ==================== Referral Submit ====================
  const handleReferralSubmit = async () => {
    if (!/^CPR[A-Z0-9]{6}$/.test(inputReferral)) {
      toast.error("Invalid Referral Code ❌");
      return;
    }

    try {
      const tg = window.Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      if (!user) {
        toast.error("Telegram user not found ❌");
        return;
      }

      const res = await api.post("/user/telegram-login", {
        telegramId: user.id,
        name: `${user.first_name} ${user.last_name || ""}`,
        username: user.username || "",
        referralCode: inputReferral,
      });

      const data = res.data;

      if (data.success) {
        // Invalidate cache to refetch updated user
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });

        setShowReferralPopup(false);
        toast.success("Login Success ✅");
      } else {
        toast.error(data.message || "Login failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    }
  };

  // ==================== Referral Link & Actions ====================
  const referralLink = `https://t.me/cipera_bot?startapp=${apiUser?.referralCode || "loading"}`;

  const handleShare = () => {
    const text = "Join and earn 🚀";
    const url = referralLink;

    if (window.Telegram?.WebApp) {
      const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else if (navigator.share) {
      navigator.share({ title: "Join Now 🚀", text, url });
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Copied 🚀");
    } catch {
      toast.error("Copy failed ❌");
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !showReferralPopup) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-400 px-4 text-center">
        Failed to load profile. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center pb-24 px-2 py-3 text-white">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="p-2 rounded-lg bg-[#00000033] border border-[#444385]"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold">User Account</h2>
          </div>

          <div
            onClick={() => navigate("/settings")}
            className="w-10 h-10 flex items-center justify-center rounded-xl 
              bg-gradient-to-r from-[#587FFF] to-[#09239F] 
              shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 transition"
          >
            <User size={18} />
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="relative rounded-2xl border border-[#81ECFF99] p-[1px] mb-5 bg-gradient-to-br from-blue-500/20 to-black/30">
          <div className="rounded-2xl p-4 bg-[#0B0F19]">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={tgUser?.photo_url || userimg2}
                className="w-20 h-20 rounded-full border border-white/20 object-cover"
                alt="User"
              />
              <div>
                <h2 className="text-xl font-bold">
                  {tgUser ? `${tgUser.first_name} ${tgUser.last_name || ""}` : "Guest User"}
                </h2>
                <p className="text-xs text-gray-400">
                  {tgUser?.username ? `@${tgUser.username}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#00000020] p-3 rounded-xl border border-[#444B55]">
                <p className="text-xs text-gray-400">USER ID</p>
                <p className="text-white">{apiUser?.userId || "N/A"}</p>
              </div>
              <div className="bg-[#00000020] p-3 rounded-xl border border-[#444B55]">
                <p className="text-xs text-gray-400">PARENT ID</p>
                <p className="text-white">{apiUser?.referredBy || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* WALLET SECTION */}
        <div className="rounded-xl border border-[#444B55] p-4 bg-[#00000020] mb-5">
          <p className="text-sm text-gray-300 mb-2">Wallet Address</p>

          <input
            type="text"
            value={walletAddress}
            disabled={!isEditing}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter wallet address"
            className={`w-full px-3 py-2 rounded-lg text-sm bg-black border 
              ${isEditing ? "border-[#81ECFF]" : "border-[#444B55]"} 
              text-white mb-3`}
          />

          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saveWalletMutation.isPending}
              className="w-full bg-gradient-to-r from-[#587FFF] to-[#09239F] py-2 rounded-lg text-sm disabled:opacity-70"
            >
              {saveWalletMutation.isPending 
                ? "Saving..." 
                : (apiUser?.walletAddress ? "Update Wallet" : "Save Wallet")}
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="w-full bg-green-500 py-2 rounded-lg text-sm"
            >
              Edit
            </button>
          )}
        </div>

        {/* REFERRAL SECTION */}
        <div className="rounded-xl border border-[#444B55] p-4 bg-[#00000020]">
          <p className="text-sm text-gray-300 mb-2">Referral Link</p>

          <div className="bg-black border border-[#81ECFF] rounded-lg p-2 text-xs mb-3 break-all">
            {referralLink}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 bg-gradient-to-r from-[#587FFF] to-[#09239F] py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Copy size={16} /> Copy
            </button>

            <button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-[#587FFF] to-[#09239F] py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* REFERRAL POPUP */}
      {showReferralPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0B0F19] border border-[#81ECFF] rounded-2xl p-5 w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">Enter Referral Code</h2>

            <div className="flex flex-col items-center mb-3">
              <img
                src={tgUser?.photo_url || userimg2}
                className="w-16 h-16 rounded-full mb-2"
                alt="profile"
              />
              <p className="text-sm">
                {tgUser?.first_name} {tgUser?.last_name}
              </p>
              <p className="text-xs text-gray-400">@{tgUser?.username}</p>
            </div>

            <input
              type="text"
              value={inputReferral}
              onChange={(e) => setInputReferral(e.target.value.toUpperCase())}
              placeholder="Enter CPRXXXXXX"
              className="w-full px-3 py-2 rounded-lg bg-black border border-[#444] text-white mb-3"
            />

            <button
              onClick={handleReferralSubmit}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-[#587FFF] to-[#09239F]"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;