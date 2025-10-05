import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ShopifyProduct {
  id: string
  title: string
  description: string
  vendor: string
  productType: string
  tags: string[]
  images: Array<{ src: string; alt?: string }>
  variants: Array<{ price: string; sku?: string; title?: string }>
}

export interface OptimizedContent {
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

export async function generateOptimizedContent(
  product: ShopifyProduct,
  imageAnalysis?: string,
  selectedVariant?: string
): Promise<OptimizedContent> {
  const variantContext = selectedVariant
    ? `\n\nFocus on this specific variant: ${selectedVariant}`
    : ''

  const prompt = `You are an expert SEO content writer and e-commerce specialist. Create comprehensive, conversion-optimized product content.

Product Information:
- Title: ${product.title}
- Description: ${product.description}
- Vendor: ${product.vendor}
- Type: ${product.productType}
- Price: $${product.variants[0]?.price || 'N/A'}
- Current Tags: ${product.tags.join(', ')}
${variantContext}

${imageAnalysis ? `Image Analysis: ${imageAnalysis}` : ''}

CRITICAL: You MUST respond with VALID JSON only. Use \\n for line breaks, not actual newlines.

Generate content in this EXACT JSON format (ensure all strings are properly escaped):

{
  "title": "SEO-optimized title with emoji (60-70 chars)",
  "productDescription": "Create a comprehensive formatted description with these sections:\\n\\n[Opening Hook - 2-3 engaging paragraphs with emojis]\\n\\n✨ Key Features & Benefits\\n\\n• Feature 1 - Benefit explanation\\n• Feature 2 - Benefit explanation\\n• Feature 3 - Benefit explanation\\n\\n🎯 Why You Should Buy\\n\\n• Compelling reason 1\\n• Compelling reason 2\\n• Compelling reason 3\\n\\n❓ Frequently Asked Questions\\n\\nQ: Question 1?\\nA: Detailed answer.\\n\\nQ: Question 2?\\nA: Detailed answer.\\n\\nMake this 500-700 words, scannable and engaging.",
  "keyFeatures": [
    {"feature": "Feature name 1", "benefit": "Clear benefit to customer"},
    {"feature": "Feature name 2", "benefit": "Clear benefit to customer"},
    {"feature": "Feature name 3", "benefit": "Clear benefit to customer"},
    {"feature": "Feature name 4", "benefit": "Clear benefit to customer"},
    {"feature": "Feature name 5", "benefit": "Clear benefit to customer"}
  ],
  "whyBuy": [
    "Compelling reason with benefit focus",
    "Another strong value proposition",
    "Unique selling point",
    "Quality or durability highlight",
    "Customer satisfaction point"
  ],
  "faqs": [
    {"question": "Common customer question 1?", "answer": "Detailed, helpful answer with specifics."},
    {"question": "Common customer question 2?", "answer": "Detailed, helpful answer with specifics."},
    {"question": "Common customer question 3?", "answer": "Detailed, helpful answer with specifics."},
    {"question": "Common customer question 4?", "answer": "Detailed, helpful answer with specifics."}
  ],
  "imageRecommendations": [
    "Main product shot recommendation",
    "Lifestyle or use-case image suggestion",
    "Detail or feature close-up suggestion",
    "Scale or size reference suggestion"
  ],
  "shortTailKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "longTailKeywords": ["long tail phrase 1", "long tail phrase 2", "long tail phrase 3", "long tail phrase 4", "long tail phrase 5", "long tail phrase 6", "long tail phrase 7", "long tail phrase 8", "long tail phrase 9", "long tail phrase 10"],
  "shopifyTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13", "tag14", "tag15"],
  "metaTitle": "SEO meta title (50-60 characters)",
  "metaDescription": "SEO meta description with call-to-action (150-160 characters)",
  "metafields": [
    {"namespace": "details", "key": "material", "type": "single_line_text", "value": "material name"},
    {"namespace": "details", "key": "weight", "type": "single_line_text", "value": "weight with units"},
    {"namespace": "details", "key": "dimensions", "type": "single_line_text", "value": "dimensions"},
    {"namespace": "features", "key": "best_for", "type": "list.single_line_text_field", "value": "Use case 1, Use case 2, Use case 3"}
  ]
}

IMPORTANT RULES:
- Use \\n for ALL line breaks (never use actual newlines)
- Escape all quotes and special characters properly
- Use emojis strategically in title and description
- Provide 5-7 key features with clear benefits
- Generate 10+ short-tail and 10+ long-tail keywords
- Create 15-20 Shopify tags
- Make the productDescription ready to copy/paste into Shopify
- Return ONLY valid JSON, no markdown code blocks or extra text`

  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt,
    temperature: 0.7,
  })

  // Clean up the response - remove markdown code blocks if present
  let cleanedText = text.trim()
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
  }

  // Try to extract JSON object
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('Failed to find JSON in response:', cleanedText.substring(0, 500))
    throw new Error('Failed to parse AI response - no JSON found')
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return parsed
  } catch (error) {
    console.error('JSON parse error:', error)
    console.error('Attempted to parse:', jsonMatch[0].substring(0, 500))
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function analyzeProductImages(imageUrls: string[]): Promise<string> {
  if (imageUrls.length === 0) return ''

  const { text } = await generateText({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze these product images in detail. Describe: materials, colors, design features, quality indicators, use cases shown, and any unique characteristics. Be specific and thorough - this will help generate better product descriptions.',
          },
          ...imageUrls.slice(0, 5).map((url) => ({
            type: 'image' as const,
            image: url,
          })),
        ],
      },
    ],
  })

  return text
}
