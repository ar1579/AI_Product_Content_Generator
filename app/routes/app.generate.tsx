"use client"

import { type ActionFunction, type LoaderFunction, redirect } from "react-router"
import { useLoaderData, useNavigate } from "react-router"
import { authenticate } from "../shopify.server"
import { generateOptimizedContent, analyzeProductImages, type ShopifyProduct } from "../utils/openai.server"
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Divider,
  Badge,
  Box,
  DataTable,
} from "@shopify/polaris"
import { useState } from "react"

interface OptimizedContent {
  title: string
  productDescription: string
  keyFeatures: Array<{ feature: string; benefit: string }>
  whyBuy: string[]
  faqs: Array<{ question: string; answer: string }>
  imageRecommendations: string[]
  shortTailKeywords: string[]
  longTailKeywords: string[]
  shopifyTags: string[]
  metaTitle: string
  metaDescription: string
  metafields: Array<{ namespace: string; key: string; type: string; value: string }>
}

interface LoaderData {
  content: OptimizedContent
  originalProduct: {
    title: string
    description: string
  }
}

const contentCache = new Map<
  string,
  { content: OptimizedContent; originalProduct: { title: string; description: string } }
>()

// Helper function to extract image URLs from HTML description
function extractImagesFromHTML(html: string): string[] {
  if (!html) return []

  const imageUrls: string[] = []

  // Match <img> tags and extract src attributes
  const imgTagRegex = /<img[^>]+src=["']([^"']+)["']/gi
  let match

  while ((match = imgTagRegex.exec(html)) !== null) {
    const url = match[1]
    // Only include valid HTTP/HTTPS URLs
    if (url.startsWith("http://") || url.startsWith("https://")) {
      imageUrls.push(url)
    }
  }

  return imageUrls
}

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request)
  const formData = await request.formData()
  const productId = formData.get("productId") as string
  const selectedVariant = formData.get("selectedVariant") as string | null

  const response = await admin.graphql(
    `#graphql
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          descriptionHtml
          vendor
          productType
          tags
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                title
                price
                sku
              }
            }
          }
        }
      }
    `,
    { variables: { id: productId } },
  )

  const data = await response.json()
  const productNode = data.data.product

  interface ImageEdge {
    node: {
      url: string
      altText: string | null
    }
  }

  interface VariantEdge {
    node: {
      title: string | null
      price: string
      sku: string | null
    }
  }

  const product: ShopifyProduct = {
    id: productNode.id,
    title: productNode.title,
    description: productNode.description || "",
    vendor: productNode.vendor || "",
    productType: productNode.productType || "",
    tags: productNode.tags || [],
    images: productNode.images.edges.map((img: ImageEdge) => ({
      src: img.node.url,
      alt: img.node.altText || undefined,
    })),
    variants: productNode.variants.edges.map((v: VariantEdge) => ({
      title: v.node.title || undefined,
      price: v.node.price,
      sku: v.node.sku || undefined,
    })),
  }

  // Collect all image URLs from both sources
  let allImageUrls: string[] = []

  // 1. Get images from product Images section
  const productImageUrls = product.images.map((img) => img.src)

  // 2. Extract images from description HTML
  const descriptionImageUrls = extractImagesFromHTML(productNode.descriptionHtml || "")

  // 3. Combine and deduplicate
  allImageUrls = [...new Set([...productImageUrls, ...descriptionImageUrls])]

  console.log(`[v0] Found ${productImageUrls.length} images in Images section`)
  console.log(`[v0] Found ${descriptionImageUrls.length} images in description HTML`)
  console.log(`[v0] Total unique images to analyze: ${allImageUrls.length}`)

  // Analyze all images (up to 10 total)
  let imageAnalysis = ""
  if (allImageUrls.length > 0) {
    imageAnalysis = await analyzeProductImages(allImageUrls.slice(0, 10))
  }

  const optimizedContent = await generateOptimizedContent(product, imageAnalysis, selectedVariant || undefined)

  contentCache.set(productId, {
    content: optimizedContent,
    originalProduct: {
      title: product.title,
      description: product.description,
    },
  })

  // Use Remix redirect instead of raw HTTP redirect to maintain App Bridge context
  return redirect(`/app/generate?productId=${encodeURIComponent(productId)}`)
}

export const loader: LoaderFunction = async ({ request }) => {
  await authenticate.admin(request)

  const url = new URL(request.url)
  const productId = url.searchParams.get("productId")

  if (!productId || !contentCache.has(productId)) {
    // Use Remix redirect here too
    return redirect("/app")
  }

  const cached = contentCache.get(productId)!

  return {
    content: cached.content,
    originalProduct: cached.originalProduct,
  }
}

export default function Generate() {
  const { content, originalProduct } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const keyFeaturesRows = content.keyFeatures.map((item) => [item.feature, item.benefit])

  const metafieldsRows = content.metafields.map((item) => [item.namespace, item.key, item.type, item.value])

  return (
    <Page title="Generated SEO Content" backAction={{ content: "Products", onAction: () => navigate("/app") }}>
      <Layout>
        {/* Original Product */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Original Product
              </Text>
              <Box>
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {originalProduct.title}
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {originalProduct.description || "No description"}
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Optimized Title */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Optimized Title
                </Text>
                <Button onClick={() => copyToClipboard(content.title, "title")} variant="plain">
                  {copiedField === "title" ? "Copied!" : "Copy"}
                </Button>
              </InlineStack>
              <Text as="p" variant="bodyLg" fontWeight="semibold">
                {content.title}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Combined Product Description with All Sections */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Complete Product Description
                </Text>
                <Button
                  onClick={() => copyToClipboard(content.productDescription, "fullDescription")}
                  variant="primary"
                >
                  {copiedField === "fullDescription" ? "Copied!" : "Copy All"}
                </Button>
              </InlineStack>
              <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", fontFamily: "monospace" }}>
                  {content.productDescription}
                </div>
              </Box>
              <Text as="p" variant="bodySm" tone="subdued">
                This includes: Opening description, Key Features & Benefits, Why You Should Buy, and FAQs - ready to
                paste into Shopify!
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Reference: Key Features & Benefits Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Reference: Key Features & Benefits
              </Text>
              <DataTable
                columnContentTypes={["text", "text"]}
                headings={["Feature", "Benefit"]}
                rows={keyFeaturesRows}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Image Recommendations */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Image Recommendations
              </Text>
              <BlockStack gap="200">
                {content.imageRecommendations.map((rec, index) => (
                  <Text as="p" variant="bodyMd" key={index}>
                    {index + 1}. {rec}
                  </Text>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* SEO Keywords */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                SEO Keywords
              </Text>

              <BlockStack gap="300">
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Short-Tail Keywords
                  </Text>
                  <Box paddingBlockStart="200">
                    <InlineStack gap="200" wrap>
                      {content.shortTailKeywords.map((keyword, index) => (
                        <Badge key={index}>{keyword}</Badge>
                      ))}
                    </InlineStack>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Long-Tail Keywords
                  </Text>
                  <Box paddingBlockStart="200">
                    <InlineStack gap="200" wrap>
                      {content.longTailKeywords.map((keyword, index) => (
                        <Badge key={index} tone="info">
                          {keyword}
                        </Badge>
                      ))}
                    </InlineStack>
                  </Box>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Shopify Product Tags */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Shopify Product Tags
                </Text>
                <Button onClick={() => copyToClipboard(content.shopifyTags.join(", "), "tags")} variant="plain">
                  {copiedField === "tags" ? "Copied!" : "Copy"}
                </Button>
              </InlineStack>
              <InlineStack gap="200" wrap>
                {content.shopifyTags.map((tag, index) => (
                  <Badge key={index} tone="success">
                    {tag}
                  </Badge>
                ))}
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* SEO Meta Information */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                SEO Meta Information
              </Text>
              <Divider />
              <BlockStack gap="300">
                <Box>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Meta Title
                    </Text>
                    <Button onClick={() => copyToClipboard(content.metaTitle, "metaTitle")} variant="plain" size="slim">
                      {copiedField === "metaTitle" ? "Copied!" : "Copy"}
                    </Button>
                  </InlineStack>
                  <Text as="p" variant="bodyMd">
                    {content.metaTitle}
                  </Text>
                </Box>
                <Box>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Meta Description
                    </Text>
                    <Button
                      onClick={() => copyToClipboard(content.metaDescription, "metaDesc")}
                      variant="plain"
                      size="slim"
                    >
                      {copiedField === "metaDesc" ? "Copied!" : "Copy"}
                    </Button>
                  </InlineStack>
                  <Text as="p" variant="bodyMd">
                    {content.metaDescription}
                  </Text>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Custom Metafields */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Custom Metafields
              </Text>
              <DataTable
                columnContentTypes={["text", "text", "text", "text"]}
                headings={["Namespace", "Key", "Type", "Value"]}
                rows={metafieldsRows}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
