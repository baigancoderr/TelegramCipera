import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Copy, Share2 } from "lucide-react";
import userimg2 from "../../../assets/setting/user-img.jpeg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axios";

const Profile = () => {
  const navigate = useNavigate();

  const [tgUser, setTgUser] = useState(null);
  const [apiUser, setApiUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [walletAddress, setWalletAddress] = useState("0xA1b2C3d4E5F6...");
  const [isEditing, setIsEditing] = useState(false);

  // Referral Link
  const referralLink = `https://t.me/cipera_bot?startapp=${apiUser?.referralCode || "loading"}`;

  // ==================== MAIN INIT LOGIC ====================
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
          console.log("Not running inside Telegram WebApp");
          setLoading(false);
          return;
        }

        tg.ready();
        const user = tg.initDataUnsafe?.user;

        if (!user) {
          console.log("No Telegram user found");
          setLoading(false);
          return;
        }

        setTgUser(user);

        // Check if user already exists in localStorage
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
          // ✅ Already logged in → Just load from localStorage
          const parsedUser = JSON.parse(savedUser);
          setApiUser(parsedUser);
          setLoading(false);
          console.log("✅ User loaded from localStorage");
          return;
        }

        // ❌ First time user → Call Telegram Login API
        console.log("🔄 First time user → Calling Telegram Login API");

        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get("ref");
        const refFromTG = tg.initDataUnsafe?.start_param;
        const refFromStorage = localStorage.getItem("referral");

        const referralCode = refFromTG || refFromUrl || refFromStorage;

        if (referralCode) {
          localStorage.setItem("referral", referralCode);
        }

        const res = await api.post("/user/telegram-login", {
          telegramId: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          username: user.username || "",
          referralCode: referralCode || null,
        });

        const data = res.data;

        if (data.success) {
          setApiUser(data.user);

          // Save to localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.user.userId || data.user._id);
          localStorage.setItem("user", JSON.stringify(data.user));

          console.log("✅ New user registered and saved");
          toast.success("Account created successfully!");
        } else {
          toast.error(data.message || "Login failed");
        }
      } catch (error) {
        console.error("Telegram Login Error:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setIsFirstLoad(false);
      }
    };

    initializeUser();
  }, []); // Empty dependency → runs only once when component mounts

  // ==================== COPY & SHARE ====================
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied! 🚀");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = () => {
    const text = "Join Cipera and earn with me 🚀";

    if (window.Telegram?.WebApp) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=${encodeURIComponent(text)}`;
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else if (navigator.share) {
      navigator.share({ title: "Join Now", text, url: referralLink });
    } else {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="text-white">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center pb-24 px-2 py-3 text-white bg-[#0B0F19]">
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
                alt="profile"
              />
              <div>
                <h2 className="text-xl font-bold">
                  {tgUser ? `${tgUser.first_name} ${tgUser.last_name || ""}` : "Guest"}
                </h2>
                <p className="text-xs text-gray-400">
                  {tgUser?.username ? `@${tgUser.username}` : ""}
                </p>
              </div>
            </div>

            {/* IDs */}
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

        {/* WALLET ADDRESS */}
        <div className="rounded-xl border border-[#444B55] p-4 bg-[#00000020] mb-5">
          <p className="text-sm text-gray-300 mb-2">Wallet Address</p>
          <input
            type="text"
            value={walletAddress}
            disabled={!isEditing}
            onChange={(e) => setWalletAddress(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm bg-black border 
              ${isEditing ? "border-[#81ECFF]" : "border-[#444B55]"} 
              text-white outline-none`}
          />

          <div className="flex gap-2 mt-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-[#587FFF] to-[#09239F] py-2 rounded-lg text-sm"
              >
                Edit Address
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    toast.success("Wallet Updated ✅");
                  }}
                  className="flex-1 bg-green-500 py-2 rounded-lg text-sm"
                >
                  Update
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-600 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
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
    </div>
  );
};

export default Profile;