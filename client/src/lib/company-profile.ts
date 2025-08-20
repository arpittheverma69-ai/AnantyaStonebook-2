export interface CompanyProfile {
  companyName: string;
  companyTagline: string;
  companyAddressLines: string[];
  companyPhone: string;
  companyEmail: string;
  companyGstin: string;
  companyStateName: string;
  companyStateCode: string;
  companyTin: string;
  companyPan: string;
  buyerStateName: string;
  buyerStateCode: string;
  buyerTin: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
  deliveryNote: string;
  paymentTerms: string;
  referenceNumber: string;
  referenceDate: string;
  otherReferences: string;
  buyersOrderNumber: string;
  buyersOrderDate: string;
  dispatchDocNo: string;
  deliveryNoteDate: string;
  dispatchedThrough: string;
  destination: string;
  termsOfDelivery: string;
}

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: "ANANTYA STONEWORKS",
  companyTagline: "Premium Gemstone Solutions",
  companyAddressLines: ["123 Gemstone Plaza, Jewelry District", "Mumbai, Maharashtra - 400001"],
  companyPhone: "+91 98765 43210",
  companyEmail: "info@anantya.com",
  companyGstin: "27AABCA1234Z1Z5",
  companyStateName: "Maharashtra",
  companyStateCode: "27",
  companyTin: "09627100742",
  companyPan: "AABCA1234Z",
  buyerStateName: "Uttar Pradesh",
  buyerStateCode: "09",
  buyerTin: "098712342391",
  bankName: "HDFC Bank",
  bankAccount: "123456789012",
  bankIfsc: "HDFC0000123",
  bankBranch: "Fort Branch",
  deliveryNote: "DN-001",
  paymentTerms: "Net 30",
  referenceNumber: "REF-001",
  referenceDate: "2024-01-01",
  otherReferences: "OR-001",
  buyersOrderNumber: "-",
  buyersOrderDate: "-",
  dispatchDocNo: "-",
  deliveryNoteDate: "-",
  dispatchedThrough: "-",
  destination: "Mumbai",
  termsOfDelivery: "As discussed"
};

class CompanyProfileService {
  private storageKey = 'company-profile';

  get(): CompanyProfile {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load company profile from localStorage:', error);
    }
    return { ...DEFAULT_COMPANY_PROFILE };
  }

  update(updates: Partial<CompanyProfile>): void {
    try {
      const current = this.get();
      const updated = { ...current, ...updates };
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save company profile to localStorage:', error);
    }
  }

  save(profile: CompanyProfile): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save company profile to localStorage:', error);
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to reset company profile:', error);
    }
  }
}

export const companyProfileService = new CompanyProfileService();

export const companyUtils = {
  formatINR: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  },

  amountToWordsINR: (amount: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanOneThousand = (num: number): string => {
      if (num === 0) return '';

      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
      if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanOneThousand(num % 100) : '');
      
      return '';
    };

    const convert = (num: number): string => {
      if (num === 0) return 'Zero';
      if (num < 1000) return convertLessThanOneThousand(num);
      if (num < 100000) return convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanOneThousand(num % 1000) : '');
      if (num < 10000000) return convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convert(Math.floor(num / 1000) % 100) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanOneThousand(num % 1000) : '') : '');
      if (num < 1000000000) return convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convert(num % 10000000) : '');
      
      return 'Number too large';
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    
    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }
    result += ' Only';
    
    return result;
  },

  validateGSTIN: (gstin: string): boolean => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  },

  validatePAN: (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }
};
