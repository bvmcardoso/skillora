export function fmtInt(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '-';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export function fmtNumber(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(n)) return '-';
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function fmtCurrency(
  n: number | null | undefined,
  currency: string = 'USD',
  locale?: string
) {
  if (n == null || Number.isNaN(n)) return '-';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
