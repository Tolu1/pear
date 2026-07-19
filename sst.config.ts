/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "pear",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: { aws: { region: "eu-central-1" } },
    };
  },
  async run() {
    await import("./infra/secrets");
    await import("./infra/vpc");
    await import("./infra/ai");
    await import("./infra/downloads");
  },
});
