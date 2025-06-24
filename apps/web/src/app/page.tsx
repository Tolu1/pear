import { Badge } from "@/components/ui/badge";
import Wave from "@/components/wave";
import ProductShowcase from "@/components/product-showcase";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-between rounded-t-[24px] border-x-1 border-t-1 border-black bg-white bg-linear-to-b from-[#BE910B]/20 to-[#FFF8D4]/20 pt-6">
      <div className="flex flex-col items-center gap-12 lg:gap-6">
        <div className="flex flex-col items-center gap-[3px] text-center">
          <h1
            className="font-melody text-[48px] leading-[48px] tracking-[-0.02em] text-[#0E140E] md:text-[90px] md:leading-[90px]"
            style={{ WebkitTextStroke: "0.5px #0E140E" }}
          >
            CRYPTO ACCEPTED EVERYWHERE
          </h1>
          <div className="flex flex-col items-center gap-12 lg:gap-6">
            <h2 className="font-gavelin text-[40px] leading-[40px] tracking-[-0.02em] text-[#0E140E]/70 md:text-[75px] md:leading-[64px]">
              <div className="flex flex-col items-center gap-3 lg:hidden">
                <span>Skip the crypto-to-cash</span>
                <span>dance, pay instantly</span>
              </div>
              <span className="hidden lg:inline">
                Skip the crypto-to-cash dance, pay instantly
              </span>
            </h2>
            <Features />
          </div>
        </div>
        <ProductShowcase />

        <div className="flex w-full flex-col items-center gap-2 px-6">
          <Button size="lg" className="w-full md:w-fit">
            Install Free Extension
          </Button>
          <p className="leading-[18px] tracking-[-0.08em] text-black/50">
            Chrome & Firefox supported
          </p>
        </div>
      </div>
      <div className="pt-24" />
      <Wave />
    </main>
  );
}

function Features() {
  return (
    <ul className="flex w-full flex-col items-center justify-center gap-4 font-mono md:flex-row md:gap-2.5">
      <li className="w-full max-w-[321px] md:w-fit">
        <Badge className="h-10 w-full justify-start gap-1 rounded-[24px] border border-black bg-[#D6D58B] px-4 py-2 [&>svg]:size-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 8H10"
              stroke="#2F4439"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.8333 9H18.2308C16.4465 9 15 10.3431 15 12C15 13.6569 16.4465 15 18.2308 15H20.8333C20.9167 15 20.9583 15 20.9935 14.9979C21.5328 14.965 21.9623 14.5662 21.9977 14.0654C22 14.0327 22 13.994 22 13.9167V10.0833C22 10.006 22 9.96726 21.9977 9.9346C21.9623 9.43384 21.5328 9.03496 20.9935 9.00214C20.9583 9 20.9167 9 20.8333 9Z"
              stroke="#2F4439"
              strokeWidth="2"
            />
            <path
              d="M20.965 9C20.8873 7.1277 20.6366 5.97975 19.8284 5.17157C18.6569 4 16.7712 4 13 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.34315 20 6.22876 20 10 20H13C16.7712 20 18.6569 20 19.8284 18.8284C20.6366 18.0203 20.8873 16.8723 20.965 15"
              stroke="#2F4439"
              strokeWidth="2"
            />
            <path
              d="M17.9912 12H18.0002"
              stroke="#2F4439"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm leading-[16px] font-semibold tracking-[-0.06em] text-[#0E140E]/70">
            Pay direct from your wallet
          </span>
        </Badge>
      </li>
      <span className="hidden text-[32px] leading-[16px] font-medium tracking-[-0.06em] text-[#2F4439] md:block">
        •
      </span>
      <li className="w-full max-w-[321px] md:w-fit">
        <Badge className="h-10 w-full justify-start gap-1 rounded-[24px] border border-black bg-[#D6D58B] px-4 py-2 [&>svg]:size-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5229 4.47715 20 10 20C15.5229 20 20 15.5229 20 10C20 4.47715 15.5229 0 10 0ZM16.3389 5.70312H14.5159C14.3064 4.82371 14.0345 4.01512 13.7118 3.30023C14.3284 3.64305 14.9012 4.07355 15.4138 4.58621C15.7603 4.9327 16.069 5.3068 16.3389 5.70312ZM17.6562 10C17.6562 10.6683 17.5707 11.3233 17.4057 11.9531H14.9044C14.9669 11.3214 15 10.6685 15 10C15 9.33152 14.9669 8.67859 14.9044 8.04688H17.4057C17.5707 8.67668 17.6562 9.33172 17.6562 10ZM10 17.6562C9.79688 17.6562 9.17781 17.257 8.56078 16.0229C8.30519 15.5117 8.08586 14.9294 7.90641 14.2969H12.0936C11.9141 14.9294 11.6948 15.5117 11.4392 16.0229C10.8222 17.257 10.2031 17.6562 10 17.6562ZM7.45363 11.9531C7.38148 11.3185 7.34375 10.6629 7.34375 10C7.34375 9.33707 7.38148 8.68152 7.45363 8.04688H12.5464C12.6185 8.68152 12.6562 9.33707 12.6562 10C12.6562 10.6629 12.6185 11.3185 12.5464 11.9531H7.45363ZM2.34375 10C2.34375 9.33172 2.42934 8.67668 2.5943 8.04688H5.09562C5.03309 8.67859 5 9.33152 5 10C5 10.6685 5.03309 11.3214 5.09562 11.9531H2.5943C2.42934 11.3233 2.34375 10.6683 2.34375 10ZM10 2.34375C10.2031 2.34375 10.8222 2.74301 11.4392 3.97707C11.6948 4.48828 11.9141 5.07059 12.0936 5.70312H7.90641C8.08586 5.07062 8.30516 4.48828 8.56078 3.97707C9.17781 2.74301 9.79688 2.34375 10 2.34375ZM6.28824 3.30023C5.96543 4.01512 5.69363 4.82367 5.48406 5.70312H3.66113C3.93102 5.3068 4.23973 4.9327 4.58621 4.58621C5.09887 4.07355 5.6716 3.64305 6.28824 3.30023ZM3.66113 14.2969H5.48406C5.69363 15.1763 5.96547 15.9849 6.28824 16.6998C5.6716 16.357 5.09883 15.9264 4.58621 15.4138C4.23973 15.0673 3.93098 14.6932 3.66113 14.2969ZM13.7118 16.6998C14.0346 15.9849 14.3064 15.1763 14.5159 14.2969H16.3389C16.069 14.6932 15.7603 15.0673 15.4138 15.4138C14.9011 15.9264 14.3284 16.357 13.7118 16.6998Z"
              fill="#2F4439"
            />
          </svg>
          <span className="text-sm leading-[16px] font-semibold tracking-[-0.06em] text-[#0E140E]/70">
            Works on any website
          </span>
        </Badge>
      </li>
      <span className="hidden text-[32px] leading-[16px] font-medium tracking-[-0.06em] text-[#2F4439] md:block">
        •
      </span>
      <li className="w-full max-w-[321px] md:w-fit">
        <Badge className="h-10 w-full justify-start gap-1 rounded-[24px] border border-black bg-[#D6D58B] px-4 py-2 [&>svg]:size-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M9.5 3C11.9853 3 14 7.02944 14 12M9.5 3C7.01472 3 5 7.02944 5 12C5 16.9706 7.01472 21 9.5 21M9.5 3H15C17.2091 3 19 7.02944 19 12M14 12C14 16.9706 11.9853 21 9.5 21M14 12H19M9.5 21H15C17.2091 21 19 16.9706 19 12M18.3264 17H13.2422M18.3264 7H13.2422M9.5 8C10.3284 8 11 9.79086 11 12C11 14.2091 10.3284 16 9.5 16C8.67157 16 8 14.2091 8 12C8 9.79086 8.67157 8 9.5 8Z"
              stroke="#2F4439"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm leading-[16px] font-semibold tracking-[-0.06em] text-[#0E140E]/70">
            USDC & LSK supported
          </span>
        </Badge>
      </li>
    </ul>
  );
}
