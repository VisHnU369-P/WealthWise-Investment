export function formatCurrency(value, currency = 'USD') {
  const number = Number(value || 0)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(number)
}

export function formatPercent(value) {
  const number = Number(value || 0)
  return `${(number * 100).toFixed(2)}%`
}

