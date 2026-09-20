export interface ReferenceRateItem {
  id: string;
  termLabel: string;
  rate: number;
  months: number;
  defaultDays: number;
  group: string;
}

export type RepaymentCycle = 'monthly' | 'quarterly' | 'semiAnnual' | 'annual';
export type RoundingRule = 'dong' | 'thousand';

export interface LoanScheduleRow {
  period: number;             // 0 for disbursement, 1..N
  paymentDate: string;        // DD/MM/YYYY
  remainingPrincipal: number; // Số gốc còn lại
  principalPaid: number;      // Gốc trả kỳ này
  interestPaid: number;       // Lãi trả kỳ này
  totalPaid: number;          // Tổng Gốc + Lãi kỳ này
}

export interface LoanCalculationResult {
  loanAmount: number;
  propertyValue?: number;
  loanTermMonths: number;
  annualRate: number;
  periodRatePercent: number;
  disbursementDate: string;
  repaymentCycle: RepaymentCycle;
  repaymentDay: number;
  totalPeriods: number;
  schedule: LoanScheduleRow[];
  firstPeriodPayment: number;
  lastPeriodPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  inWords: string;
}

export interface CalculationInput {
  depositAmount: number | null;
  termId: string;
  customRate: number | null;
  startDate: string;
  calculationMethod: 'standard' | 'actualDays';
}

export interface CalculationResult {
  depositAmount: number;
  interestEarned: number;
  totalPayout: number;
  termLabel: string;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  actualDays: number;
  months: number;
  monthlyInterest: number;
  dailyInterest: number;
  inWords: string;
}

export interface ValidationErrors {
  depositAmount?: string;
  term?: string;
  interestRate?: string;
}

export interface ValidationWarnings {
  depositAmount?: string;
  interestRate?: string;
}

export interface ContentData {
  media: {
    logo: string;
  };
  header: {
    badge: string;
    title: string;
    subtitle: string;
  };
  calculator: {
    depositSectionTitle: string;
    resultSectionTitle: string;
    labels: {
      depositAmount: string;
      term: string;
      interestRate: string;
      interestEarned: string;
      totalPayout: string;
      termPlaceholder: string;
      currencyUnit: string;
      rateUnit: string;
      startDate: string;
      maturityDate: string;
      actualDays: string;
      calculationMethod: string;
      methodStandard: string;
      methodActualDays: string;
    };
    quickAmounts: Array<{ label: string; value: number }>;
    quickPresets: Array<{ label: string; amount: number; termId: string }>;
    validation: {
      amountRequired: string;
      amountInvalid: string;
      amountMinWarning: string;
      termRequired: string;
      rateRequired: string;
      rateInvalid: string;
      rateCapWarning: string;
    };
    formulaExplanation: {
      title: string;
      formula: string;
      note: string;
    };
    summaryDetails: {
      principalTitle: string;
      interestTitle: string;
      monthlyEquivalentTitle: string;
      dailyEquivalentTitle: string;
      maturityText: string;
      inWordsLabel: string;
    };
    actions: {
      reset: string;
      copyResult: string;
      copied: string;
      viewReferenceTable: string;
      hideReferenceTable: string;
    };
  };
  rules: {
    title: string;
    subtitle: string;
    items: Array<{
      category: string;
      requirements: string[];
      suggestedError: string;
    }>;
  };
  referenceRates: {
    title: string;
    subtitle: string;
    columnHeaders: {
      term: string;
      rate: string;
      action: string;
    };
    searchPlaceholder: string;
    data: ReferenceRateItem[];
  };
  footer: {
    disclaimer: string;
    regulatoryNote: string;
  };
}

export type ForexTransactionType = 'cashBuy' | 'transferBuy' | 'sell';

export interface ForexCurrencyItem {
  code: string;
  name: string;
  flag: string;
  cashCheckStar?: number;
  cashCheckAmp?: number;
  cashCheck?: number | null;
  transfer: number;
  sell: number;
}

export interface GoldRateItem {
  updatedAt: string;
  organization: string;
  goldType: string;
  weight: string;
  buyPrice: string;
  sellPrice: string;
  unit: string;
}

export type PledgeRepaymentMethod = 'declining' | 'bullet';

export interface PledgeScheduleRow {
  period: number;
  paymentDate: string;
  beginningBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  endingBalance: number;
}

export interface PledgeCalculationResult {
  loanAmount: number;
  depositAmount: number;
  maxLtvRatio: number;
  maxLoanLimit: number;
  loanTermDays: number;
  loanTermMonths?: number;
  loanMaturityDate: string;
  annualRate: number;
  periodRatePercent: number;
  disbursementDate: string;
  depositOpenDate: string;
  depositMaturityDate: string;
  depositRate: number;
  currency: string;
  repaymentMethod: PledgeRepaymentMethod;
  repaymentCycle: RepaymentCycle;
  repaymentDay: number;
  roundingRule: RoundingRule;
  totalPeriods: number;
  schedule: PledgeScheduleRow[];
  firstPeriodPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  finalBalance: number;
  isExceeded: boolean;
  exceededAmount: number;
  validationErrors: string[];
  validationWarnings: string[];
}
