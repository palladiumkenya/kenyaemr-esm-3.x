# Currency Localization

This module provides locale-based currency formatting for the billing application. It automatically detects the user's locale and formats currency amounts accordingly.

## Features

- **Locale-based currency mapping**: Automatically maps locales to appropriate currencies
- **Configurable currency mapping**: Supports custom currency mappings via configuration
- **Consistent formatting**: Provides standardized currency formatting across the application
- **Fallback support**: Gracefully handles unknown locales with sensible defaults

## Supported Locales and Currencies

| Locale | Currency | Description |
|--------|----------|-------------|
| `en` | KES | English - Kenyan Shilling |
| `sw` | KES | Swahili - Kenyan Shilling |
| `am` | ETB | Amharic - Ethiopian Birr |
| `en-KE` | KES | English Kenya |
| `sw-KE` | KES | Swahili Kenya |
| `am-ET` | ETB | Amharic Ethiopia |

## Usage

### Basic Currency Formatting

```typescript
import { formatCurrency, formatCurrencySimple } from './helpers/currency';

// Format with negative sign handling
const amount = formatCurrency(1234.56); // Returns: "KSh 1,234.56"

// Format without negative sign handling
const simpleAmount = formatCurrencySimple(1234.56); // Returns: "KSh 1,234.56"
```

### Using the Hook (with config support)

```typescript
import { useCurrencyFormatting } from './helpers/currency';

const MyComponent = () => {
  const { format, formatSimple, getCurrency, getLocale } = useCurrencyFormatting();
  
  const amount = format(1234.56);
  const currency = getCurrency(); // Returns current currency code
  
  return <div>Amount: {amount}</div>;
};
```

### Direct Currency/Locale Access

```typescript
import { getCurrencyForLocale, getCurrentLocale } from './helpers/currency';

const currency = getCurrencyForLocale(); // Returns: "KES", "ETB", etc.
const locale = getCurrentLocale(); // Returns: "en", "sw", "am", etc.
```

## Configuration

You can customize the locale-to-currency mapping by adding a `localeCurrencyMapping` configuration to your billing config:

```json
{
  "localeCurrencyMapping": {
    "en": "USD",
    "sw": "KES", 
    "am": "ETB",
    "fr": "EUR"
  }
}
```

## Functions

### `formatCurrency(amount, options?)`
Formats a number as currency with negative sign handling.

**Parameters:**
- `amount` (number): The amount to format
- `options` (Intl.NumberFormatOptions, optional): Additional formatting options

**Returns:** Formatted currency string

### `formatCurrencySimple(amount, options?)`
Formats a number as currency without negative sign handling.

**Parameters:**
- `amount` (number): The amount to format
- `options` (Intl.NumberFormatOptions, optional): Additional formatting options

**Returns:** Formatted currency string

### `getCurrencyForLocale()`
Gets the currency code for the current locale.

**Returns:** Currency code string (e.g., "KES", "ETB")

### `getCurrentLocale()`
Gets the current locale from localStorage.

**Returns:** Locale string (e.g., "en", "sw", "am")

### `useCurrencyFormatting()`
React hook that provides currency formatting with config support.

**Returns:** Object with formatting functions and utilities

## Migration from Hardcoded Currency

If you have existing code using hardcoded currency formatting, replace it with the new utilities:

**Before:**
```typescript
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KES',
}).format(amount);
```

**After:**
```typescript
import { formatCurrency } from './helpers/currency';

const formattedAmount = formatCurrency(amount);
```

## Testing

Run the currency utility tests:

```bash
npm test -- currency.test.ts
```

## Examples

### In Components

```typescript
import React from 'react';
import { formatCurrency } from './helpers/currency';

const BillItem = ({ price, quantity }) => {
  const total = price * quantity;
  
  return (
    <div>
      <span>Price: {formatCurrency(price)}</span>
      <span>Total: {formatCurrency(total)}</span>
    </div>
  );
};
```

### In Utilities

```typescript
import { formatCurrencySimple } from './helpers/currency';

export const createReceipt = (items) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  return {
    items: items.map(item => ({
      ...item,
      formattedPrice: formatCurrencySimple(item.price)
    })),
    total: formatCurrency(total)
  };
};
``` 