import { useAccount } from "wagmi";
import { useDetectedPaymentStore } from "@/stores/detected-payment.store";
import { useQuoteStore } from "@/stores/quote.store";
import { formatTokenAmount, getCurrencySymbol } from "@/lib/utils";

function PaymentDetails() {
  const { payment } = useDetectedPaymentStore();
  const { quote } = useQuoteStore();
  const { chain } = useAccount();

  if (!payment) return null;

  const currencySymbol = getCurrencySymbol(payment.currencyCode);

  return (
    <div className="flex flex-col gap-[6.2px] pt-[6.2px]">
      <div className="flex h-[50px] items-center gap-2.5 rounded-[16px] bg-[#FFFFFF]/72 p-2.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
        >
          <g clipPath="url(#clip0_434_693)">
            <rect y="0.199951" width="24" height="24" rx="12" fill="#ACBF9A" />
            <path
              d="M12 23.3428C18.1541 23.3428 23.1429 18.3541 23.1429 12.2C23.1429 6.04596 18.1541 1.05713 12 1.05713C5.84601 1.05713 0.857178 6.04596 0.857178 12.2C0.857178 18.3541 5.84601 23.3428 12 23.3428Z"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.9176 9.1527C14.8172 8.86882 14.6624 8.61064 14.4656 8.3908C14.0471 7.92318 13.4389 7.62891 12.7619 7.62891H10.9927C9.86587 7.62891 8.95239 8.54238 8.95239 9.6692C8.95239 10.628 9.62002 11.4575 10.5567 11.6624L13.2504 12.2516C14.2997 12.4812 15.0476 13.4111 15.0476 14.4852C15.0476 15.7476 14.0243 16.7718 12.7619 16.7718H11.2381C10.2429 16.7718 9.39624 16.1357 9.08246 15.2479"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 7.62848V5.34277"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 19.0569V16.7712"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_434_693">
              <rect y="0.199951" width="24" height="24" rx="12" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <div>
          <p className="text-[10px] leading-[11px] tracking-[-0.06em] text-black/68">
            Payment Amount
          </p>
          <h3 className="font-mono leading-[20px] font-semibold tracking-[-0.06em] text-[#0E140E]">
            {currencySymbol}
            {payment.amount}
          </h3>
        </div>
      </div>
      <div className="flex h-[50px] items-center gap-2.5 rounded-[16px] bg-[#FFFFFF]/72 p-2.5">
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.5"
            y="0.899902"
            width="23"
            height="23"
            rx="11.5"
            stroke="black"
          />
          <path
            d="M7.41411 7.28166C7.03514 7.28166 6.7103 7.58571 6.7103 7.94044C6.7103 8.29517 7.08928 8.6499 7.52239 8.54855C7.68481 9.10598 8.00965 9.61274 8.49691 9.96747L8.71346 10.0688L8.93002 9.91679C9.309 9.61274 9.68798 9.05531 9.8504 8.49788H10.0128C10.3918 8.49788 10.7166 8.19382 10.7166 7.83909C10.7166 7.48436 10.3377 7.23098 9.95868 7.23098C9.52556 7.23098 9.25486 7.53504 9.25486 7.88977C9.25486 8.34585 8.98416 8.95396 8.65933 9.35936C8.33449 9.00463 8.11793 8.4472 8.06379 7.88977C8.11793 7.58571 7.79309 7.28166 7.41411 7.28166Z"
            fill="#E15A1D"
          />
          <path
            d="M16.3472 13.16C14.9937 10.0181 13.0446 9.10598 12.2325 8.80193C12.2867 8.59923 12.2867 8.4472 12.2867 8.19382C12.2867 6.3695 10.6625 4.8999 8.71346 4.8999C6.81857 4.8999 5.30266 6.31882 5.03196 8.14315C4.65299 12.5519 7.73895 14.9844 9.25486 16.0992C10.1211 16.7073 10.5542 17.1634 10.067 17.9236C9.74212 18.329 9.41728 18.9371 9.09244 19.0384C8.22621 19.1904 7.95551 19.6972 7.95551 19.6972H8.71346C9.68798 19.6972 9.95867 19.6465 10.9332 18.1769C11.8536 16.7073 10.3918 15.8965 9.79626 15.4404C8.28035 14.3763 5.46508 12.1972 5.84406 8.2445V8.19382C6.00648 6.67355 7.19755 5.55869 8.7676 5.55869C9.32153 5.55438 9.86432 5.70431 10.327 5.98944C10.7897 6.27456 11.1513 6.682 11.366 7.15997C11.5807 7.63794 11.6388 8.16487 11.5328 8.67379C11.4268 9.18272 11.1616 9.65066 10.7708 10.0181C10.2835 10.5249 9.5797 10.7783 8.82174 10.7783C8.55104 10.7783 8.33449 10.7276 8.11793 10.6769C7.35997 10.4742 7.03514 10.981 7.03514 10.981L6.981 11.0317L7.03514 11.0823C7.52239 11.3864 8.22621 11.5384 8.82174 11.5384C9.79626 11.5384 10.6625 11.2344 11.3122 10.5756C11.637 10.2715 11.9077 9.91679 12.0701 9.56206C12.7198 9.81544 14.4523 10.6263 15.6975 13.4641C16.0223 14.1736 16.293 14.883 16.5637 15.4911C15.5892 15.4911 12.1784 15.3898 10.5001 12.9067C10.067 12.2479 9.36314 12.3999 9.36314 12.3999C11.0956 16.3019 16.0223 16.2006 16.9427 16.2513C17.3758 17.2648 17.7548 18.0756 17.9172 18.5317C17.5382 18.5317 16.7803 18.3796 15.914 17.6702C15.5439 17.3478 15.1096 17.0969 14.6358 16.9317C14.162 16.7665 13.6582 16.6902 13.1529 16.7073L10.9873 19.8999C10.9873 19.8999 12.016 19.8999 12.4491 19.2918L13.6402 17.5181C14.2357 17.5688 14.8312 17.8222 15.4268 18.2783C16.5637 19.1398 17.2675 19.2411 17.9713 19.2411C18.621 19.2918 19 19.0891 19 19.0891C19 19.0891 17.7006 16.2513 16.3472 13.16Z"
            fill="#E15A1D"
          />
        </svg>

        <div>
          <p className="text-[10px] leading-[11px] tracking-[-0.06em] text-black/68">
            Making payment on
          </p>
          <h3 className="leading-[18px] font-semibold tracking-[-0.06em] text-[#0E140E]">
            {payment.merchantDomain}
          </h3>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-[16px] bg-[#FFFFFF]/72 p-2.5 text-xs tracking-[-0.04em] text-[#0E140E]/70">
        {/* TODO: backend needs to return exchangeRate, networkFee, serviceFee on QuoteResponseDto
        <div className="flex h-[15px] justify-between">
          <p>Conversion Rate:</p>
          <p className="font-mono tracking-normal">1 ETH = $3,727.27 EUR</p>
        </div>
        <div className="flex h-[15px] justify-between">
          <p>Network Fee:</p>
          <p className="font-mono tracking-normal">~ $0.341 EUR</p>
        </div>
        <div className="flex h-[15px] justify-between">
          <p>Pear Fee:</p>
          <p className="font-mono tracking-normal">~ $0.076 EUR</p>
        </div>
        <div className="h-[1px] bg-[#D6D58B]" />
        */}
        <div className="flex h-[15px] justify-between font-bold">
          <p>You&rsquo;ll pay</p>
          <p className="font-mono tracking-normal">
            {quote
              ? `${formatTokenAmount(quote.cryptoAmount)} USDC on ${chain?.name}`
              : "—"}
          </p>
        </div>
      </div>
      <p className="text-center text-[10px] leading-[11px] tracking-[-0.06em] text-[#0E140E]/68">
        By clicking pay, you authorize Pear to process this payment
      </p>
    </div>
  );
}

export default PaymentDetails;
