import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ["buffer", "events", "stream", "util"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        sidepanel: path.resolve(__dirname, "index.html"),
        content: path.resolve(__dirname, "src/lib/content.ts"),
        background: path.resolve(__dirname, "src/lib/background.ts"),
        // jumia: path.resolve(
        //   __dirname,
        //   "src/lib/payment-processor/adapters/jumia.ts"
        // ),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "tanstack-vendor": [
            "@tanstack/react-router",
            "@tanstack/react-router-devtools",
            "@tanstack/react-query",
          ],
          "web3-vendor": ["@metamask/providers", "viem", "wagmi"],
        },
      },
      onwarn(warning, warn) {
        if (
          warning.message.includes(
            "contains an annotation that Rollup cannot interpret"
          ) &&
          warning.loc?.file?.includes("ox/_esm/")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});
