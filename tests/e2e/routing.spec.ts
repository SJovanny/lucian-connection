import { expect, test } from "@playwright/test";

for (const { locale, heading, cta } of [
  {
    locale: "fr",
    heading: "Tout ce dont vous avez besoin, au même endroit.",
    cta: "Commander maintenant",
  },
  {
    locale: "en",
    heading: "Everything you need, in one place.",
    cta: "Shop now",
  },
]) {
  test(`/${locale} renders the localized storefront`, async ({ page }) => {
    const response = await page.goto(`/${locale}`);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { level: 1, name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: cta, exact: true })).toHaveAttribute(
      "href",
      `/${locale}/products`,
    );
  });
}

test("language switcher updates the document language without reloading", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  // An expando survives client navigation but is lost on a new document.
  const marker = "language-switch-document";
  await page.evaluate((key) => Reflect.set(document, key, true), marker);

  for (const locale of ["en", "fr"]) {
    await page.getByRole("button", { name: "Change language", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    expect(await page.evaluate((key) => Reflect.get(document, key), marker)).toBe(true);
  }
});

test("localized admin redirect preserves the query", async ({ request, baseURL }) => {
  const query = "?next=%2Fadmin%2Forders&filter=pending&filter=paid";
  // Inspect only the canonical redirect; protected admin rendering requires config.
  const response = await request.get(`/fr/admin${query}`, { maxRedirects: 0 });

  expect(response.status()).toBe(308);
  expect(new URL(response.headers().location, baseURL).href).toBe(`${baseURL}/admin${query}`);
});

test("public admin login renders", async ({ page }) => {
  const response = await page.goto("/admin/login");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Administration", exact: true })).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Mot de passe", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Se connecter", exact: true })).toBeEnabled();
});

for (const { language, locale } of [
  { language: "fr-FR,fr;q=0.9,en;q=0.8", locale: "fr" },
  { language: "en-US,en;q=0.9,fr;q=0.8", locale: "en" },
  { language: "de-DE,de;q=0.9", locale: "fr" },
]) {
  test(`root negotiates ${locale} for Accept-Language: ${language}`, async ({ request, baseURL }) => {
    // Each test has a fresh cookie jar so NEXT_LOCALE cannot override the header.
    const response = await request.get("/", {
      headers: { "Accept-Language": language },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(new URL(response.headers().location, baseURL).href).toBe(`${baseURL}/${locale}`);
  });
}
