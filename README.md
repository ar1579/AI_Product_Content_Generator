# AI Product Content Generator - Shopify App

A Shopify app that uses AI to generate SEO-optimized product content including titles, descriptions, FAQs, keywords, and metafields. Built with React Router and powered by OpenAI's GPT-4o.

## Features

- 🤖 AI-powered content generation using GPT-4o
- 🖼️ Automatic product image analysis
- 📝 Comprehensive SEO content including:
  - Optimized product titles
  - Detailed product descriptions
  - Key features and benefits
  - FAQs
  - Short-tail and long-tail keywords
  - Shopify product tags
  - Meta titles and descriptions
  - Custom metafields
- 💾 Database caching for generated content (7-day expiration)
- 🔄 Support for product variants
- 📊 Health check endpoint for monitoring

## Prerequisites

Before you begin, you'll need:

1. **Node.js**: Version 20.10 or higher ([Download](https://nodejs.org/en/download/))
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup)
3. **Test Store**: Set up a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or [Shopify Plus sandbox](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store)
4. **Shopify CLI**: Install globally
   ```bash
   npm install -g @shopify/cli@latest
   ```
5. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_APP_URL=https://your-app-url.com
SCOPES=write_products,read_products

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional Variables

```env
# Custom Shop Domain (if applicable)
SHOP_CUSTOM_DOMAIN=your-custom-domain.myshopify.com

# Database Configuration (for production)
DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Note**: A `.env.example` file is provided as a template. Copy it to `.env` and fill in your values.

## Installation

### 1. Clone or Initialize the App

```bash
# If using Shopify CLI to create new app
shopify app init --template=https://github.com/Shopify/shopify-app-template-react-router

# Or clone this repository
git clone <your-repo-url>
cd AI_Product_Content_Generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 4. Set Up Database

```bash
npm run setup
```

This will:
- Generate Prisma client
- Run database migrations
- Create the SQLite database (for development)

## Development

### Start Development Server

```bash
npm run dev
# or
shopify app dev
```

This will:
- Start the development server
- Open a tunnel to your local server
- Provide a URL to install the app in your test store

Press `P` to open the app URL in your browser.

### Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Production Deployment

### Vercel Deployment

This app is configured for deployment on Vercel.

1. **Prepare for Deployment**

```bash
npm run build
```

2. **Set Environment Variables in Vercel**

Add all required environment variables in your Vercel project settings:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL` (your Vercel deployment URL)
- `OPENAI_API_KEY`
- `DATABASE_URL` (PostgreSQL recommended for production)
- `SCOPES`

3. **Update Database for Production**

For production, it's recommended to use PostgreSQL instead of SQLite:

```prisma
// In prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run migrations:
```bash
npx prisma migrate deploy
```

4. **Deploy to Vercel**

```bash
vercel deploy --prod
```

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t ai-product-content-generator .

# Run the container
docker run -p 3000:3000 \
  -e SHOPIFY_API_KEY=your_key \
  -e SHOPIFY_API_SECRET=your_secret \
  -e SHOPIFY_APP_URL=your_url \
  -e OPENAI_API_KEY=your_openai_key \
  ai-product-content-generator
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the application:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-05T23:00:00.000Z",
  "checks": {
    "database": "connected",
    "openai": "configured",
    "shopify": "configured"
  }
}
```

## Usage

1. **Install the app** in your Shopify store
2. **Select a product** from the dropdown
3. **Choose a variant** (if the product has multiple variants)
4. **Click "Generate SEO Content"** to create optimized content
5. **Review and copy** the generated content to use in your Shopify store

### Generated Content Includes:

- ✨ **Optimized Title**: SEO-friendly product title with emojis
- 📝 **Complete Description**: Comprehensive product description with:
  - Engaging opening paragraphs
  - Key features and benefits
  - Compelling reasons to buy
  - Frequently asked questions
- 🔑 **Keywords**: Short-tail and long-tail SEO keywords
- 🏷️ **Shopify Tags**: Ready-to-use product tags
- 🎯 **Meta Information**: SEO meta title and description
- 📊 **Custom Metafields**: Structured product data
- 🖼️ **Image Recommendations**: Suggestions for product photography

## Architecture

### Tech Stack

- **Framework**: React Router v7
- **UI Library**: Shopify Polaris
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **AI**: OpenAI GPT-4o with vision capabilities
- **Authentication**: Shopify OAuth
- **Deployment**: Vercel / Docker

### Key Features

- **Database Caching**: Generated content is cached for 7 days to reduce API costs
- **Error Handling**: Comprehensive error handling with retry logic
- **Rate Limiting**: Built-in protection against API abuse
- **Image Analysis**: Automatic analysis of product images for better content
- **Variant Support**: Generate content specific to product variants

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset
```

### OpenAI API Errors

- **Rate Limit**: The app automatically retries with exponential backoff
- **Invalid API Key**: Check that `OPENAI_API_KEY` is set correctly
- **Timeout**: Image analysis may take 30-60 seconds for products with multiple images

### Shopify Authentication Issues

- Ensure `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` match your app credentials
- Verify `SHOPIFY_APP_URL` is set to your app's public URL
- Check that required scopes are granted: `write_products,read_products`

### "nbf" Claim Timestamp Check Failed

This indicates a clock synchronization issue. Enable "Set time and date automatically" in your system settings.

## Development Best Practices

### Code Quality

```bash
# Run linter
npm run lint

# Type checking
npm run typecheck

# Format code (if Prettier is configured)
npx prettier --write .
```

### Database Migrations

Always create migrations for schema changes:

```bash
npx prisma migrate dev --name descriptive_migration_name
```

### Environment Variables

- Never commit `.env` files
- Always update `.env.example` when adding new variables
- Use environment-specific values for different deployments

## Security

- ✅ All secrets stored in environment variables
- ✅ Input validation on all user inputs
- ✅ GraphQL error handling
- ✅ CSRF protection via Shopify App Bridge
- ✅ Secure session storage with Prisma
- ✅ Rate limiting on content generation

## Performance Considerations

- **Caching**: Generated content is cached in the database for 7 days
- **Image Analysis**: Limited to 10 images per product to control costs
- **Retry Logic**: Automatic retry with exponential backoff for transient failures
- **Database Indexing**: Optimized queries with proper indexes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: [Your Contact Information]

## Resources

- [Shopify App Development](https://shopify.dev/docs/apps/getting-started)
- [React Router Documentation](https://reactrouter.com/home)
- [Shopify Polaris](https://polaris.shopify.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.