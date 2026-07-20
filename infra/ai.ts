import { cluster } from "./cluster";
import { backendUrl } from "./backend";
import { anthropicApiKey, serviceApiKey } from "./secrets";

const domain = $app.stage === "dev" ? "ai.dev.pearextension.com" : undefined;

export const ai = new sst.aws.Service("Ai", {
  cluster,
  image: { context: ".", dockerfile: "apps/ai/Dockerfile" },
  loadBalancer: {
    rules: [{ listen: "443/https", forward: "3000/http" }],
    domain: domain ? { name: domain } : undefined,
  },
  environment: {
    PORT: "3000",
    ANTHROPIC_API_KEY: anthropicApiKey.value,
    SERVICE_API_KEY: serviceApiKey.value,
    BACKEND_URL: backendUrl,
  },
  dev: { command: "pnpm --filter ai start:dev" },
});
