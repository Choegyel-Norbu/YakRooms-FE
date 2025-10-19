/**
 * BankType enum for Bhutanese banks
 * Contains all major banks and financial institutions in Bhutan
 */

export const BankType = {
  // Commercial Banks
  BOB: {
    code: "BOB",
    name: "Bank of Bhutan",
    shortName: "BOB"
  },
  BNB: {
    code: "BNB", 
    name: "Bhutan National Bank",
    shortName: "BNB"
  },
  DPNB: {
    code: "DPNB",
    name: "Druk PNB Bank", 
    shortName: "DPNB"
  },
  
  // Development Finance Institutions
  BDB: {
    code: "BDB",
    name: "Bhutan Development Bank",
    shortName: "BDB"
  },
  
  // Mobile Financial Services
  TBANK: {
    code: "TBANK",
    name: "T-Bank (Tashi InfoComm)",
    shortName: "T-Bank"
  },
  DKBANK: {
    code: "DKBANK",
    name: "Druk Khang Bank",
    shortName: "DKBANK"
  },
  
  // Other/Unknown
  OTHER: {
    code: "OTHER",
    name: "Other Bank",
    shortName: "Other"
  }
};

/**
 * Get all bank options for select dropdowns
 * @returns {Array} Array of bank objects with value, label, and description
 */
export const getBankOptions = () => {
  return Object.values(BankType).map(bank => ({
    value: bank.code,
    label: bank.name,
    description: bank.shortName
  }));
};

/**
 * Get bank name by code
 * @param {string} code - Bank code
 * @returns {string} Bank name or "Unknown Bank" if not found
 */
export const getBankNameByCode = (code) => {
  const bank = Object.values(BankType).find(b => b.code === code);
  return bank ? bank.name : "Unknown Bank";
};

/**
 * Get bank short name by code
 * @param {string} code - Bank code
 * @returns {string} Bank short name or "Unknown" if not found
 */
export const getBankShortNameByCode = (code) => {
  const bank = Object.values(BankType).find(b => b.code === code);
  return bank ? bank.shortName : "Unknown";
};

export default BankType;
