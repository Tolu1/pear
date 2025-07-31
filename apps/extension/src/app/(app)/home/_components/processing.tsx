import LinearProgress from "@mui/material/LinearProgress";

function Processing() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-[20px] leading-[23px] tracking-[-0.06em] text-[#0E140E]">
          Processing Payment
        </h3>
        <p className="w-[220px] text-[12px] leading-[14px] tracking-[-0.06em] text-[#0E140E]/70">
          Your payment is being processed. Please stay on the page while we
          handle everything for you.
        </p>
      </div>
      <div>
        <LinearProgress
          sx={{
            height: "2px",
            backgroundColor: "#FFF2B3",
            "& .MuiLinearProgress-bar": { backgroundColor: "#435A42" },
          }}
        />
      </div>
    </div>
  );
}

export default Processing;
