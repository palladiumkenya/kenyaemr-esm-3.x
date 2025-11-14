import { Page, expect } from '@playwright/test';

export class PaymentPointPage {
  constructor(private readonly page: Page) {}

  /**
   * Navigate to the billing admin page
   */
  async goto() {
    await this.page.goto('http://localhost/openmrs/spa/billing-admin');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify we're on the billing admin page
   */
  async verifyOnBillingAdminPage() {
    await expect(this.page).toHaveURL(/.*billing-admin.*/);
  }

  /**
   * Click the Create Payment Point button
   */
  async clickCreatePaymentPoint() {
    await this.page.getByRole('button', { name: 'Create Payment Point' }).click();
  }

  /**
   * Fill in the payment point form
   */
  async fillPaymentPointForm(name: string, description: string) {
    await this.page.getByRole('textbox', { name: 'Cash Point Name' }).fill(name);
    await this.page.getByRole('textbox', { name: 'Description' }).fill(description);
  }

  /**
   * Submit the payment point form
   */
  async submitPaymentPointForm() {
    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
  }

  /**
   * Verify payment point is visible in the list
   */
  async verifyPaymentPointVisible(paymentPointName: string) {
    await expect(this.page.getByText(paymentPointName)).toBeVisible();
  }

  /**
   * Create a new payment point (complete flow)
   */
  async createPaymentPoint(name: string, description: string) {
    await this.clickCreatePaymentPoint();
    await this.fillPaymentPointForm(name, description);
    await this.submitPaymentPointForm();
  }
}
