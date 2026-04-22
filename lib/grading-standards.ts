import type { Record } from 'typescript';

export type Grade = 'A' | 'B' | 'C';

export interface GradingStandard {
  label: string;
  color: string;
  priceAdjustment: number;
  description: string;
  criteria: string[];
}

export const GRADING_STANDARDS: Record<string, Record<Grade, GradingStandard>> = {
  Maize: {
    A: {
      label: 'Premium',
      color: 'green',
      priceAdjustment: 0.15,
      description: 'Premium Quality',
      criteria: [
        'Moisture < 13%',
        'No visible mold',
        'Uniform kernel size',
        'Foreign matter < 1%'
      ]
    },
    B: {
      label: 'Standard',
      color: 'yellow',
      priceAdjustment: 0,
      description: 'Standard Quality',
      criteria: [
        'Moisture 13-15%',
        'Minor discoloration',
        'Broken kernels < 5%'
      ]
    },
    C: {
      label: 'Processing',
      color: 'orange',
      priceAdjustment: -0.2,
      description: 'Processing Grade',
      criteria: [
        'Moisture > 15%',
        'Suitable for processing only'
      ]
    }
  },
  Cassava: {
    A: {
      label: 'Premium',
      color: 'green',
      priceAdjustment: 0.15,
      description: 'Premium Quality',
      criteria: [
        'Fresh, firm tubers',
        'No rot or bruises',
        'Uniform size',
        'No pest damage'
      ]
    },
    B: {
      label: 'Standard',
      color: 'yellow',
      priceAdjustment: 0,
      description: 'Standard Quality',
      criteria: [
        'Minor bruises',
        'Slight size variation',
        'Minor pest marks'
      ]
    },
    C: {
      label: 'Processing',
      color: 'orange',
      priceAdjustment: -0.2,
      description: 'Processing Grade',
      criteria: [
        'Soft or wilted',
        'Significant rot',
        'For processing only'
      ]
    }
  },
  Yam: {
    A: {
      label: 'Premium',
      color: 'green',
      priceAdjustment: 0.15,
      description: 'Premium Quality',
      criteria: [
        'Firm, healthy tubers',
        'No cuts or rot',
        'Uniform size',
        'No pest damage'
      ]
    },
    B: {
      label: 'Standard',
      color: 'yellow',
      priceAdjustment: 0,
      description: 'Standard Quality',
      criteria: [
        'Minor cuts',
        'Slight size variation',
        'Minor pest marks'
      ]
    },
    C: {
      label: 'Processing',
      color: 'orange',
      priceAdjustment: -0.2,
      description: 'Processing Grade',
      criteria: [
        'Soft or wilted',
        'Significant rot',
        'For processing only'
      ]
    }
  },
  Plantain: {
    A: {
      label: 'Premium',
      color: 'green',
      priceAdjustment: 0.15,
      description: 'Premium Quality',
      criteria: [
        'Firm, unblemished',
        'Uniform size',
        'No rot or mold',
        'No pest damage'
      ]
    },
    B: {
      label: 'Standard',
      color: 'yellow',
      priceAdjustment: 0,
      description: 'Standard Quality',
      criteria: [
        'Minor blemishes',
        'Slight size variation',
        'Minor pest marks'
      ]
    },
    C: {
      label: 'Processing',
      color: 'orange',
      priceAdjustment: -0.2,
      description: 'Processing Grade',
      criteria: [
        'Soft or wilted',
        'Significant rot',
        'For processing only'
      ]
    }
  },
  Tomato: {
    A: {
      label: 'Premium',
      color: 'green',
      priceAdjustment: 0.15,
      description: 'Premium Quality',
      criteria: [
        'Firm, ripe',
        'Uniform color',
        'No cracks or rot',
        'No pest damage'
      ]
    },
    B: {
      label: 'Standard',
      color: 'yellow',
      priceAdjustment: 0,
      description: 'Standard Quality',
      criteria: [
        'Minor cracks',
        'Slight color variation',
        'Minor pest marks'
      ]
    },
    C: {
      label: 'Processing',
      color: 'orange',
      priceAdjustment: -0.2,
      description: 'Processing Grade',
      criteria: [
        'Soft or overripe',
        'Significant rot',
        'For processing only'
      ]
    }
  },
  Rice: {
    A: {
      label: 'Premium',
      color: 'green',
      priceAdjustment: 0.15,
      description: 'Premium Quality',
      criteria: [
        'Moisture < 14%',
        'No foreign matter',
        'Uniform grain size',
        'No discoloration'
      ]
    },
    B: {
      label: 'Standard',
      color: 'yellow',
      priceAdjustment: 0,
      description: 'Standard Quality',
      criteria: [
        'Moisture 14-16%',
        'Minor discoloration',
        'Broken grains < 5%'
      ]
    },
    C: {
      label: 'Processing',
      color: 'orange',
      priceAdjustment: -0.2,
      description: 'Processing Grade',
      criteria: [
        'Moisture > 16%',
        'For processing only'
      ]
    }
  },
  Pepper: {
    A: {
      label: 'Premium',
      color: 'green',
      priceAdjustment: 0.15,
      description: 'Premium Quality',
      criteria: [
        'Firm, fresh',
        'Uniform color',
        'No rot or mold',
        'No pest damage'
      ]
    },
    B: {
      label: 'Standard',
      color: 'yellow',
      priceAdjustment: 0,
      description: 'Standard Quality',
      criteria: [
        'Minor blemishes',
        'Slight color variation',
        'Minor pest marks'
      ]
    },
    C: {
      label: 'Processing',
      color: 'orange',
      priceAdjustment: -0.2,
      description: 'Processing Grade',
      criteria: [
        'Soft or wilted',
        'Significant rot',
        'For processing only'
      ]
    }
  }
};
