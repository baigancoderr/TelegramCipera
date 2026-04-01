import { CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

const UpgradeHero = () => {
  const [amount, setAmount] = useState("");

  return (
    <div className="w-full flex justify-center px-2">
      <div className="w-full max-w-md space-y-6">

        <div className="rounded-xl p-3 
          
          border border-white/10 shadow-xl bg-[linear-gradient(217.49deg,_rgba(88,127,255,0.5)_1.24%,_rgba(0,7,64,0.245)_20.92%)]">

          <h2 className="text-white text-lg font-semibold mb-3">Investment Plans</h2>

          {/* 2x2 Grid Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="group rounded-2xl border-2 border-[#444385] hover:border-transparent overflow-hidden">
              <div className="bg-[#00000033] p-3 h-full backdrop-blur-[20px] transition-all duration-300 group-hover:bg-[linear-gradient(180deg,_#020204_0%,_#2C6096_100%)] group-hover:border-l-[5px] group-hover:border-l-[#587FFF]">
                <p className="text-gray-400 text-sm">Total Investment</p>
                <p className="text-emerald-400 text-md font-semibold mt-1">10</p>
              </div>
            </div>

            <div className="group rounded-2xl border-2 border-[#444385] hover:border-transparent overflow-hidden">
              <div className="bg-[#00000033] p-3 h-full backdrop-blur-[20px] transition-all duration-300 group-hover:bg-[linear-gradient(180deg,_#020204_0%,_#2C6096_100%)] group-hover:border-l-[5px] group-hover:border-l-[#587FFF]">
                <p className="text-gray-400 text-sm">Wallet Balance</p>
                <p className="text-emerald-400 text-md font-semibold mt-1">10</p>
              </div>
            </div>

            <div className="group rounded-2xl border-2 border-[#444385] hover:border-transparent overflow-hidden">
              <div className="bg-[#00000033] p-3 h-full backdrop-blur-[20px] transition-all duration-300 group-hover:bg-[linear-gradient(180deg,_#020204_0%,_#2C6096_100%)] group-hover:border-l-[5px] group-hover:border-l-[#587FFF]">
                <p className="text-gray-400 text-sm">Total Supply</p>
                <p className="text-emerald-400 text-md font-semibold mt-1">10</p>
              </div>
            </div>

            <div className="group rounded-2xl border-2 border-[#444385] hover:border-transparent overflow-hidden">
              <div className="bg-[#00000033] p-3 h-full backdrop-blur-[20px] transition-all duration-300 group-hover:bg-[linear-gradient(180deg,_#020204_0%,_#2C6096_100%)] group-hover:border-l-[5px] group-hover:border-l-[#587FFF]">
                <p className="text-gray-400 text-sm">Total Burned</p>
                <p className="text-emerald-400 text-md font-semibold mt-1">10</p>
              </div>
            </div>
          </div>

          {/* Deposit Input */}
          <div className="mb-8">
            <label className="text-gray-400 text-sm font-medium mb-2 block">Deposit Amount (CPR)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to deposit"
                className="w-full bg-[linear-gradient(217.49deg,_rgba(88,127,255,0.5)_1.24%,_rgba(0,7,64,0.245)_20.92%)] border border-white/10 focus:border-cyan-400 
                         rounded-md px-6 py-2 text-black text-md placeholder-gray-500 
                         focus:outline-none shadow-inner transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 pl-2">Minimum deposit: 25 CPR</p>
          </div>

          {/* Auto-Desc Upgrade Box */}
          <div className="bg-[linear-gradient(217.49deg,_rgba(88,127,255,0.5)_1.24%,_rgba(0,7,64,0.245)_20.92%)] rounded-xl border  mb-6 shadow-1xl">
            <div className="bg-[linear-gradient(217.49deg,_rgba(88,127,255,0.5)_1.24%,_rgba(0,7,64,0.245)_20.92%)] rounded-[10px] p-3">
              <div className="bg-[linear-gradient(217.49deg,_rgba(88,127,255,0.5)_1.24%,_rgba(0,7,64,0.245)_20.92%)] rounded-xl p-5 border border-blue-400/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold text-md">⚙️ Auto-Desc</p>
                  </div>
                  <div className="text-right">
                    <p className="text-md text-emerald-400 font-semibold">$25</p>
                  </div>
                </div>

                <p className="text-gray-400 text-[15px] mt-5 leading-relaxed">
                  Enable automatic mining that runs 24 hours a day without any manual intervention.
                </p>

                <div className="mt-8 space-y-3">
                  {[...Array(1)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={22} />
                      <span className="text-gray-300 text-sm leading-tight">
                        Permanent auto-mining activation for 24/7 operation
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            className="w-full py-2 bg-[linear-gradient(45deg,_#587FFF_0%,_#09239F_100%)]
                     text-white text-md font-semibold rounded-xl shadow-md 
                     hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            Submit 
            {/* <ArrowRight size={20} /> */}
          </button>

         
        </div>
      </div>
    </div>
  );
};

export default UpgradeHero;