import { test } from '../core';
import { expect } from '@playwright/test';
import { HomePage } from '../pages';

test('Go to homepage', async ({ page }) => {
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.gotoHome();
  });

  await test.step('If redirected to select login location, choose location', async () => {
    await homePage.selectLocationIfPresent();
  });

  await test.step('Then should be at the home page', async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home`);
  });
});
