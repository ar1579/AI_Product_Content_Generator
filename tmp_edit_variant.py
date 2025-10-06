from pathlib import Path

path = Path('app/routes/app.generate.tsx')
text = path.read_text()

# add variantKey in saveGeneratedContent
save_signature = "async function saveGeneratedContent(\n  shop: string,\n  productId: string,\n  selectedVariant: string | null,\n  content: OptimizedContent,\n  originalProduct: { title: string; description: string }\n) {\n  const expiresAt = new Date()\n  expiresAt.setDate(expiresAt.getDate() + 7) // Cache for 7 days\n\n  await db.generatedContent.upsert({\n"
if save_signature not in text:
    raise SystemExit('save signature not found')
replacement = "async function saveGeneratedContent(\n  shop: string,\n  productId: string,\n  selectedVariant: string | null,\n  content: OptimizedContent,\n  originalProduct: { title: string; description: string }\n) {\n  const expiresAt = new Date()\n  expiresAt.setDate(expiresAt.getDate() + 7) // Cache for 7 days\n\n  const variantKey = selectedVariant ?? \"\"\n\n  await db.generatedContent.upsert({\n"
text = text.replace(save_signature, replacement, 1)

text = text.replace(
    "        selectedVariant: selectedVariant || null,\n",
    "        selectedVariant: variantKey,\n",
    2  # replace first two occurrences (where + create) sequentially
)

# update loadGeneratedContent function
load_signature = "async function loadGeneratedContent(\n  shop: string,\n  productId: string,\n  selectedVariant: string | null\n): Promise<{ content: OptimizedContent; originalProduct: { title: string; description: string } } | null> {\n  const cached = await db.generatedContent.findUnique({\n    where: {\n      shop_productId_selectedVariant: {\n        shop,\n        productId,\n        selectedVariant: selectedVariant || null,\n      },\n    },\n  })\n\n  if (!cached) return null\n"
if load_signature not in text:
    raise SystemExit('load signature block not found')
replacement_load = "async function loadGeneratedContent(\n  shop: string,\n  productId: string,\n  selectedVariant: string | null\n): Promise<{ content: OptimizedContent; originalProduct: { title: string; description: string } } | null> {\n  const variantKey = selectedVariant ?? \"\"\n\n  const cached = await db.generatedContent.findUnique({\n    where: {\n      shop_productId_selectedVariant: {\n        shop,\n        productId,\n        selectedVariant: variantKey,\n      },\n    },\n  })\n\n  if (!cached) return null\n"
text = text.replace(load_signature, replacement_load, 1)

path.write_text(text)
