import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { nodePolyfills } from "vite-plugin-node-polyfills";

function playgroundManifest(isPlayground: boolean) {
  return {
    name: "playground-manifest",
    apply: "build" as const,
    writeBundle() {
      if (!isPlayground) return;
      const manifestPath = path.resolve(__dirname, "dist/manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      manifest.name = "Pear AI";
      manifest.host_permissions = ["<all_urls>"];
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __PLAYGROUND_MODE__: JSON.stringify(mode === "playground"),
  },
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
    playgroundManifest(mode === "playground"),
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
}));
