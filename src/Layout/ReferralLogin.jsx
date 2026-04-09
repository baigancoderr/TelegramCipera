import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ReferralLogin = () => {
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!referral.trim()) {
      toast.error("Please enter referral code");
      return;
    }

    setLoading(true);
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        toast.error("Please open this app inside Telegram");
        return;
      }

      const user = tg.initDataUnsafe?.user;
      if (!user) {
        toast.error("Telegram user data not found");
        return;
      }

      tg.ready();

      const res = await api.post("/user/telegram-login", {
        telegramId: user.id,
        name: `${user.first_name} ${user.last_name || ""}`.trim(),
        username: user.username || "",
        referralCode: referral.trim(),
      });

      const data = res.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("referral", referral.trim());

        toast.success("Account created successfully! 🎉");
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Invalid referral code");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            disabled={loading || !referral.trim()}
            className="w-full bg-gradient-to-r from-[#587FFF] to-[#09239F] py-4 rounded-xl font-semibold text-lg disabled:opacity-70"
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralLogin;