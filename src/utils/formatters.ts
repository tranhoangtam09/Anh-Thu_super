/**
 * Currency & Number formatters for Vietnamese banking calculator
 */

export function formatVND(value: number | null | undefined, includeUnit: boolean = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return includeUnit ? '0 VND' : '0';
  }
  const rounded = Math.round(value);
  const isNegative = rounded < 0;
  const absStr = Math.abs(rounded).toString();
  // Standard Vietnamese financial format: dot (.) as thousands separator
  const formatted = absStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const result = isNegative ? `-${formatted}` : formatted;
  return includeUnit ? `${result} VND` : result;
}

export function parseFormattedNumber(str: string): number {
  // Strip non-digit characters except decimal dots/commas
  const cleaned = str.replace(/[^\d]/g, '');
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

export function formatRate(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

// Convert number to Vietnamese words (e.g. 50,000,000 -> Năm mươi triệu đồng)
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(n: number, showZeroHundred: boolean): string {
  const hundred = Math.floor(n / 100);
  const ten = Math.floor((n % 100) / 10);
  const unit = n % 10;
  let res = '';

  if (hundred > 0 || showZeroHundred) {
    res += DIGITS[hundred] + ' trăm ';
  }

  if (ten > 1) {
    res += DIGITS[ten] + ' mươi ';
    if (unit === 1) res += 'mốt ';
    else if (unit === 5) res += 'lăm ';
    else if (unit > 0) res += DIGITS[unit] + ' ';
  } else if (ten === 1) {
    res += 'mười ';
    if (unit === 5) res += 'lăm ';
    else if (unit > 0) res += DIGITS[unit] + ' ';
  } else if (ten === 0 && unit > 0) {
    if (hundred > 0 || showZeroHundred) {
      res += 'lẻ ' + DIGITS[unit] + ' ';
    } else {
      res += DIGITS[unit] + ' ';
    }
  }

  return res.trim();
}

export function numberToVietnameseWords(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return 'Không đồng';
  const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  
  let num = Math.round(amount);
  const parts: number[] = [];

  while (num > 0) {
    parts.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let words = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p > 0) {
      const showZero = i < parts.length - 1;
      const partWord = readThreeDigits(p, showZero);
      words += partWord + ' ' + UNITS[i] + ' ';
    }
  }

  words = words.trim() + ' đồng';
  // Capitalize first letter
  return words.charAt(0).toUpperCase() + words.slice(1);
}
