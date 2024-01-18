import { test } from '../../core';
import { expect } from '@playwright/test';
import { HomePage, BillingPage } from '../../pages';
import { billingForm } from '@kenyaemr/esm-billing-app';

test('Accessing the Billing page Dashboard from Home', async ({ page }) => {
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.gotoHome();
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
  await test.step('When I visit Billing dashboard', async () => {
    await billingPage.gotoBilling();
  });

  await test.step('Then should be at the home page', async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home/billing`);
  });
  await test.step('Then I  should be able to see Bill table', async () => {
    const billList = page
      .locator('div[class*="-esm-billing__bills"] h4')
      .filter({ hasText: /^Bill list$/ })
      .first();
    await expect(billList).toBeVisible();
  });
  await test.step('I should be able  to  see table header ', async () => {
    const billHeaders = page.locator('div[class*="-esm-billing__bills"] tr').first();
    await expect(billHeaders).toContainText('Visit timeIdentifierNameBilled Items');
  });
});
test('Make payment for a bill', async ({ page }) => {
  const billingPage = new BillingPage(page);
  await test.step('When I visit Billing dashboard', async () => {
    await billingPage.gotoBilling();
  });
  await test.step('when I click a on a client on table I should be directed to patient bill summary', async () => {
    const tdWithAnchorTags = await page.$$('div[class*="-esm-billing__bills"] tbody td a');
    if (tdWithAnchorTags.length <= 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * tdWithAnchorTags.length);
    await tdWithAnchorTags[randomIndex].click();
    await expect(page).toHaveURL('^/spa/home/billing/patient/');
  });
});
