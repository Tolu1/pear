import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";

function Header() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
  };

  const formattedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "0x12345...67890";

  return (
    <div className="h-[52px] p-6 flex justify-between items-center border-b border-[#0E140E]/80">
      <div className="border-[#2F4439] border flex items-center justify-center h-[22px] p-1 bg-[#FFED9B] rounded-[15px]">
        <p className="text-xs text-[#0E140E]/80">{formattedAddress}</p>
      </div>
      <Button
        size="sm"
        className="bg-red-900 h-[25px] hover:bg-red-800 text-white/95 rounded-full"
        onClick={handleDisconnect}
      >
        Disconnect
      </Button>
    </div>
  );
}

export default Header;
