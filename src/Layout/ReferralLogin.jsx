import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ReferralLogin = () => {
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      try {
        const res = await api.get("/user/check-first-user");
        
        if (res.data.isFirstUser) {
          // Auto create the very first user (no referral needed)
          await createFirstUser();
        } else {
          // Show referral screen for all other new users
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize app");
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Auto create First User
  const createFirstUser = async () => {
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        toast.error("Please open this app inside Telegram");
        return;
      }

      const tgUser = tg.initDataUnsafe?.user;
      if (!tgUser) {
        toast.error("Telegram user data not found");
        return;
      }

      tg.ready();

      const res = await api.post("/user/telegram-login", {
        telegramId: tgUser.id,
        name: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
        username: tgUser.username || "",
        referralCode: "",        // Empty for first user
      });

      const data = res.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success("Welcome! Your account has been created 🎉");
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Failed to create account");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle referral code submission for normal users
  const handleSubmit = async () => {
    if (!referral.trim()) {
      toast.error("Please enter referral code");
      return;
    }

    try {
      const tg = window.Telegram?.WebApp;
      if (!tg) return toast.error("Open inside Telegram");

      const tgUser = tg.initDataUnsafe?.user;
      if (!tgUser) return toast.error("Telegram user not found");

      tg.ready();

      const res = await api.post("/user/telegram-login", {
        telegramId: tgUser.id,
        name: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
        username: tgUser.username || "",
        referralCode: referral.trim(),
      });

      const data = res.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success("Account created successfully! 🎉");
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Invalid referral code");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Creating your account...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 bg-black">
      <div className="w-full max-w-sm rounded-2xl border-2 border-[#444385] overflow-hidden">
        <div className="bg-[#00000033] p-8 backdrop-blur-[20px]">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Enter Referral Code
          </h2>

          <input
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            placeholder="Enter referral code"
            className="w-full bg-black border border-[#81ECFF] rounded-xl px-5 py-4 text-lg focus:outline-none focus:border-blue-400 mb-6"
          />

          <button
            onClick={handleSubmit}
            disabled={!referral.trim()}
            className="w-full bg-gradient-to-r from-[#587FFF] to-[#09239F] py-4 rounded-xl font-semibold text-lg disabled:opacity-70"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralLogin;