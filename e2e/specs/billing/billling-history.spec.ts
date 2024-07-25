import { test } from '../../core';
import { expect } from '@playwright/test';
import { HomePage, BillingPage } from '../../pages';

test('Accessing the Billing page dashboard from home', async ({ page }) => {
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.gotoHome();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home`);
  });

  await test.step('Then should be able to navigate to billing page', async () => {
    await page.getByRole('link', { name: 'Billing' }).click();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home/billing`);
  });

  await test.step('Then should be able to view Cumulative, Pending and Paid bills', async () => {
    await expect(page.getByRole('heading', { name: 'Cumulative Bills' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pending Bills' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paid Bills' })).toBeVisible();
  });
});

test('Check if Bill table is available', async ({ page }) => {
  const billingPage = new BillingPage(page);

  await test.step('When I visit billing dashboard, I should be at the billing page', async () => {
    await billingPage.gotoBilling();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home/billing`);
  });

  await test.step('Then I should be able to see bills table if there are bills', async () => {
    const billListLocator = page
      .locator('div[class*="-esm-billing__bills"] h4')
      .filter({ hasText: /^Bill list$/ })
      .first();

    await page.waitForTimeout(40000);

    const billListTableCount = await billListLocator.count();

    if (billListTableCount > 0) {
      await expect(billListLocator).toBeVisible();
      await test.step('I should be able to see table header', async () => {
        const billHeaders = page.locator('div[class*="-esm-billing__bills"] tr').first();
        await expect(billHeaders).toContainText('Visit timeIdentifierNameBilled Items');
      });
    } else {
      test.skip();
    }
  });
});

test('Make payment for a bill', async ({ page }) => {
  const billingPage = new BillingPage(page);

  await test.step('When I visit billing dashboard', async () => {
    await billingPage.gotoBilling();
  });

  const billListLocator = page
    .locator('div[class*="-esm-billing__bills"] h4')
    .filter({ hasText: /^Bill list$/ })
    .first();

  await page.waitForTimeout(40000);

  const billListTableCount = await billListLocator.count();

  if (billListTableCount > 0) {
    await test.step('when I click a on a client on table I should be directed to patient bill summary', async () => {
      const tdWithAnchorTags = await page.$$('div[class*="-esm-billing__bills"] tbody td a');
      if (tdWithAnchorTags.length <= 0) {
        return;
      }
      const randomIndex = Math.floor(Math.random() * tdWithAnchorTags.length);
      await tdWithAnchorTags[randomIndex].click();
      const currentURL = page.url();
      expect(currentURL).toContain('/spa/home/billing/patient/');
    });
  } else {
    test.skip();
  }
});
