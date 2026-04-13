function BalanceDisplay() {
  return (
    <div className="flex cursor-pointer flex-col items-center justify-center rounded-[16px] bg-[#FFF2B3] px-12 py-4 font-mono shadow-[0_1px_1.5px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white px-0.5 py-0.25">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="17"
            viewBox="0 0 13 17"
            fill="none"
          >
            <path
              d="M6.50754 0L5.12841 2.53956L10.107 11.9855L6.06808 16.9999C6.06808 16.9999 9.24272 16.9791 9.22388 16.9999C9.20504 17.0208 13 12.277 13 12.277L6.50754 0ZM4.69649 3.47612L0 12.3187L3.70076 16.9999H5.09261L7.12739 14.378H4.86652L2.87319 11.9234L6.06667 5.91034L4.69649 3.47612Z"
              fill="#04183D"
            />
          </svg>
        </div>
        <h2 className="text-[24px] leading-[31px] font-semibold tracking-[-0.06em]">
          ETH
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.79289 9.79289C8.18342 9.40237 8.81658 9.40237 9.20711 9.79289L12.5 13.0858L15.7929 9.79289C16.1834 9.40237 16.8166 9.40237 17.2071 9.79289C17.5976 10.1834 17.5976 10.8166 17.2071 11.2071L13.2071 15.2071C13.0196 15.3946 12.7652 15.5 12.5 15.5C12.2348 15.5 11.9804 15.3946 11.7929 15.2071L7.79289 11.2071C7.40237 10.8166 7.40237 10.1834 7.79289 9.79289Z"
            fill="#0E140E"
          />
        </svg>
      </div>
      <p className="text-[10px] leading-[13px] font-medium tracking-[-0.06em] opacity-[0.68]">
        Balance:
        <span className="font-bold"> 1.7803 </span>• Tap to change
      </p>
    </div>
  );
}

export default BalanceDisplay;
