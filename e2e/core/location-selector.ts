import { Page } from '@playwright/test';

export function addURLChangeListener(page: Page) {
  page.on('framenavigated', async (frame) => {
    if (frame === page.mainFrame()) {
      // eslint-disable-next-line no-console
      console.log('Navigated to URL:', frame.url());
      const currentURL = frame.url();

      if (currentURL.includes('/login/location')) {
        const firstCheckbox = page.locator('input[type="radio"]').first();
        await firstCheckbox.check({ force: true });
        await page.locator('button:has-text("Confirm")').click();
      }
    }
  });
}
