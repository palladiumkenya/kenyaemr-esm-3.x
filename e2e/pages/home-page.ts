import { Page } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto('home');
  }
}

export class BillingPage {
  constructor(readonly page: Page) {}
  async gotoBilling() {
    await this.page.goto('/openmrs/spa/home/billing');
  }
}
