import { Page } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto('home');
  }

  async selectLocationIfPresent() {
    if (await this.page.locator('text=Select your location from the list below.').isVisible()) {
      const firstCheckbox = this.page.locator('input[type="radio"]').first();
      await firstCheckbox.check();
      await this.page.locator('button:has-text("Confirm")').click();
    }
  }
}

export class BillingPage {
  constructor(readonly page: Page) {}
  async gotoBilling() {
    await this.page.goto('/openmrs/spa/home/billing');
  }
}
