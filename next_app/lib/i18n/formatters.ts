/**
 * Formats currency according to the Indian numbering system.
 * It safely falls back to 'en-IN' to maintain ₹ 1,00,000.00 formatting,
 * while allowing the currency symbol/position to respect local conventions.
 */
export const formatCurrency = (amount: number, locale: string = 'en-IN') => {
  return new Intl.NumberFormat(locale === 'ur' ? 'ur-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};
