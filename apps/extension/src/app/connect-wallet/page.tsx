import { Button } from "@/components/ui/button";
import { useConnect } from "wagmi";

function ConnectPage() {
  const { connect, connectors } = useConnect();

  const handleConnect = () => {
    const metaMaskConnector = connectors.find((c) =>
      c.name.toLowerCase().includes("metamask")
    );

    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else {
      console.warn("MetaMask connector not found");
    }
  };

  return (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="text-center pt-8">
        <h1 className="text-4xl font-semibold mb-4">Pear</h1>
        <p className="text-xl mb-8">Pay with crypto anywhere online</p>
        <p className="text-gray-600 mb-4">Connect your wallet to continue</p>
      </div>

      <div className="flex justify-center mb-8">
        <Button onClick={handleConnect} size="lg" className="w-full max-w-xs">
          Connect with MetaMask
        </Button>
      </div>
    </div>
  );
}

export default ConnectPage;
