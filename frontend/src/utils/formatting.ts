import { useLocale } from '../context/LocaleContext';

/**
 * Format currency based on user's locale
 */
export const formatCurrency = (amount: number, currency?: string): string => {
  const locale = currency === 'AUD' ? 'en-AU' : 'en-US';
  const currencyCode = currency || 'AUD';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Format date based on user's locale
 */
export const formatDate = (date: Date, locale: string = 'en-AU'): string => {
  const dateFormat = locale === 'en-AU' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Format time based on user's locale
 */
export const formatTime = (date: Date, locale: string = 'en-AU'): string => {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en-US',
  }).format(date);
};

/**
 * Format phone number based on country
 */
export const formatPhoneNumber = (phone: string, country: string): string => {
  // Basic formatting - can be enhanced with libphonenumber-js
  if (country === 'AU') {
    // Australian format: +61 X XXXX XXXX
    return phone.replace(/(\d{1})(\d{4})(\d{4})/, '+61 $1 $2 $3');
  } else if (country === 'US') {
    // US format: +1 (XXX) XXX-XXXX
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3');
  }
  return phone;
};

/**
 * Format address based on country format
 */
export const formatAddress = (
  street: string,
  city: string,
  state: string,
  postcode: string,
  country: string
): string => {
  if (country === 'AU') {
    // Australian format: Street, City State Postcode
    return `${street}, ${city} ${state} ${postcode}`;
  } else if (country === 'US') {
    // US format: Street, City, State Postcode
    return `${street}, ${city}, ${state} ${postcode}`;
  }
  return `${street}, ${city}, ${state} ${postcode}`;
};
