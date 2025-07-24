import {
  DEFAULT_LOCALE_CURRENCY_MAP,
  getCurrencyForLocale,
  getCurrentLocale,
  formatCurrency,
  formatCurrencySimple,
} from './currency';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Currency Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DEFAULT_LOCALE_CURRENCY_MAP', () => {
    it('should have correct currency mappings', () => {
      expect(DEFAULT_LOCALE_CURRENCY_MAP.en).toBe('KES');
      expect(DEFAULT_LOCALE_CURRENCY_MAP.sw).toBe('KES');
      expect(DEFAULT_LOCALE_CURRENCY_MAP.am).toBe('ETB');
      expect(DEFAULT_LOCALE_CURRENCY_MAP['en-KE']).toBe('KES');
      expect(DEFAULT_LOCALE_CURRENCY_MAP['sw-KE']).toBe('KES');
      expect(DEFAULT_LOCALE_CURRENCY_MAP['am-ET']).toBe('ETB');
    });
  });

  describe('getCurrentLocale', () => {
    it('should return locale from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('sw');
      expect(getCurrentLocale()).toBe('sw');
    });

    it('should return default locale when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getCurrentLocale()).toBe('en');
    });
  });

  describe('getCurrencyForLocale', () => {
    it('should return correct currency for English locale', () => {
      mockLocalStorage.getItem.mockReturnValue('en');
      expect(getCurrencyForLocale()).toBe('KES');
    });

    it('should return correct currency for Swahili locale', () => {
      mockLocalStorage.getItem.mockReturnValue('sw');
      expect(getCurrencyForLocale()).toBe('KES');
    });

    it('should return correct currency for Amharic locale', () => {
      mockLocalStorage.getItem.mockReturnValue('am');
      expect(getCurrencyForLocale()).toBe('ETB');
    });

    it('should return KES as fallback for unknown locale', () => {
      mockLocalStorage.getItem.mockReturnValue('fr');
      expect(getCurrencyForLocale()).toBe('KES');
    });
  });

  describe('formatCurrency', () => {
    beforeEach(() => {
      // Mock Intl.NumberFormat
      const mockFormatter = {
        format: jest.fn((value) => `$${value.toFixed(2)}`),
      };
      jest.spyOn(Intl, 'NumberFormat').mockImplementation(() => mockFormatter as any);
    });

    it('should format positive amounts correctly', () => {
      mockLocalStorage.getItem.mockReturnValue('en');
      const result = formatCurrency(1234.56);
      expect(result).toBe('$1234.56');
    });

    it('should format negative amounts with minus sign', () => {
      mockLocalStorage.getItem.mockReturnValue('en');
      const result = formatCurrency(-1234.56);
      expect(result).toBe('- $1234.56');
    });
  });

  describe('formatCurrencySimple', () => {
    beforeEach(() => {
      // Mock Intl.NumberFormat
      const mockFormatter = {
        format: jest.fn((value) => `$${value.toFixed(2)}`),
      };
      jest.spyOn(Intl, 'NumberFormat').mockImplementation(() => mockFormatter as any);
    });

    it('should format amounts without negative sign handling', () => {
      mockLocalStorage.getItem.mockReturnValue('en');
      const result = formatCurrencySimple(1234.56);
      expect(result).toBe('$1234.56');
    });

    it('should format negative amounts without special handling', () => {
      mockLocalStorage.getItem.mockReturnValue('en');
      const result = formatCurrencySimple(-1234.56);
      expect(result).toBe('$-1234.56');
    });
  });
});
