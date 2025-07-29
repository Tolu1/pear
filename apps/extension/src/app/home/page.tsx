import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import type { DetectionResult } from "@/lib/types";

function Page() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [screenshot, setScreenshot] = useState<string>("");

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === "DETECTION_CHANGED") {
        setDetectionResult(message.detectionResult);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const handleDisconnect = () => {
    disconnect();
  };

  const testScreenshot = async () => {
    try {
      const screenshot = await chrome.tabs.captureVisibleTab();
      setScreenshot(screenshot);
    } catch (error) {
      console.error("Screenshot failed:", error);
    }
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

      {/* Test Screenshot */}
      <Button onClick={testScreenshot} variant="outline" className="mb-4">
        Test Screenshot
      </Button>

      {screenshot && (
        <div className="mb-4">
          <p className="text-sm mb-2">Screenshot captured:</p>
          <img
            src={screenshot}
            alt="Screenshot"
            className="max-w-full h-32 object-contain border"
          />
        </div>
      )}

      {/* Debug Detection Result */}
      <div className="mb-4 p-4 bg-gray-100 rounded text-xs">
        <strong>Detection:</strong> {detectionResult?.type || "none"}
        {detectionResult?.paymentData && (
          <div>
            Amount: {detectionResult.paymentData.amount}{" "}
            {detectionResult.paymentData.currency}
          </div>
        )}
      </div>

      {/* Rest of your existing UI logic */}
      {!detectionResult || detectionResult.type === "regular_page" ? (
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
      ) : detectionResult.type === "almost_payment_page" ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 w-full text-center">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">
              Almost There!
            </h2>
            <p className="text-yellow-600">
              Please navigate to the payment page to complete your purchase with
              crypto
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full text-center">
            <h2 className="text-lg font-medium text-green-800 mb-2">
              Payment Page Detected!
            </h2>
            <p className="text-green-600 mb-4">Ready to pay with crypto</p>
            <Button className="mt-4 w-full">Pay with Crypto</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
