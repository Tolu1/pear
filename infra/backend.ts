import { cluster } from "./cluster";
import {
  databaseUrl,
  coingeckoApiKey,
  cardNumber,
  cardExpiry,
  cardCvv,
  cardName,
  serviceApiKey,
  arcRailWalletPrivateKey,
} from "./secrets";

export const backend = new sst.aws.Service("Backend", {
  cluster,
  image: { context: ".", dockerfile: "apps/backend/Dockerfile" },
  serviceRegistry: { port: 3001 },
  environment: {
    PORT: "3001",
    DATABASE_URL: databaseUrl.value,
    COINGECKO_API_KEY: coingeckoApiKey.value,
    CARD_NUMBER: cardNumber.value,
    CARD_EXPIRY: cardExpiry.value,
    CARD_CVV: cardCvv.value,
    CARD_NAME: cardName.value,
    SERVICE_API_KEY: serviceApiKey.value,
    ARC_RAIL_WALLET_PRIVATE_KEY: arcRailWalletPrivateKey.value,
  },
  dev: { command: "pnpm --filter backend start:dev" },
});

export const backendUrl = $dev
  ? "http://localhost:3001/v1"
  : $interpolate`http://${backend.service}:3001/v1`;
