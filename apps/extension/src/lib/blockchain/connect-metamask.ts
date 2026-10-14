import { connect, getConnectors } from "wagmi/actions";
import { config } from "./config";

export async function connectMetaMask(): Promise<boolean> {
  const metaMask = getConnectors(config).find((c) =>
    c.name.toLowerCase().includes("metamask"),
  );
  if (!metaMask) return false;

  await connect(config, { connector: metaMask });
  return true;
}
