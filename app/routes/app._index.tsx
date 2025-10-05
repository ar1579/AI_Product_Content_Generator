import { type LoaderFunction } from 'react-router'
import { useLoaderData, useSubmit, useNavigation } from 'react-router'
import { authenticate } from '../shopify.server'
import { useState } from 'react'
import {
  Page,
  Layout,
  Card,
  Button,
  Select,
  Text,
  BlockStack,
  InlineStack,
  Banner,
  Spinner,
  RadioButton,
} from '@shopify/polaris'

interface ProductImage {
  src: string
  alt?: string
}

interface ProductVariant {
  price: string
  sku?: string
  title?: string
}

interface Product {
  id: string
  title: string
  description: string
  vendor: string
  productType: string
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
}

interface LoaderData {
  products: Product[]
}

export const loader: LoaderFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request)

  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
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
        }
      }
    `
  )

  const data = await response.json()
  
  interface GraphQLEdge {
    node: {
      id: string
      title: string
      description: string | null
      vendor: string | null
      productType: string | null
      tags: string[]
      images: {
        edges: Array<{
          node: {
            url: string
            altText: string | null
          }
        }>
      }
      variants: {
        edges: Array<{
          node: {
            title: string | null
            price: string
            sku: string | null
          }
        }>
      }
    }
  }

  const products: Product[] = data.data.products.edges.map((edge: GraphQLEdge) => ({
    id: edge.node.id,
    title: edge.node.title,
    description: edge.node.description || '',
    vendor: edge.node.vendor || '',
    productType: edge.node.productType || '',
    tags: edge.node.tags || [],
    images: edge.node.images.edges.map((img) => ({
      src: img.node.url,
      alt: img.node.altText || undefined,
    })),
    variants: edge.node.variants.edges.map((v) => ({
      title: v.node.title || undefined,
      price: v.node.price,
      sku: v.node.sku || undefined,
    })),
  }))

  return { products }
}

export default function Index() {
  const { products } = useLoaderData<LoaderData>()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [showVariants, setShowVariants] = useState(false)
  const submit = useSubmit()
  const navigation = useNavigation()

  const isGenerating = navigation.state === 'submitting'

  const currentProduct = products.find((p) => p.id === selectedProduct)
  const hasMultipleVariants = currentProduct && currentProduct.variants.length > 1

  const handleProductChange = (value: string) => {
    setSelectedProduct(value)
    setShowVariants(false)
    setSelectedVariant('')
  }

  const handleContinue = () => {
    if (!selectedProduct) return
    
    if (hasMultipleVariants && !showVariants) {
      setShowVariants(true)
      setSelectedVariant(currentProduct.variants[0]?.title || '0')
    } else {
      handleGenerate()
    }
  }

  const handleGenerate = () => {
    if (!selectedProduct) return

    const formData = new FormData()
    formData.append('productId', selectedProduct)
    if (hasMultipleVariants && selectedVariant) {
      formData.append('selectedVariant', selectedVariant)
    }
    submit(formData, { method: 'post', action: '/app/generate' })
  }

  const productOptions = [
    { label: 'Select a product', value: '' },
    ...products.map((p) => ({
      label: p.title,
      value: p.id,
    })),
  ]

  return (
    <Page title="AI Product Content Generator">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Generate SEO-Optimized Content
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Select a product to generate comprehensive AI-powered SEO content including titles,
                descriptions, FAQs, keywords, and metafields.
              </Text>

              <Select
                label="Select Product"
                options={productOptions}
                value={selectedProduct}
                onChange={handleProductChange}
              />

              {showVariants && hasMultipleVariants && (
                <BlockStack gap="300">
                  <Text as="p" variant="headingMd">
                    This product has multiple variants. Which one would you like to optimize?
                  </Text>
                  <BlockStack gap="200">
                    {currentProduct.variants.map((variant, index) => (
                      <RadioButton
                        key={index}
                        label={`${variant.title || `Variant ${index + 1}`} - $${variant.price}`}
                        checked={selectedVariant === (variant.title || String(index))}
                        id={`variant-${index}`}
                        onChange={() => setSelectedVariant(variant.title || String(index))}
                      />
                    ))}
                  </BlockStack>
                </BlockStack>
              )}

              <InlineStack align="end">
                <Button
                  variant="primary"
                  onClick={handleContinue}
                  disabled={!selectedProduct || isGenerating || (showVariants && !selectedVariant)}
                  loading={isGenerating}
                >
                  {isGenerating
                    ? 'Generating...'
                    : showVariants
                    ? 'Generate Content'
                    : hasMultipleVariants
                    ? 'Continue'
                    : 'Generate SEO Content'}
                </Button>
              </InlineStack>

              {isGenerating && (
                <Banner>
                  <InlineStack gap="200" align="center">
                    <Spinner size="small" />
                    <Text as="p">
                      Analyzing product images and generating optimized content... This may take
                      30-60 seconds.
                    </Text>
                  </InlineStack>
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
