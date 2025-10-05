/// <reference types="vite/client" />
/// <reference types="@react-router/node" />

interface ImportMetaEnv {
  readonly OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly OPENAI_API_KEY: string
    readonly SHOPIFY_API_KEY: string
    readonly SHOPIFY_API_SECRET: string
  }
}
