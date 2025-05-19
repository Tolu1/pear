import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";

function Page() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [checkoutState, setCheckoutState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chrome?.runtime) {
      chrome.runtime.sendMessage({ type: "GET_CHECKOUT_STATE" }, (response) => {
        console.log("Checkout state received:", response?.data);
        if (response?.data?.checkoutState !== undefined) {
          setCheckoutState(response.data.checkoutState);
        }
        setLoading(false);
      });
    } else {
      console.log("Chrome runtime not available - dev mode");
      setLoading(false);
    }
  }, []);

  const handleDisconnect = () => {
    disconnect();
  };

  const formattedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Pear</h1>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-500">Connected Wallet</p>
        <p className="font-medium">{formattedAddress}</p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <p>Loading checkout status...</p>
        </div>
      ) : checkoutState ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full text-center">
            <h2 className="text-lg font-medium text-green-800 mb-2">
              Checkout Detected!
            </h2>
            <p className="text-green-600">
              We've detected you're on a checkout page. Ready to pay with
              crypto?
            </p>
            <Button className="mt-4 w-full">Pay with Crypto</Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <p className="text-lg mb-4">Ready to shop with crypto</p>
          <p className="text-gray-600 mb-6">
            Browse any e-commerce site and Pear will automatically detect
            checkout pages
          </p>

          <p className="text-sm text-gray-500">
            Supports payments with USDC and LSK
          </p>
        </div>
      )}
    </div>
  );
}

export default Page;
