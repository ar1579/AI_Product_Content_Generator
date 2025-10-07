// types/shopify-vite.d.ts
declare module "@shopify/shopify-app-express" {
  export function shopifyApp(config?: Record<string, unknown>): unknown;
}

declare module "@shopify/shopify-app-express/vite" {
  import { Plugin } from "vite";
  export default function shopify(options?: Record<string, unknown>): Plugin;
}
