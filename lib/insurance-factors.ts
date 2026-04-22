// Risk factors for insurance quote calculator
export const base_rate_per_hectare = 5000;

export const state_risk_factors: Record<string, number> = {
  Lagos: 1.1,
  Kano: 1.0,
  Kaduna: 1.05,
  Ogun: 1.0,
  Oyo: 1.0,
  Benue: 1.2,
  Abia: 1.15,
  "FCT": 1.0,
  // ...add all states as needed
};

export const crop_risk_factors: Record<string, number> = {
  Maize: 1.0,
  Cassava: 1.05,
  Rice: 1.1,
  Poultry: 1.2,
  Fishery: 1.15,
  Vegetables: 1.1,
  Mixed: 1.25,
};

export const plans = [
  {
    name: 'Basic',
    price: 5000,
    coverage: 150000,
    description: 'Fire, flood, drought',
  },
  {
    name: 'Standard',
    price: 12000,
    coverage: 400000,
    description: 'Basic + pest/disease',
  },
  {
    name: 'Premium',
    price: 25000,
    coverage: 1000000,
    description: 'Full coverage + input replacement',
  },
];
