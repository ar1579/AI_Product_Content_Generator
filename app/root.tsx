import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, isRouteErrorResponse } from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  let errorMessage = "An unexpected error occurred";
  let errorStatus = 500;
  
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  console.error("Application error:", error);
  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
        <title>Error - AI Product Content Generator</title>
      </head>
      <body>
        <div style={{ 
          padding: "40px", 
          maxWidth: "600px", 
          margin: "0 auto",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <h1 style={{ color: "#bf0711", marginBottom: "16px" }}>
            {errorStatus === 404 ? "Page Not Found" : "Oops! Something went wrong"}
          </h1>
          <p style={{ color: "#202223", marginBottom: "24px", lineHeight: "1.6" }}>
            {errorStatus === 404 
              ? "The page you're looking for doesn't exist."
              : "We're sorry, but something unexpected happened. Please try again or contact support if the problem persists."
            }
          </p>
          {process.env.NODE_ENV === "development" && (
            <div style={{ 
              backgroundColor: "#f6f6f7", 
              padding: "16px", 
              borderRadius: "8px",
              marginTop: "24px"
            }}>
              <p style={{ 
                fontFamily: "monospace", 
                fontSize: "14px", 
                color: "#bf0711",
                margin: 0,
                whiteSpace: "pre-wrap"
              }}>
                {errorMessage}
              </p>
            </div>
          )}
          <div style={{ marginTop: "32px" }}>
            <a 
              href="/app" 
              style={{ 
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#008060",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "500"
              }}
            >
              Return to Home
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
