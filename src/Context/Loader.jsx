import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <div
        className="w-32 aspect-square rounded-full relative flex justify-center items-center 
        animate-[spin_3s_linear_infinite] z-40 
        bg-[conic-gradient(white_0deg,white_300deg,transparent_300deg,transparent_360deg)]"
      >
        {/* BEFORE (inner spinning ring) */}
        <div
          className="absolute w-[60%] aspect-square rounded-full z-[80]
          animate-[spin_2s_linear_infinite]
          bg-[conic-gradient(white_0deg,white_270deg,transparent_270deg,transparent_360deg)]"
        ></div>

        {/* AFTER (middle ring) */}
        <div
          className="absolute w-3/4 aspect-square rounded-full z-[60]
          animate-[spin_3s_linear_infinite]
          bg-[conic-gradient(#065f46_0deg,#065f46_180deg,transparent_180deg,transparent_360deg)]"
        ></div>

        {/* CENTER SPAN */}
        <span
          className="absolute w-[85%] aspect-square rounded-full z-[70]
          animate-[spin_5s_linear_infinite]
          bg-[conic-gradient(#34d399_0deg,#34d399_180deg,transparent_180deg,transparent_360deg)]"
        ></span>
      </div>
    </div>
  );
};

export default Loader;