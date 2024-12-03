import { Page } from '@playwright/test';

export class BillingPage {
  constructor(readonly page: Page) {}

  async gotoBilling() {
    await this.page.goto('/openmrs/spa/home/billing');
  }
}
