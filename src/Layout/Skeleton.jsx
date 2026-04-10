import React from "react";

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-500/20 rounded-md ${className}`} />
  );
};

//////////////////////////////
// 🔹 DASHBOARD SKELETON
//////////////////////////////
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen text-white px-3 py-6">
      <div className="max-w-md mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between bg-[#00000033] border border-[#444385] rounded-2xl px-4 py-3">
          <div>
            <Skeleton className="w-16 h-3 mb-2" />
            <Skeleton className="w-28 h-5" />
          </div>
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-[#444385] p-4 rounded-xl">
              <div className="flex justify-between">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-5 h-5" />
              </div>
              <Skeleton className="w-16 h-5 mt-3" />
            </div>
          ))}
        </div>

        {/* CHART */}
        <div className="border border-[#444385] p-4 rounded-xl">
          <Skeleton className="w-32 h-4 mb-4" />
          <Skeleton className="w-full h-40" />
        </div>
      </div>
    </div>
  );
};

//////////////////////////////
// 🔹 REFERRAL SKELETON
//////////////////////////////
export const ReferralSkeleton = () => {
  return (
    <div className="pb-20 py-3 px-3 text-white flex justify-center">
      <div className="w-full max-w-md space-y-5">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-24 h-5" />
          </div>
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-[#444385]">
              <Skeleton className="w-24 h-3 mb-3" />
              <Skeleton className="w-12 h-6 mb-2" />
              <Skeleton className="w-20 h-3" />
            </div>
          ))}
        </div>

        {/* NETWORK TABLE */}
        <div className="border border-[#444385] rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-8 rounded-lg" />
          </div>

          {/* TABLE ROWS */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between mb-3">
              <Skeleton className="w-6 h-3" />
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-10 h-3" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>

        {/* BOTTOM CARD */}
        <div className="rounded-2xl border border-[#444385] p-4">
          <Skeleton className="w-full h-40 rounded-xl mb-4" />
          <Skeleton className="w-40 h-4 mx-auto mb-2" />
          <Skeleton className="w-64 h-3 mx-auto mb-4" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

//////////////////////////////
// 🔹 MAIN EXPORT CONTROLLER
//////////////////////////////
const SkeletonPage = ({ type = "dashboard" }) => {
  switch (type) {
    case "referral":
      return <ReferralSkeleton />;
    case "dashboard":
    default:
      return <DashboardSkeleton />;
  }
};

export default SkeletonPage;