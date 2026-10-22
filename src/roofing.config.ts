export interface RoofingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  badge?: string;
  popular?: boolean;
  type: 'inspection' | 'deposit' | 'service';
  billingType: 'one-time' | 'deposit-card-on-file';
  whopPlanId: string;
  description: string;
  features: string[];
  depositTerms?: {
    depositAmount: number;
    finalInvoiceEstimated: number;
    termsText: string;
  };
}

export interface RoofingService {
  id: string;
  title: string;
  category: 'replacement' | 'repair' | 'inspection' | 'commercial';
  shortDesc: string;
  fullDesc: string;
  startingPrice: string;
  image: string;
  features: string[];
  recommendedPlanId?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  location: string;
  date: string;
  rating: number;
  projectType: string;
  comment: string;
  verifiedWhopCustomer: boolean;
}

export interface RoofingConfig {
  company: {
    name: string;
    tradeName: string;
    tagline: string;
    phone: string;
    emergencyHotline: string;
    email: string;
    officeAddress: string;
    licenseNumber: string;
    insuredAmount: string;
    yearsInBusiness: number;
    projectsCompleted: number;
    ratingAverage: number;
    reviewCount: number;
  };
  whop: {
    accountId: string; // biz_... (also the pixel scope)
    defaultPlanId: string; // plan_...
    depositPlanId: string;
    inspectionPlanId: string;
    flatRatePlanId: string;
    /**
     * Which Whop environment Elements should talk to. `production` is the
     * default; `sandbox` points Elements at sandbox.whop.com test cards.
     * Override at build time with VITE_WHOP_ENVIRONMENT.
     */
    environment: 'production' | 'sandbox';
    /** Where the "create final balance invoice" button sends the contractor. */
    invoiceDashboardUrl: string;
    /** Optional site URL, used in copy and invoice references. */
    appUrl: string;
  };
  financing: {
    heading: string;
    subheading: string;
    highlights: string[];
    providers: string[];
    zeroPercentAprMonths: number;
    minimumMonthlyPayment: number;
  };
  serviceArea: {
    primaryMetro: string;
    state: string;
    radiusMiles: number;
    featuredCities: string[];
    zipCodes: string[];
  };
  plans: RoofingPlan[];
  services: RoofingService[];
  reviews: ReviewItem[];
  certifications: {
    name: string;
    issuer: string;
    badgeText: string;
  }[];
}

export const roofingConfig: RoofingConfig = {
  company: {
    name: "Apex Shield Roofing & Exteriors",
    tradeName: "Apex Shield USA",
    tagline: "Certified Storm-Proof Roofing & Architectural Systems",
    phone: "(800) 555-ROOF",
    emergencyHotline: "(800) 555-9119",
    email: "contact@apexshieldroofing.com",
    officeAddress: "4500 Ridgeview Blvd, Suite 200, Dallas, TX 75201",
    licenseNumber: "TX-RC-889421A",
    insuredAmount: "$2,000,000 General Liability",
    yearsInBusiness: 18,
    projectsCompleted: 4850,
    ratingAverage: 4.96,
    reviewCount: 428,
  },
  whop: {
    // ── Replace these five values with your own Whop identifiers ──────────────
    // Everything else in the template is driven from this config file.
    accountId: "biz_REPLACE_WITH_YOUR_ACCOUNT_ID",
    defaultPlanId: "plan_REPLACE_INSPECTION",
    depositPlanId: "plan_REPLACE_DEPOSIT",
    inspectionPlanId: "plan_REPLACE_INSPECTION",
    flatRatePlanId: "plan_REPLACE_FLAT_RATE",
    environment: "production",
    invoiceDashboardUrl: "https://whop.com/dashboard/",
    appUrl: "",
  },
  financing: {
    heading: "0% APR Financing Up To 18 Months",
    subheading: "Instant Approval via Whop Payments — No Hard Credit Impact to Check Rates",
    highlights: [
      "Flexible split payments with Klarna, Splitit, and Afterpay natively at checkout",
      "Pay 1/3 or 1/4 upfront, or spread over 12-60 low-interest monthly payments",
      "No penalty for early payoff on full roof replacements",
      "Insurance deductible financing options available",
    ],
    providers: ["Klarna", "Splitit", "Afterpay", "Apple Pay", "Google Pay"],
    zeroPercentAprMonths: 18,
    minimumMonthlyPayment: 89,
  },
  serviceArea: {
    primaryMetro: "Dallas-Fort Worth Metroplex & Surrounding Counties",
    state: "Texas",
    radiusMiles: 60,
    featuredCities: [
      "Dallas", "Fort Worth", "Plano", "Frisco", "McKinney",
      "Arlington", "Irving", "Garland", "Southlake", "Grapevine"
    ],
    zipCodes: [
      "75201", "75202", "75204", "75205", "75206", "75024", "75025", "75034", "75035",
      "75070", "75071", "76092", "76051", "76102", "76107", "76109", "75080", "75081"
    ],
  },
  plans: [
    {
      id: "plan-inspection",
      name: "21-Point Drone & Attic Roof Inspection",
      tagline: "Essential for real estate, storm claims & leak diagnostics",
      price: 149,
      type: "inspection",
      billingType: "one-time",
      whopPlanId: "plan_REPLACE_INSPECTION",
      description: "Comprehensive 4K aerial drone mapping, attic moisture check, shingle granule loss analysis, and a certified digital inspection report within 24 hours.",
      features: [
        "4K Ultra-HD Drone Aerial Thermal Scan",
        "Full Attic Moisture & Sheathing Inspection",
        "Digital Report & Storm Damage Certification for Insurance",
        "$149 Credited 100% Toward Any Subsequent Repair or Replacement",
        "Scheduled within 48 hours guaranteed",
      ],
    },
    {
      id: "plan-deposit",
      name: "Project Work Deposit & Materials Lock",
      tagline: "Secures crew dispatch, materials order & locks 2026 pricing",
      price: 500,
      badge: "MOST POPULAR",
      popular: true,
      type: "deposit",
      billingType: "deposit-card-on-file",
      whopPlanId: "plan_REPLACE_DEPOSIT",
      description: "Standard project commitment deposit for major repair or full replacement. Secures your spot on the production calendar today; the remaining balance is invoiced through Whop after the final walkthrough.",
      depositTerms: {
        depositAmount: 500,
        finalInvoiceEstimated: 4500,
        termsText: "A $500 project deposit is collected today by Whop. The remaining balance (about $4,500) is invoiced by Whop after your final walkthrough inspection and can be paid by card or in installments.",
      },
      features: [
        "Secures your crew date on the production calendar",
        "Immediate wholesale materials order & delivery lock",
        "Remaining balance invoiced through Whop after walkthrough",
        "Deducted directly from your final job balance",
        "100% refundable up to 72 hours prior to material delivery",
      ],
    },
    {
      id: "plan-flat-rate",
      name: "Flat-Rate Roof Tune-Up & Storm Seal",
      tagline: "Preventive maintenance for high-wind & heavy rain seasons",
      price: 799,
      type: "service",
      billingType: "one-time",
      whopPlanId: "plan_REPLACE_FLAT_RATE",
      description: "Complete maintenance tune-up covering pipe boot replacements, chimney flashing sealant, ridge cap re-nailing, and minor leak repairs up to 10 damaged shingles.",
      features: [
        "Replacement of up to 3 weathered plumbing vent pipe boots",
        "High-grade elastomeric sealant on all flashing & penetrations",
        "Fastening of loose ridge caps & edge shingles",
        "Gutter debris clearing around downspout openings (up to 150 linear ft)",
        "Includes a 1-year no-leak workmanship warranty",
      ],
    },
  ],
  services: [
    {
      id: "roof-replacement",
      title: "Complete Roof Replacement",
      category: "replacement",
      shortDesc: "Lifetime architectural shingles and standing seam metal roofs backed by 50-year non-prorated warranties.",
      fullDesc: "We strip down to the deck, inspect and replace rotted plywood sheathing, install synthetic underlayment, ice & water shield in all valleys, and finish with GAF Timberline HDZ or Owens Corning Duration architectural shingles.",
      startingPrice: "From $5,400 (or $99/mo)",
      image: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=800&q=80",
      features: ["50-Year Non-Prorated Warranty", "Tear-off & full deck inspection", "Class 4 Impact Resistance options", "Complimentary ridge vent upgrade"],
      recommendedPlanId: "plan-deposit",
    },
    {
      id: "emergency-repair",
      title: "Emergency Roof & Leak Repair",
      category: "repair",
      shortDesc: "Rapid-response leak repair, storm damage mitigation, and emergency tarping within 2-4 hours.",
      fullDesc: "Don't let rain ruin your ceilings and electrical work. Our fully stocked emergency service vans diagnose flashing failures, wind-lifted shingles, valley leaks, and chimney leaks on the spot.",
      startingPrice: "From $350 (or Flat-Rate $799)",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      features: ["2-4 Hour Emergency Dispatch", "Infrared leak detection", "Insurance claim documentation", "1-Year workmanship warranty"],
      recommendedPlanId: "plan-flat-rate",
    },
    {
      id: "drone-inspection",
      title: "Certified Drone & Hail Inspections",
      category: "inspection",
      shortDesc: "High-resolution aerial thermal mapping and insurance claim certification.",
      fullDesc: "FAA-certified drone pilots capture sub-millimeter imagery of shingle bruising, wind creases, and flashing separation. Includes an attic structural check and insurance-ready estimate.",
      startingPrice: "$149 Flat Fee",
      image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
      features: ["FAA Part 107 Certified Pilots", "Attic thermal moisture scan", "Insurance adjuster format report", "100% credited toward work"],
      recommendedPlanId: "plan-inspection",
    },
    {
      id: "gutters-flashing",
      title: "Seamless Gutters & Architectural Flashing",
      category: "repair",
      shortDesc: "Custom seamless aluminum gutters, leaf guards, and custom metal counter-flashing.",
      fullDesc: "Protect your foundation, fascia, and landscaping with custom 6-inch seamless K-style or half-round aluminum gutters rolled on-site, complete with oversized 3x4 downspouts.",
      startingPrice: "From $850",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      features: ["Rolled on-site custom seamless runs", "Heavy-gauge hidden aluminum hangers", "Micro-mesh leaf protection available", "20+ baked-on enamel colors"],
    },
  ],
  reviews: [
    {
      id: "rev-1",
      author: "Marcus Vance",
      location: "Frisco, TX",
      date: "October 14, 2026",
      rating: 5,
      projectType: "Full Shingle Replacement",
      comment: "Apex Shield made the entire process seamless. We paid the $500 deposit right on the website with Apple Pay, they showed up Tuesday morning, tore off the old roof, and installed the new GAF Timberline shingles in one single day! The final balance invoice came straight through Whop and was settled with one tap. Best roofing experience ever.",
      verifiedWhopCustomer: true,
    },
    {
      id: "rev-2",
      author: "Elena Rostova",
      location: "Plano, TX",
      date: "September 28, 2026",
      rating: 5,
      projectType: "21-Point Drone Inspection & Repair",
      comment: "Booked the $149 inspection after the bad hail storm. The drone report was in my inbox in 18 hours with clear pictures showing 14 damaged vents. Our insurance approved the full claim without a fight. The $149 was credited straight off the repair. Highly recommended!",
      verifiedWhopCustomer: true,
    },
    {
      id: "rev-3",
      author: "David & Sarah Chen",
      location: "Dallas, TX (Highland Park)",
      date: "September 11, 2026",
      rating: 5,
      projectType: "Roof Tune-Up & Storm Seal ($799)",
      comment: "Super convenient to book the flat-rate service online without waiting for an estimator to visit first. The technician replaced two cracked vent boots and sealed our chimney cricket. Very professional, left no debris in the driveway.",
      verifiedWhopCustomer: true,
    },
  ],
  certifications: [
    { name: "GAF Master Elite®", issuer: "GAF Materials Corp", badgeText: "Top 2% Contractor in North America" },
    { name: "Owens Corning Platinum Preferred", issuer: "Owens Corning", badgeText: "50-Year Non-Prorated Warranty Backed" },
    { name: "BBB Accredited A+", issuer: "Better Business Bureau", badgeText: "Zero Unresolved Complaints" },
    { name: "CertainTeed Select ShingleMaster™", issuer: "CertainTeed", badgeText: "Master Craftsman Certified" },
  ],
};
