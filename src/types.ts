export interface ReferenceRateItem {
  id: string;
  termLabel: string;
  rate: number;
  months: number;
  defaultDays: number;
  group: string;
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
