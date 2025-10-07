import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
// eslint-disable-next-line import/no-unresolved
import shopify from "./vite-plugins/shopify";
import tsconfigPaths from "vite-tsconfig-paths";

// 👇 Temporary fix for missing type declarations
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />
// We use a local wrapper plugin at ./vite-plugins/shopify to avoid importing a
// deep subpath that isn't exported from the package distribution. The
// wrapper forwards options to the official package if available.
declare module "@shopify/shopify-app-express";
declare module "@shopify/shopify-app-express/vite";

const {
  SHOPIFY_API_KEY,
  SHOPIFY_APP_URL,
  HOST,
  FRONTEND_PORT,
  PORT,
} = process.env as Record<string, string | undefined>;

export default defineConfig({
  plugins: [
    reactRouter(),
    shopify({
      shopifyApiKey: SHOPIFY_API_KEY ?? "",
      shopifyAppUrl: SHOPIFY_APP_URL ?? HOST ?? "",
      frontendPort: Number(FRONTEND_PORT) || 3000,
      port: Number(PORT) || 3000,
    }),
    tsconfigPaths(),
  ],
  build: {
    ssr: true,
  },
});
