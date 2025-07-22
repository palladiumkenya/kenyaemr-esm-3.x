import { useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';

// Default locale to currency mapping (fallback)
export const DEFAULT_LOCALE_CURRENCY_MAP: Record<string, string> = {
  en: 'KES', // English - Kenyan Shilling
  sw: 'KES', // Swahili - Kenyan Shilling
  am: 'ETB', // Amharic - Ethiopian Birr
  'en-KE': 'KES', // English Kenya
  'sw-KE': 'KES', // Swahili Kenya
  'am-ET': 'ETB', // Amharic Ethiopia
};

/**
 * Gets the currency code for the current locale
 * @returns The currency code (e.g., 'KES', 'ETB')
 */
export const getCurrencyForLocale = (): string => {
  const currentLocale = localStorage.getItem('i18nextLng') ?? 'en';
  return DEFAULT_LOCALE_CURRENCY_MAP[currentLocale] || 'KES';
};

/**
 * Gets the currency code for the current locale with config support
 * @param config - The billing configuration object
 * @returns The currency code (e.g., 'KES', 'ETB')
 */
export const getCurrencyForLocaleWithConfig = (config?: BillingConfig): string => {
  const currentLocale = localStorage.getItem('i18nextLng') ?? 'en';

  // Use config mapping if available, otherwise fall back to default
  const currencyMap = config?.localeCurrencyMapping || DEFAULT_LOCALE_CURRENCY_MAP;
  return currencyMap[currentLocale] || 'KES';
};

/**
 * Gets the current locale from localStorage
 * @returns The current locale (e.g., 'en', 'sw', 'am')
 */
export const getCurrentLocale = (): string => {
  return localStorage.getItem('i18nextLng') ?? 'en';
};

/**
 * Formats a number as currency based on the current locale
 * @param amount - The amount to format
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, options: Intl.NumberFormatOptions = {}): string => {
  const currentLocale = getCurrentLocale();
  const currency = getCurrencyForLocale();

  const formatter = new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    ...options,
  });

  let formattedAmount = formatter.format(Math.abs(amount));

  if (amount < 0) {
    formattedAmount = `- ${formattedAmount}`;
  }

  return formattedAmount;
};

/**
 * Formats a number as currency without negative sign handling
 * @param amount - The amount to format
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export const formatCurrencySimple = (amount: number, options: Intl.NumberFormatOptions = {}): string => {
  const currentLocale = getCurrentLocale();
  const currency = getCurrencyForLocale();

  const formatter = new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: currency,
    ...options,
  });

  return formatter.format(amount);
};

/**
 * Hook to get currency formatting with config support
 * @returns Object with currency formatting functions
 */
export const useCurrencyFormatting = () => {
  const config = useConfig<BillingConfig>();

  const getCurrency = () => getCurrencyForLocaleWithConfig(config);
  const getLocale = () => getCurrentLocale();

  const format = (amount: number, options: Intl.NumberFormatOptions = {}) => {
    const currentLocale = getLocale();
    const currency = getCurrency();

    const formatter = new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      ...options,
    });

    let formattedAmount = formatter.format(Math.abs(amount));

    if (amount < 0) {
      formattedAmount = `- ${formattedAmount}`;
    }

    return formattedAmount;
  };

  const formatSimple = (amount: number, options: Intl.NumberFormatOptions = {}) => {
    const currentLocale = getLocale();
    const currency = getCurrency();

    const formatter = new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currency,
      ...options,
    });

    return formatter.format(amount);
  };

  return {
    getCurrency,
    getLocale,
    format,
    formatSimple,
  };
};
