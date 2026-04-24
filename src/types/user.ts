// User-related types for the Agrolink platform

import { ID } from './common';

export interface User {
  id: ID;
  name: string;
  email: string;
  role: 'farmer' | 'investor' | 'admin' | 'cooperative';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  address?: string;
  avatarUrl?: string;
}
