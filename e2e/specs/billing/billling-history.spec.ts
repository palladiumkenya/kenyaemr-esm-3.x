import { test } from '../../core';
import { expect } from '@playwright/test';
import { HomePage } from '../../pages';

test('Accessing the Billing page Dashboard ', async ({ page }) => {
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.gotoHome();
  });
  await test.step('Then should be able to navigate to billing page', async () => {
    await page.getByRole('link', { name: 'Billing' }).click();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home/billing`);
  });

  await test.step('Tnen should be able to view Cumulative, Pending and Paid bills', async () => {
    await expect(page.getByRole('heading', { name: 'Cumulative Bills' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pending Bills' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paid Bills' })).toBeVisible();
  });
});
