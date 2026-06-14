/**
 * Formats a currency amount stored in the smallest unit (cents/paise) as a string.
 * @param {number} amount - Amount in smallest unit (e.g., 50000 for ₹500)
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string}
 */
export const formatCurrency = (amount, currency = "INR") => {
  const absoluteAmount = Math.abs(amount) / 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(absoluteAmount);

  // If the original amount was negative, prepend minus sign
  return amount < 0 ? `-${formatted}` : formatted;
};

/**
 * Formats a timestamp into a readable date string.
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
