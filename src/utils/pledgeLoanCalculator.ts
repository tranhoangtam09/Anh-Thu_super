import { RepaymentCycle, RoundingRule, PledgeRepaymentMethod, PledgeScheduleRow, PledgeCalculationResult } from '../types';

/**
 * Format Date to DD/MM/YYYY
 */
export function formatDateDDMMYYYY(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse YYYY-MM-DD to Date object at local midnight safely
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr || !dateStr.includes('-')) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m, d);
}

/**
 * Calculate maximum allowed loan term in DAYS between disbursement date and deposit maturity date
 * Theo Section 3 & 8: Thời hạn vay (ngày): tối đa bằng ngày đến hạn sổ tiết kiệm.
 */
export function calculateMaxAllowedDays(disbursementDateStr: string, maturityDateStr: string): number {
  const disb = parseDateString(disbursementDateStr);
  const mat = parseDateString(maturityDateStr);
  if (!disb || !mat || mat.getTime() <= disb.getTime()) return 0;

  const diffTime = mat.getTime() - disb.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate maximum allowed loan term in months (for reference)
 */
export function calculateMaxAllowedMonths(disbursementDateStr: string, maturityDateStr: string): number {
  const disb = parseDateString(disbursementDateStr);
  const mat = parseDateString(maturityDateStr);
  if (!disb || !mat || mat.getTime() <= disb.getTime()) return 0;

  let months = (mat.getFullYear() - disb.getFullYear()) * 12 + (mat.getMonth() - disb.getMonth());
  if (mat.getDate() < disb.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

/**
 * Get loan maturity date given disbursement date and loan term in days
 */
export function getLoanMaturityDate(disbursementDateStr: string, loanTermDays: number): { dateStr: string; dateObj: Date } {
  const disb = parseDateString(disbursementDateStr) || new Date();
  const targetDate = new Date(disb.getFullYear(), disb.getMonth(), disb.getDate() + loanTermDays);
  return {
    dateStr: formatDateDDMMYYYY(targetDate),
    dateObj: targetDate,
  };
}

/**
 * Calculate subsequent payment date given disbursement date, period index, cycle, and preferred repayment day
 */
export function getPaymentDateForPledge(
  disbursementDateStr: string,
  periodIndex: number, // 1..N
  cycleMonths: number,
  preferredRepaymentDay: number
): { dateStr: string; dateObj: Date } {
  const [yearStr, monthStr] = disbursementDateStr.split('-');
  const startYear = parseInt(yearStr, 10);
  const startMonthIndex = parseInt(monthStr, 10) - 1;

  // Repayment day clamped between 1 and 31
  const repDay = Math.min(31, Math.max(1, preferredRepaymentDay || 25));

  // Target month
  const totalMonths = startMonthIndex + periodIndex * cycleMonths;
  const targetYear = startYear + Math.floor(totalMonths / 12);
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12;

  // Maximum valid day in target month (e.g. Feb 28/29, April 30)
  const daysInTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  const actualDay = Math.min(repDay, daysInTargetMonth);

  const targetDate = new Date(targetYear, targetMonthIndex, actualDay);
  return {
    dateStr: formatDateDDMMYYYY(targetDate),
    dateObj: targetDate,
  };
}

export interface PledgeCalculationParams {
  depositAmount: number;
  depositOpenDate: string;
  depositMaturityDate: string;
  depositRate: number;
  currency: string;
  loanAmount: number;
  annualRate: number;
  disbursementDate: string;
  loanTermDays: number; // Thời hạn vay tính bằng ngày (Section 3: Thời hạn vay (ngày): tối đa bằng ngày đến hạn sổ)
  loanTermMonths?: number;
  repaymentMethod?: PledgeRepaymentMethod; // 'bullet' | 'declining'
  repaymentCycle?: RepaymentCycle;
  repaymentDay?: number;
  maxLtvRatio: number; // e.g. 95 for 95%
  roundingRule: RoundingRule;
}

/**
 * Core validation and calculation for Savings Book Pledge Loan
 */
export function calculatePledgeLoan(params: PledgeCalculationParams): PledgeCalculationResult {
  const {
    depositAmount,
    depositOpenDate,
    depositMaturityDate,
    depositRate,
    currency,
    loanAmount,
    annualRate,
    disbursementDate,
    loanTermDays,
    loanTermMonths,
    repaymentMethod = 'bullet',
    repaymentCycle = 'monthly',
    repaymentDay = 25,
    maxLtvRatio,
    roundingRule,
  } = params;

  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Calculate Maximum Loan Limit
  const effectiveLtvRatio = Math.max(1, Math.min(100, maxLtvRatio || 95));
  const maxLoanLimit = Math.round(depositAmount * (effectiveLtvRatio / 100));
  const isExceeded = loanAmount > maxLoanLimit;
  const exceededAmount = isExceeded ? loanAmount - maxLoanLimit : 0;

  // 2. Validate Inputs according to Section 8 of PDF (Kiểm tra dữ liệu và cảnh báo)
  // Tiêu chí 1: Chưa nhập số tiền vay hoặc số tiền vay <= 0
  if (!loanAmount || loanAmount <= 0) {
    errors.push('Chưa nhập số tiền vay hoặc số tiền vay ≤ 0 VNĐ.');
  }

  // Tiêu chí 2: Chưa nhập lãi suất hoặc lãi suất < 0
  if (annualRate === undefined || annualRate === null || isNaN(annualRate) || annualRate < 0) {
    errors.push('Chưa nhập lãi suất cho vay hoặc lãi suất < 0%/năm.');
  }

  // Tiêu chí 3: Chưa nhập thời hạn hoặc thời hạn <= 0 (thời hạn tính bằng ngày)
  if (!loanTermDays || loanTermDays <= 0) {
    errors.push('Chưa nhập thời hạn vay hoặc thời hạn vay ≤ 0 ngày.');
  }

  // Tiêu chí 4: Ngày giải ngân không hợp lệ
  const openD = parseDateString(depositOpenDate);
  const maturityD = parseDateString(depositMaturityDate);
  const disbD = parseDateString(disbursementDate);

  if (!disbD || isNaN(disbD.getTime())) {
    errors.push('Ngày giải ngân không hợp lệ.');
  }

  // Tiêu chí 5: Ngày đáo hạn sổ tiết kiệm không phù hợp
  if (!maturityD || isNaN(maturityD.getTime())) {
    errors.push('Ngày đáo hạn sổ tiết kiệm không hợp lệ.');
  } else {
    if (openD && maturityD.getTime() <= openD.getTime()) {
      errors.push('Ngày đáo hạn sổ tiết kiệm không phù hợp (phải sau ngày mở sổ).');
    }
    if (disbD && maturityD.getTime() < disbD.getTime()) {
      errors.push('Ngày đáo hạn sổ tiết kiệm không phù hợp (không được trước ngày giải ngân).');
    }
  }

  // Tính số ngày tối đa cho phép từ ngày giải ngân đến ngày đến hạn sổ tiết kiệm
  const maxAllowedDays = disbD && maturityD ? calculateMaxAllowedDays(disbursementDate, depositMaturityDate) : 0;

  // Tiêu chí 7: Thời hạn vay vượt thời gian cho phép của sổ tiết kiệm
  if (disbD && maturityD && loanTermDays > 0) {
    const { dateStr: loanMaturityDateStr, dateObj: loanEndDate } = getLoanMaturityDate(disbursementDate, loanTermDays);
    if (loanTermDays > maxAllowedDays || loanEndDate.getTime() > maturityD.getTime()) {
      errors.push(
        `Thời hạn vay (${loanTermDays} ngày, đáo hạn ngày ${loanMaturityDateStr}) vượt thời gian cho phép của sổ tiết kiệm (tối đa ${maxAllowedDays} ngày, đáo hạn sổ ngày ${formatDateDDMMYYYY(
          maturityD
        )}).`
      );
    }
  }

  // Tiêu chí 6: Số tiền vay vượt hạn mức
  if (isExceeded && depositAmount > 0) {
    errors.push(
      `Số tiền vay (${new Intl.NumberFormat('vi-VN').format(
        loanAmount
      )} VNĐ) vượt quá hạn mức tối đa cho phép (${new Intl.NumberFormat('vi-VN').format(
        maxLoanLimit
      )} VNĐ - ${effectiveLtvRatio}% giá trị sổ). Không thể tạo lịch trả nợ.`
    );
  }

  // Kiểm tra số tiền sổ tiết kiệm
  if (!depositAmount || depositAmount <= 0) {
    errors.push('Vui lòng nhập số tiền trên sổ tiết kiệm lớn hơn 0 VNĐ.');
  }

  // Calculate loan maturity date
  const { dateStr: computedLoanMaturityDate } = disbD && loanTermDays > 0
    ? getLoanMaturityDate(disbursementDate, loanTermDays)
    : { dateStr: '-' };

  // Early return if invalid or exceeded - do NOT generate schedule (Section 4 & 8)
  if (errors.length > 0) {
    return {
      loanAmount: loanAmount || 0,
      depositAmount: depositAmount || 0,
      maxLtvRatio: effectiveLtvRatio,
      maxLoanLimit,
      loanTermDays: loanTermDays || 0,
      loanTermMonths: loanTermMonths || Math.round((loanTermDays || 0) / 30),
      loanMaturityDate: computedLoanMaturityDate,
      annualRate: annualRate || 0,
      periodRatePercent: 0,
      disbursementDate,
      depositOpenDate,
      depositMaturityDate,
      depositRate: depositRate || 0,
      currency: currency || 'VND',
      repaymentMethod,
      repaymentCycle,
      repaymentDay: repaymentDay || 25,
      roundingRule,
      totalPeriods: 0,
      schedule: [],
      firstPeriodPayment: 0,
      totalPrincipal: 0,
      totalInterest: 0,
      totalRepayment: 0,
      finalBalance: 0,
      isExceeded,
      exceededAmount,
      validationErrors: errors,
      validationWarnings: warnings,
    };
  }

  // Rounding helper function (Section 6)
  const roundValue = (val: number): number => {
    if (roundingRule === 'thousand') {
      return Math.round(val / 1000) * 1000;
    }
    return Math.round(val);
  };

  // =========================================================================
  // Case A: Trả một lần vào ngày đến hạn khoản vay (Gốc & Lãi cuối kỳ - Section 3 & 5 Mặc định)
  // Tiền lãi tính theo số ngày vay thực tế: Số tiền vay × (Lãi suất/100) × (Số ngày vay / 365)
  // =========================================================================
  if (repaymentMethod === 'bullet') {
    const rawInterest = loanAmount * (annualRate / 100) * (loanTermDays / 365);
    const bulletInterest = roundValue(rawInterest);
    const totalRepay = loanAmount + bulletInterest;

    const bulletSchedule: PledgeScheduleRow[] = [
      {
        period: 1,
        paymentDate: computedLoanMaturityDate,
        beginningBalance: loanAmount,
        principalPaid: loanAmount,
        interestPaid: bulletInterest,
        totalPaid: totalRepay,
        endingBalance: 0,
      },
    ];

    return {
      loanAmount,
      depositAmount,
      maxLtvRatio: effectiveLtvRatio,
      maxLoanLimit,
      loanTermDays,
      loanTermMonths: loanTermMonths || Math.round(loanTermDays / 30),
      loanMaturityDate: computedLoanMaturityDate,
      annualRate,
      periodRatePercent: annualRate * (loanTermDays / 365),
      disbursementDate,
      depositOpenDate,
      depositMaturityDate,
      depositRate,
      currency,
      repaymentMethod: 'bullet',
      repaymentCycle,
      repaymentDay,
      roundingRule,
      totalPeriods: 1,
      schedule: bulletSchedule,
      firstPeriodPayment: totalRepay,
      totalPrincipal: loanAmount,
      totalInterest: bulletInterest,
      totalRepayment: totalRepay,
      finalBalance: 0,
      isExceeded: false,
      exceededAmount: 0,
      validationErrors: [],
      validationWarnings: [],
    };
  }

  // =========================================================================
  // Case B: Trả gốc đều, lãi trên dư nợ giảm dần (Section 5)
  // =========================================================================
  let divisor = 12;
  let cycleMonths = 1;
  switch (repaymentCycle) {
    case 'quarterly':
      divisor = 4;
      cycleMonths = 3;
      break;
    case 'semiAnnual':
      divisor = 2;
      cycleMonths = 6;
      break;
    case 'annual':
      divisor = 1;
      cycleMonths = 12;
      break;
    case 'monthly':
    default:
      divisor = 12;
      cycleMonths = 1;
      break;
  }

  // Calculate total periods based on loan term in days (roughly ~30 days per month)
  const approxMonths = Math.max(1, Math.round(loanTermDays / 30.4375));
  const totalPeriods = Math.max(1, Math.ceil(approxMonths / cycleMonths));

  // Period interest rate
  const periodRate = annualRate / 100 / divisor;
  const periodRatePercent = annualRate / divisor;

  // Base principal per period = Số tiền vay / Tổng số kỳ
  const rawPrincipalPerPeriod = loanAmount / totalPeriods;
  const standardPrincipal = roundValue(rawPrincipalPerPeriod);

  // Generate schedule table
  const schedule: PledgeScheduleRow[] = [];
  let currentBeginning = loanAmount;
  let accumulatedPrincipal = 0;
  let totalInterest = 0;

  for (let k = 1; k <= totalPeriods; k++) {
    let dateStr = '';
    if (k === totalPeriods) {
      // Kỳ cuối cùng luôn rơi vào ngày đến hạn khoản vay
      dateStr = computedLoanMaturityDate;
    } else {
      const pDate = getPaymentDateForPledge(
        disbursementDate,
        k,
        cycleMonths,
        repaymentDay
      );
      dateStr = pDate.dateStr;
    }

    // Interest for this period = Beginning balance * periodRate
    const rawInterest = currentBeginning * periodRate;
    const interestThisPeriod = roundValue(rawInterest);

    let principalThisPeriod: number;

    if (k === totalPeriods) {
      // Final period: adjust to ensure sum of principal equals exact initial loan amount
      // and ending balance is strictly 0 (Section 6)
      principalThisPeriod = currentBeginning;
    } else {
      principalThisPeriod = Math.min(standardPrincipal, currentBeginning);
    }

    const endingBalance = Math.max(0, currentBeginning - principalThisPeriod);
    const totalThisPeriod = principalThisPeriod + interestThisPeriod;

    accumulatedPrincipal += principalThisPeriod;
    totalInterest += interestThisPeriod;

    schedule.push({
      period: k,
      paymentDate: dateStr,
      beginningBalance: currentBeginning,
      principalPaid: principalThisPeriod,
      interestPaid: interestThisPeriod,
      totalPaid: totalThisPeriod,
      endingBalance: endingBalance,
    });

    // Next period beginning balance is previous ending balance
    currentBeginning = endingBalance;
  }

  const totalPrincipal = accumulatedPrincipal;
  const totalRepayment = totalPrincipal + totalInterest;
  const firstPeriodPayment = schedule.length > 0 ? schedule[0].totalPaid : 0;
  const finalBalance = schedule.length > 0 ? schedule[schedule.length - 1].endingBalance : 0;

  return {
    loanAmount,
    depositAmount,
    maxLtvRatio: effectiveLtvRatio,
    maxLoanLimit,
    loanTermDays,
    loanTermMonths: approxMonths,
    loanMaturityDate: computedLoanMaturityDate,
    annualRate,
    periodRatePercent,
    disbursementDate,
    depositOpenDate,
    depositMaturityDate,
    depositRate,
    currency,
    repaymentMethod: 'declining',
    repaymentCycle,
    repaymentDay: repaymentDay || 25,
    roundingRule,
    totalPeriods,
    schedule,
    firstPeriodPayment,
    totalPrincipal,
    totalInterest,
    totalRepayment,
    finalBalance,
    isExceeded: false,
    exceededAmount: 0,
    validationErrors: [],
    validationWarnings: [],
  };
}
