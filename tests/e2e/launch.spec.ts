import { expect, test } from "@playwright/test";

test.describe("NextUp launch journeys", () => {
  test("renders the home dashboard without browser errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Find one opportunity worth your week." })).toBeVisible();
    await expect(page.getByRole("region", { name: "Opportunity signal overview" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("search applies a filter and preserves the result state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Search opportunities" }).fill("scholarship");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).toHaveURL(/q=scholarship/);
    await expect(page.getByRole("link", { name: /AICTE .* Scholarship/ }).first()).toBeVisible();
  });

  test("opens a detail page and handles a missing page", async ({ page }) => {
    await page.goto("/opportunities/opportunity-nextgen-hackathon-2026");
    await expect(page.getByRole("heading", { name: "Next Gen Hackathon 2026 · Bengaluru" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open official source/ })).toHaveAttribute("href", /^https?:\/\//);

    await page.goto("/does-not-exist");
    await expect(page.getByText("That opportunity moved on.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to NextUp" })).toBeVisible();
  });

  test("renders admin review and saved surfaces", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Review the signal." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Human approval stays on" })).toBeVisible();

    await page.goto("/saved");
    await expect(page.getByRole("heading", { name: "Keep your next moves visible." })).toBeVisible();
  });
});
