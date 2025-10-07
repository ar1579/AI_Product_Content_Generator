import type { Plugin } from "vite";

type Options = Record<string, unknown> | undefined;

// Try to dynamically import the official plugin entrypoint if it exists.
// Some package releases don't export a `/vite` subpath, so the wrapper
// falls back to a no-op plugin. This keeps the repo working across
// different package versions.
export default function shopify(options?: Options): Plugin {
  try {
    // Use require so this can work both in CJS and ESM tooling environments.
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const mod = require("@shopify/shopify-app-express/vite");
    // Prefer default export if available
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const plugin = mod && (mod.default ?? mod);
    if (typeof plugin === "function") return plugin(options) as Plugin;
  } catch (err) {
    // swallow - we'll return a no-op plugin below
  }

  // Minimal no-op plugin as a safe fallback (keeps Vite happy).
  return {
    name: "shopify-app-express-vite-fallback",
  } as Plugin;
}
