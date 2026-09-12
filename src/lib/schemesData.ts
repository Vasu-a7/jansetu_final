export interface Scheme {
  id: string;
  title: string;
  hindiTitle: string;
  department: string;
  category: "Housing" | "Women Welfare" | "Agriculture & Farmers" | "Education & Youth" | "Healthcare" | "Employment & Workers" | "Tribal Welfare" | "Social Security";
  targetAudience: Array<"farmers" | "students" | "women" | "seniors" | "tribal" | "workers" | "entrepreneurs" | "pwd">;
  eligibilitySummary: string;
  benefits: string;
  requiredDocuments: string[];
  officialUrl: string;
  verifiedDate: string;
  applicationMode: "Online" | "Offline at Block Office" | "Panchayat Camp";
}

export const VERIFIED_GOVT_SCHEMES: Scheme[] = [
  {
    id: "abua-awas-yojana",
    title: "Abua Awas Yojana (Jharkhand Housing Mission)",
    hindiTitle: "अबुआ आवास योजना (झारखंड फ्लैगशिप आवास स्कीम)",
    department: "Rural Development Department, Govt of Jharkhand",
    category: "Housing",
    targetAudience: ["women", "farmers", "tribal", "workers"],
    eligibilitySummary: "Families residing in kutcha or temporary houses not covered under PM Awas Yojana. Annual family income below ₹3 Lakh.",
    benefits: "Financial assistance of ₹2 Lakh in 4 installments to construct a 3-room permanent house with hygienic kitchen.",
    requiredDocuments: [
      "Aadhaar Card of Applicant (Preferably Female Head)",
      "Jharkhand Residential Certificate (Domicile)",
      "Bank Account Details linked with Aadhaar",
      "Income Certificate from Circle Officer (CO)",
      "Ration Card Copy",
    ],
    officialUrl: "https://aay.jharkhand.gov.in",
    verifiedDate: "2025-05-01",
    applicationMode: "Panchayat Camp",
  },
  {
    id: "mukhyamantri-maiyee-samman",
    title: "Jharkhand Mukhyamantri Maiyee Samman Yojana",
    hindiTitle: "झारखंड मुख्यमंत्री मइयां सम्मान योजना",
    department: "Women, Child Development & Social Security Dept",
    category: "Women Welfare",
    targetAudience: ["women"],
    eligibilitySummary: "Women citizens of Jharkhand aged 21 to 50 years with valid domicile certificate and active bank account.",
    benefits: "Direct Benefit Transfer (DBT) of ₹1,000 per month directly deposited into beneficiary bank account.",
    requiredDocuments: [
      "Aadhaar Card",
      "Jharkhand Domicile Certificate",
      "Bank Passbook with IFSC Code",
      "Single Self-Declaration Form",
      "Ration Card",
    ],
    officialUrl: "https://mmmsy.jharkhand.gov.in",
    verifiedDate: "2025-05-01",
    applicationMode: "Online",
  },
  {
    id: "guruji-student-credit-card",
    title: "Guruji Student Credit Card Scheme",
    hindiTitle: "गुरुजी स्टूडेंट क्रेडिट कार्ड योजना",
    department: "Higher and Technical Education Dept, Jharkhand",
    category: "Education & Youth",
    targetAudience: ["students"],
    eligibilitySummary: "Jharkhand domicile students passing Class 10/12 securing admission in recognized higher education institutes.",
    benefits: "Low-interest collateral-free loan up to ₹15 Lakh for higher studies with only 4% simple interest rate.",
    requiredDocuments: [
      "Class 10th & 12th Marksheets",
      "Admission Slip / Bonafide Certificate from College",
      "Domicile Certificate of Jharkhand",
      "Aadhaar Card & Co-borrower (Parent) Pan Card",
    ],
    officialUrl: "https://gscc.jharkhand.gov.in",
    verifiedDate: "2025-05-01",
    applicationMode: "Online",
  },
  {
    id: "birsa-harit-gram",
    title: "Birsa Harit Gram Yojana (Agro-Forestry & Orchard Scheme)",
    hindiTitle: "बिरसा हरित ग्राम योजना",
    department: "Rural Development & MGNREGA Jharkhand",
    category: "Agriculture & Farmers",
    targetAudience: ["farmers", "tribal", "workers"],
    eligibilitySummary: "Small, marginal, and tribal farmers owning 0.5 to 1 acre of unutilized land.",
    benefits: "100 fruit-bearing plants (Mango, Guava, Litchi) supplied with 3 years of guaranteed MGNREGA plantation wages.",
    requiredDocuments: [
      "Land Ownership Document (Khatian / Mutation Receipt)",
      "MGNREGA Job Card Number",
      "Aadhaar Card",
      "Bank Passbook",
    ],
    officialUrl: "https://jharkhandegovernance.gov.in",
    verifiedDate: "2025-05-01",
    applicationMode: "Offline at Block Office",
  },
  {
    id: "marang-gomke-scholarship",
    title: "Marang Gomke Jaipal Singh Munda Overseas Scholarship",
    hindiTitle: "मरांग गोमके जयपाल सिंह मुंडा ओवरसीज स्कॉलरशिप",
    department: "Department of Scheduled Tribe, Scheduled Caste & OBC Welfare",
    category: "Education & Youth",
    targetAudience: ["students", "tribal"],
    eligibilitySummary: "ST, SC, Minority, and OBC students of Jharkhand seeking Master's/M.Phil degrees in selected UK and Northern Ireland Universities.",
    benefits: "100% fully-funded scholarship covering tuition fees, living expenses, airfare, and visa costs.",
    requiredDocuments: [
      "University Offer Letter (UK Institute)",
      "ST/SC/OBC Caste Certificate",
      "Income Certificate (Below ₹12 Lakh)",
      "Passport Copy",
    ],
    officialUrl: "https://mgmsoverseas.jharkhand.gov.in",
    verifiedDate: "2025-05-01",
    applicationMode: "Online",
  },
  {
    id: "jharkhand-krishi-rin-maafi",
    title: "Jharkhand Agricultural Loan Waiver Scheme (Krishi Rin Maafi)",
    hindiTitle: "झारखंड कृषि ऋण माफी योजना",
    department: "Agriculture, Animal Husbandry & Co-operative Dept",
    category: "Agriculture & Farmers",
    targetAudience: ["farmers"],
    eligibilitySummary: "Small & marginal farmers holding crop loan accounts in commercial or regional rural banks in Jharkhand.",
    benefits: "One-time loan waiver up to ₹2,00,000 credited directly to loan account.",
    requiredDocuments: [
      "Kisan Credit Card (KCC) Loan Passbook",
      "Aadhaar Card linked to KCC Account",
      "Ration Card",
    ],
    officialUrl: "https://jkrmy.jharkhand.gov.in",
    verifiedDate: "2025-05-01",
    applicationMode: "Online",
  },
  {
    id: "pension-sarvajan",
    title: "Sarvajan Pension Yojana",
    hindiTitle: "सर्वजन पेंशन योजना",
    department: "Department of Social Security, Govt of Jharkhand",
    category: "Social Security",
    targetAudience: ["seniors", "women", "pwd"],
    eligibilitySummary: "Senior citizens (60+ yrs), widows (18+ yrs), destitute women, and Persons with Disabilities (40%+ disability).",
    benefits: "Monthly pension of ₹1,000 directly transferred to bank account on the 5th of every month.",
    requiredDocuments: [
      "Age Proof / Birth Certificate / Aadhaar",
      "Disability Certificate (for PwD applicants)",
      "Bank Account Details",
      "Domicile Certificate",
    ],
    officialUrl: "https://swd.jharkhand.gov.in",
    verifiedDate: "2025-05-01",
    applicationMode: "Offline at Block Office",
  },
];

