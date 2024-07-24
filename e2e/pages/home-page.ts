import { Page } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto('home');
  }
}
