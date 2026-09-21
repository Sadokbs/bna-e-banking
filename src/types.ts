export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT_PARTICULIER' | 'CLIENT_PROFESSIONNEL';

export interface UserAccount {
  id: string;
  role: UserRole;
  identifiant: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  title: string;
  badgeColor: string;
  organization?: string;
}

export interface StoredUserAccount extends UserAccount {
  cin?: string;
  passwordHash: string; // The cryptographic salted SHA-256 PBKDF2 hash (NEVER plaintext)
  salt: string;         // Cryptographic random salt used for hashing
  encryptionAlgorithm: string; // e.g. 'PBKDF2-SHA256 (10000 itérations)'
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  status?: 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE';
}

export interface DatabaseStats {
  totalUsers: number;
  uniqueIdentifiantsCount: number;
  encryptedPasswordsCount: number;
  encryptionStandard: string;
  lastSync: string;
  collisionFreeGuarantee: boolean;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  rib: string;
  iban: string;
  type: string;
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'pending';
}

export interface BankCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  type: 'Visa Gold' | 'Mastercard Corporate' | 'CCT Nationale' | 'Carte Épargne';
  status: 'active' | 'locked';
  monthlyLimit: number;
  usedAmount: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  reference: string;
  status: 'completed' | 'pending' | 'rejected';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Support' | 'Auditeur' | 'Super Admin';
  status: 'actif' | 'inactif';
  lastLogin: string;
  permissions: string[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  status: 'SUCCÈS' | 'ÉCHEC' | 'ALERTE';
  details: string;
}

export interface ApplicationPack {
  id: string;
  name: string;
  code: string;
  targetRole: string;
  featuresCount: number;
  status: 'Actif' | 'En Maintenance';
  rights: string[];
}

export interface CommercialEffect {
  id: string;
  reference: string;
  type: 'Lettre de Change' | 'Billet à Ordre' | 'Chèque Certifié';
  issuer: string;
  beneficiary: string;
  amount: number;
  dueDate: string;
  status: 'Remis à l\'encaissement' | 'Payé' | 'En attente' | 'Impayé';
}

export interface AgriculturalCredit {
  id: string;
  reference: string;
  type: string;
  totalAmount: number;
  remainingAmount: number;
  nextDueDate: string;
  monthlyPayment: number;
  rate: string;
  status: 'En cours' | 'Accordé' | 'Sous étude';
}
