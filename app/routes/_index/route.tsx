import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles["index"]}>
      <div className={styles["content"]}>
        <h1 className={styles["heading"]}>
          AI Product Content Generator for Shopify
        </h1>
        <p className={styles["text"]}>
          Smarter Product Descriptions with AI
        </p>

        {showForm && (
          <Form className={styles["form"]} method="post" action="/auth/login">
            <label className={styles["label"]}>
              <span>Shop domain</span>
              <input
                className={styles["input"]}
                type="text"
                name="shop"
                placeholder="e.g: my-shop-domain.myshopify.com"
              />
            </label>
            <button className={styles["button"]} type="submit">
              Log in
            </button>
          </Form>
        )}

        <ul className={styles["list"]}>
          <li>
            <strong>Generate Product Descriptions Instantly.</strong> Use AI to
            create high-quality, engaging, and SEO-optimized product copy in
            seconds.
          </li>
          <li>
            <strong>Bulk Content Creation.</strong> Generate descriptions for
            multiple products at once—perfect for large Shopify stores.
          </li>
          <li>
            <strong>Customizable Tone and Style.</strong> Adjust voice and tone
            to match your brand and engage your audience more effectively.
          </li>
        </ul>
      </div>
    </div>
  );
}
