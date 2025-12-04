import { test } from '@playwright/test';
import { PaymentPointPage } from '../pages';

test.describe('Billing Admin - Payment Points', () => {
  let paymentPointPage: PaymentPointPage;

  test.beforeEach(async ({ page }) => {
    paymentPointPage = new PaymentPointPage(page);

    // Navigate directly to the billing admin page
    await paymentPointPage.goto();

    // Verify we're on the billing admin page
    await paymentPointPage.verifyOnBillingAdminPage();
  });

  test('should create a new payment point successfully', async () => {
    // Generate unique payment point details
    const timestamp = Date.now();
    const paymentPointName = `Test Payment Point ${timestamp}`;
    const description = 'Automated test payment point';

    // Create a new payment point
    await paymentPointPage.createPaymentPoint(paymentPointName, description);

    // Verify the new payment point is listed
    await paymentPointPage.verifyPaymentPointVisible(paymentPointName);
  });
});
