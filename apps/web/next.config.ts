import type { NextConfig } from "next";

const PEAR_BETA_ZIP = "/downloads/pear-extension-v0.1.0-beta.zip";
const PEAR_AI_PLAYGROUND_BETA_ZIP =
  "https://pear-extension-downloads.s3.eu-central-1.amazonaws.com/pear-ai-playground-v0.1.0-beta.zip";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/download/pear/beta",
        destination: PEAR_BETA_ZIP,
        permanent: false,
      },
      {
        source: "/download/pear-ai-playground/beta",
        destination: PEAR_AI_PLAYGROUND_BETA_ZIP,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
