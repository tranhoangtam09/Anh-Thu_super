import { ReferenceRateItem, CalculationResult, ValidationErrors, ValidationWarnings } from '../types';
import { numberToVietnameseWords } from './formatters';

export const MIN_DEPOSIT_RECOMMENDED = 1000000; // 1,000,000 VND
export const MAX_RATE_CEILING = 15.0; // 15% / year warning ceiling

export function calculateMaturityDate(startDateStr: string, months: number, daysOverride?: number): { maturityDate: string; actualDays: number } {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) {
    const today = new Date();
    return {
      maturityDate: today.toISOString().split('T')[0],
      actualDays: 30,
    };
  }

  const maturity = new Date(start);
  if (months === 0 || months === 0.5) {
    const daysToAdd = daysOverride || (months === 0 ? 30 : 14);
    maturity.setDate(maturity.getDate() + daysToAdd);
  } else {
    // Add months directly, preserving day where possible
    const currentDay = maturity.getDate();
    maturity.setMonth(maturity.getMonth() + months);
    // Handle month-end overflow
    if (maturity.getDate() !== currentDay) {
      maturity.setDate(0);
    }
  }

  const diffTime = Math.abs(maturity.getTime() - start.getTime());
  const actualDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const yyyy = maturity.getFullYear();
  const mm = String(maturity.getMonth() + 1).padStart(2, '0');
  const dd = String(maturity.getDate()).padStart(2, '0');

  return {
    maturityDate: `${yyyy}-${mm}-${dd}`,
    actualDays,
  };
}

export function validateCalculationInputs(
  amount: number | null,
  termItem: ReferenceRateItem | undefined,
  rate: number | null
): { errors: ValidationErrors; warnings: ValidationWarnings; isValid: boolean } {
  const errors: ValidationErrors = {};
  const warnings: ValidationWarnings = {};

  // 1. Validate Số tiền gửi
  if (amount === null || isNaN(amount) || amount === 0) {
    errors.depositAmount = 'Vui lòng nhập số tiền gửi hợp lệ.';
  } else if (amount < 0) {
    errors.depositAmount = 'Vui lòng nhập số tiền gửi hợp lệ.';
  } else if (amount < MIN_DEPOSIT_RECOMMENDED) {
    warnings.depositAmount = 'Cảnh báo: Số tiền gửi tối thiểu theo quy định thông thường là 1.000.000 VND.';
  }

  // 2. Validate Kỳ hạn gửi
  if (!termItem) {
    errors.term = 'Vui lòng chọn kỳ hạn gửi.';
  }

  // 3. Validate Lãi suất
  if (rate === null || isNaN(rate)) {
    errors.interestRate = 'Vui lòng nhập lãi suất hợp lệ.';
  } else if (rate < 0) {
    errors.interestRate = 'Vui lòng nhập lãi suất hợp lệ.';
  } else if (rate > MAX_RATE_CEILING) {
    warnings.interestRate = `Cảnh báo: Lãi suất vượt quá mức trần cảnh báo (${MAX_RATE_CEILING}%/năm).`;
  }

  const isValid = Object.keys(errors).length === 0;

  return { errors, warnings, isValid };
}

export function calculateDepositInterest(
  amount: number,
  termItem: ReferenceRateItem,
  rate: number,
  startDateStr: string,
  method: 'standard' | 'actualDays' = 'standard'
): CalculationResult {
  const { maturityDate, actualDays } = calculateMaturityDate(startDateStr, termItem.months, termItem.defaultDays);

  let interest = 0;

  if (method === 'standard' && termItem.months >= 1) {
    // Standard monthly convention: (P * r% * months) / 12
    interest = (amount * (rate / 100) * termItem.months) / 12;
  } else {
    // Official Circular 14/2017/TT-NHNN: (P * r% * actualDays) / 365
    interest = (amount * (rate / 100) * actualDays) / 365;
  }

  const interestEarned = Math.round(interest);
  const totalPayout = amount + interestEarned;

  const durationMonths = termItem.months > 0 ? termItem.months : (actualDays / 30);
  const monthlyInterest = durationMonths > 0 ? Math.round(interestEarned / durationMonths) : interestEarned;
  const dailyInterest = actualDays > 0 ? Math.round(interestEarned / actualDays) : 0;

  return {
    depositAmount: amount,
    interestEarned,
    totalPayout,
    termLabel: termItem.termLabel,
    interestRate: rate,
    startDate: startDateStr,
    maturityDate,
    actualDays,
    months: termItem.months,
    monthlyInterest,
    dailyInterest,
    inWords: numberToVietnameseWords(totalPayout),
  };
}
