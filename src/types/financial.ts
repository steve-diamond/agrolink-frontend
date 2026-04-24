// Financial-related types for the Agrolink platform

import { ID } from './common';

export interface Transaction {
  id: ID;
  userId: ID;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'investment' | 'loan' | 'payment';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: ID;
  investorId: ID;
  projectId: ID;
  amount: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'closed' | 'cancelled';
}
