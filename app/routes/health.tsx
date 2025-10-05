import type { LoaderFunction } from "react-router"
import db from "../db.server"

export const loader: LoaderFunction = async () => {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    
    // Check if OpenAI API key is set
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY
    
    // Check if Shopify credentials are set
    const hasShopifyKey = !!process.env.SHOPIFY_API_KEY
    const hasShopifySecret = !!process.env.SHOPIFY_API_SECRET
    
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: "connected",
        openai: hasOpenAIKey ? "configured" : "missing",
        shopify: hasShopifyKey && hasShopifySecret ? "configured" : "missing",
      }
    }
    
    // Return 503 if critical services are not configured
    if (!hasOpenAIKey || !hasShopifyKey || !hasShopifySecret) {
      return new Response(JSON.stringify(health), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }
    
    return new Response(JSON.stringify(health), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    const errorHealth = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      checks: {
        database: "disconnected",
      }
    }
    
    return new Response(JSON.stringify(errorHealth), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}