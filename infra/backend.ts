import { cluster } from "./cluster";
import {
  databaseUrl,
  coingeckoApiKey,
  serviceApiKey,
  arcRailWalletPrivateKey,
} from "./secrets";

const domain = $app.stage === "dev" ? "api.dev.pearextension.com" : undefined;

export const backend = new sst.aws.Service("Backend", {
  cluster,
  image: { context: ".", dockerfile: "apps/backend/Dockerfile" },
  serviceRegistry: { port: 3001 },
  loadBalancer: {
    rules: [{ listen: "443/https", forward: "3001/http" }],
    domain: domain ? { name: domain } : undefined,
    health: { "3001/http": { path: "/health" } },
  },
  environment: {
    PORT: "3001",
    DATABASE_URL: databaseUrl.value,
    COINGECKO_API_KEY: coingeckoApiKey.value,
    SERVICE_API_KEY: serviceApiKey.value,
    ARC_RAIL_WALLET_PRIVATE_KEY: arcRailWalletPrivateKey.value,
  },
  dev: { command: "pnpm --filter backend start:dev" },
});

export const backendUrl = $dev
  ? "http://localhost:3001/v1"
  : $interpolate`http://${backend.service}:3001/v1`;
