import { RepaymentCycle, RoundingRule, LoanScheduleRow, LoanCalculationResult } from '../types';
import { numberToVietnameseWords } from './formatters';

/**
 * Format a Date object to DD/MM/YYYY
 */
export function formatDateDDMMYYYY(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculate subsequent payment date given disbursement date, cycle, and preferred repayment day
 */
export function getPaymentDateForPeriod(
  disbursementDateStr: string,
  periodIndex: number, // 1..N
  cycleMonths: number,
  preferredRepaymentDay?: number
): string {
  const [yearStr, monthStr, dayStr] = disbursementDateStr.split('-');
  const startYear = parseInt(yearStr, 10);
  const startMonthIndex = parseInt(monthStr, 10) - 1;
  const startDay = parseInt(dayStr, 10);

  const repDay = preferredRepaymentDay && preferredRepaymentDay >= 1 && preferredRepaymentDay <= 31
    ? preferredRepaymentDay
    : startDay;

  // Calculate target month
  const totalMonths = startMonthIndex + periodIndex * cycleMonths;
  const targetYear = startYear + Math.floor(totalMonths / 12);
  const targetMonthIndex = totalMonths % 12;

  // Find max days in target month
  const daysInTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  const actualDay = Math.min(repDay, daysInTargetMonth);

  const targetDate = new Date(targetYear, targetMonthIndex, actualDay);
  return formatDateDDMMYYYY(targetDate);
}

/**
 * Trả gốc đều, lãi tính trên dư nợ giảm dần
 * Theo quy chuẩn nghiệp vụ ngân hàng VietinBank
 */
export function calculateLoanReducingBalance(
  loanAmount: number,
  loanTermMonths: number,
  annualInterestRate: number,
  disbursementDate: string,
  repaymentCycle: RepaymentCycle = 'monthly',
  preferredRepaymentDay?: number,
  roundingRule: RoundingRule = 'dong',
  propertyValue?: number
): LoanCalculationResult {
  // 1. Determine cycle divisor and months per period
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

  // 2. Total periods
  const totalPeriods = Math.max(1, Math.ceil(loanTermMonths / cycleMonths));

  // 3. Period rate
  const periodRate = (annualInterestRate / 100) / divisor;
  const periodRatePercent = annualInterestRate / divisor;

  // 4. Principal per period base
  const rawPrincipalPerPeriod = loanAmount / totalPeriods;
  let standardPrincipalPaid: number;
  if (roundingRule === 'thousand') {
    standardPrincipalPaid = Math.round(rawPrincipalPerPeriod / 1000) * 1000;
  } else {
    standardPrincipalPaid = Math.round(rawPrincipalPerPeriod);
  }

  // 5. Parse disbursement date for period 0
  const [dYear, dMonth, dDay] = disbursementDate.split('-').map(Number);
  const disbDateObj = new Date(dYear, dMonth - 1, dDay);
  const disbDateFormatted = formatDateDDMMYYYY(disbDateObj);

  const schedule: LoanScheduleRow[] = [];

  // Period 0: Ngày giải ngân
  schedule.push({
    period: 0,
    paymentDate: disbDateFormatted,
    remainingPrincipal: loanAmount,
    principalPaid: 0,
    interestPaid: 0,
    totalPaid: 0,
  });

  let currentBalance = loanAmount;
  let totalInterestAccumulated = 0;
  let totalPrincipalAccumulated = 0;

  for (let k = 1; k <= totalPeriods; k++) {
    const paymentDate = getPaymentDateForPeriod(
      disbursementDate,
      k,
      cycleMonths,
      preferredRepaymentDay || dDay
    );

    // Dư nợ đầu kỳ
    const beginningBalance = currentBalance;

    // Gốc trả kỳ này
    let principalPaid: number;
    if (k === totalPeriods) {
      // Sai lệch do làm tròn được điều chỉnh vào kỳ trả nợ cuối cùng
      principalPaid = beginningBalance;
    } else {
      principalPaid = Math.min(standardPrincipalPaid, beginningBalance);
    }

    // Lãi kỳ hiện tại = Dư nợ đầu kỳ × Lãi suất kỳ
    const rawInterest = beginningBalance * periodRate;
    let interestPaid: number;
    if (roundingRule === 'thousand') {
      interestPaid = Math.round(rawInterest / 1000) * 1000;
    } else {
      interestPaid = Math.round(rawInterest);
    }

    // Tổng tiền trả kỳ = Gốc kỳ + Lãi kỳ
    const totalPaid = principalPaid + interestPaid;

    // Dư nợ cuối kỳ = Dư nợ đầu kỳ - Gốc đã trả trong kỳ
    currentBalance = Math.max(0, beginningBalance - principalPaid);

    totalPrincipalAccumulated += principalPaid;
    totalInterestAccumulated += interestPaid;

    schedule.push({
      period: k,
      paymentDate,
      remainingPrincipal: beginningBalance,
      principalPaid,
      interestPaid,
      totalPaid,
    });
  }

  const firstPeriodRow = schedule[1];
  const lastPeriodRow = schedule[schedule.length - 1];

  const firstPeriodPayment = firstPeriodRow ? firstPeriodRow.totalPaid : 0;
  const lastPeriodPayment = lastPeriodRow ? lastPeriodRow.totalPaid : 0;
  const totalRepayment = totalPrincipalAccumulated + totalInterestAccumulated;

  return {
    loanAmount,
    propertyValue,
    loanTermMonths,
    annualRate: annualInterestRate,
    periodRatePercent,
    disbursementDate,
    repaymentCycle,
    repaymentDay: preferredRepaymentDay || dDay,
    totalPeriods,
    schedule,
    firstPeriodPayment,
    lastPeriodPayment,
    totalPrincipal: totalPrincipalAccumulated,
    totalInterest: totalInterestAccumulated,
    totalRepayment,
    inWords: numberToVietnameseWords(totalRepayment),
  };
}
