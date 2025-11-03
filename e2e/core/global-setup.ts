import { request } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * This configuration is to reuse the signed-in state in the tests
 * by log in only once using the API and then skip the log in step for all the tests.
 *
 * https://playwright.dev/docs/auth#reuse-signed-in-state
 */

async function globalSetup() {
  const requestContext = await request.newContext();
  const token = Buffer.from(`${process.env.E2E_USER_ADMIN_USERNAME}:${process.env.E2E_USER_ADMIN_PASSWORD}`).toString(
    'base64',
  );
  const baseUrl = process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      'Missing E2E_BASE_URL environment variable. Add it to your .env file or export it before running the tests.',
    );
  }

  const restBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const sessionUrl = new URL('ws/rest/v1/session', restBaseUrl).toString();
  
  const response = await requestContext.post(sessionUrl, {
    data: {
      sessionLocation: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      locale: 'en',
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  if (!response.ok()) {
    throw new Error(
      `Failed to establish API session for Playwright tests. Status: ${response.status()} ${response.statusText()}`,
    );
  }
  await requestContext.storageState({ path: 'e2e/storageState.json' });
  await requestContext.dispose();
}

export default globalSetup;
