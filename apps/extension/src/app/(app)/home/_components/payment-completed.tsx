import { usePayment } from "@/hooks/use-payment";

function PaymentCompleted() {
  const { payment } = usePayment();

  if (!payment) return null;

  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      <div className="flex flex-col items-center gap-2.5">
        <svg
          width="106"
          height="106"
          viewBox="0 0 106 106"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="4.91504"
            y="4.91504"
            width="96.17"
            height="96.17"
            rx="48.085"
            fill="white"
          />
          <rect
            x="4.91504"
            y="4.91504"
            width="96.17"
            height="96.17"
            rx="48.085"
            stroke="black"
          />
          <rect
            x="5.40015"
            y="5.40015"
            width="95.2"
            height="95.2"
            rx="47.6"
            fill="#6DCE59"
          />
          <rect
            x="5.40015"
            y="5.40015"
            width="95.2"
            height="95.2"
            rx="47.6"
            fill="#0E140E"
            fillOpacity="0.5"
          />
          <path
            d="M53.0002 5.40015C43.5858 5.40015 34.3828 8.19184 26.555 13.4222C18.7272 18.6525 12.6262 26.0866 9.0235 34.7844C5.42077 43.4822 4.47813 53.0529 6.31479 62.2864C8.15144 71.5199 12.6849 80.0014 19.3419 86.6584C25.9989 93.3154 34.4804 97.8488 43.7139 99.6855C52.9474 101.522 62.5181 100.58 71.2159 96.9768C79.9137 93.3741 87.3477 87.273 92.5781 79.4453C97.8085 71.6175 100.6 62.4145 100.6 53.0001C100.6 46.7492 99.3689 40.5595 96.9768 34.7844C94.5847 29.0093 91.0785 23.7619 86.6584 19.3419C82.2384 14.9218 76.991 11.4156 71.2159 9.02348C65.4408 6.63136 59.2511 5.40015 53.0002 5.40015ZM80.0179 44.6083L51.4579 70.7882C50.5537 71.6174 49.3642 72.0654 48.1377 72.0388C46.9112 72.0122 45.7423 71.513 44.8748 70.6454L30.5948 56.3655C30.1402 55.9264 29.7776 55.4011 29.5281 54.8204C29.2787 54.2396 29.1473 53.615 29.1419 52.983C29.1364 52.351 29.2568 51.7242 29.4961 51.1392C29.7355 50.5542 30.0889 50.0227 30.5358 49.5758C30.9828 49.1289 31.5142 48.7754 32.0992 48.5361C32.6842 48.2968 33.311 48.1763 33.943 48.1818C34.5751 48.1873 35.1997 48.3186 35.7804 48.5681C36.3611 48.8176 36.8864 49.1802 37.3255 49.6348L48.383 60.6923L73.5824 37.592C74.5128 36.7386 75.7441 36.2898 77.0055 36.3442C78.2668 36.3987 79.4549 36.952 80.3083 37.8824C81.1617 38.8128 81.6105 40.0441 81.5561 41.3055C81.5016 42.5668 80.9483 43.7549 80.0179 44.6083Z"
            fill="#6DCE59"
          />
        </svg>

        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-[20px] leading-[23px] tracking-[-0.04em] text-[#0E140E]">
            Payment Complete
          </h3>
          <p className="w-[220px] text-[12px] leading-[14px] tracking-[-0.06em] text-[#0E140E]/70">
            Your payment was successful.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[16px] bg-white/72 p-2.5 text-xs tracking-[-0.04em] text-[#0E140E]/70">
        <div className="flex h-[15px] justify-between font-bold">
          <p>Total Paid</p>
          <p className="font-mono tracking-normal">0.00805 ETH</p>
        </div>
        <div className="h-[1px] bg-[#D6D58B]" />
        <div className="flex h-[15px] justify-between">
          <p>EUR Value</p>
          <p className="font-mono tracking-normal">~ {payment.price}</p>
        </div>
      </div>
    </div>
  );
}

export default PaymentCompleted;
