import { 
  UserAccount, 
  BankAccount, 
  BankCard, 
  Transaction, 
  AdminUser, 
  SystemAuditLog, 
  ApplicationPack, 
  CommercialEffect, 
  AgriculturalCredit 
} from '../types';

export const DEMO_ACCOUNTS: Record<string, UserAccount> = {
  'SUPERADMIN-IT88Ss': {
    id: 'usr-superadmin',
    role: 'SUPER_ADMIN',
    identifiant: 'SUPERADMIN-IT88Ss',
    name: 'M. Sami Trabelsi',
    email: 'sami.trabelsi@bna.tn',
    phone: '+216 71 830 000',
    title: 'Super Administrateur Système & Sécurité',
    badgeColor: 'bg-emerald-600 text-white',
    organization: 'Direction Générale de l\'Informatique & DSI BNA'
  },
  'ADMIN-BK42Xp': {
    id: 'usr-admin',
    role: 'ADMIN',
    identifiant: 'ADMIN-BK42Xp',
    name: 'Mme. Yasmine Karray',
    email: 'yasmine.karray@bna.tn',
    phone: '+216 71 831 200',
    title: 'Administrateur Fonctionnel E-Banking',
    badgeColor: 'bg-teal-600 text-white',
    organization: 'Direction de la Monétique & Habilitations'
  },
  'PARTICULIER-77401': {
    id: 'usr-particulier',
    role: 'CLIENT_PARTICULIER',
    identifiant: 'PARTICULIER-77401',
    name: 'M. Mohamed Ali Ben Salah',
    email: 'm.bensalah@gmail.com',
    phone: '+216 98 450 123',
    title: 'Client Particulier Premium',
    badgeColor: 'bg-blue-600 text-white',
    organization: 'Agence BNA Tunis Habib Bourguiba'
  },
  'PRO-99210': {
    id: 'usr-pro',
    role: 'CLIENT_PROFESSIONNEL',
    identifiant: 'PRO-99210',
    name: 'Société AgriNord SARL',
    email: 'direction@agrinord-tn.com',
    phone: '+216 72 450 900',
    title: 'Client Professionnel (Exploitation Agricole)',
    badgeColor: 'bg-amber-600 text-white',
    organization: 'Agence BNA Bizerte Ville - Compte Pro #008402'
  }
};

export const MOCK_ACCOUNTS_PARTICULIER: BankAccount[] = [
  {
    id: 'acc-1',
    accountNumber: '03 001 0001234567 89',
    rib: '03001000123456789012',
    iban: 'TN59 0300 1000 1234 5678 9012',
    type: 'Compte Chèque Particulier',
    balance: 14850.750,
    currency: 'TND',
    status: 'active'
  },
  {
    id: 'acc-2',
    accountNumber: '03 001 0009876543 21',
    rib: '03001000987654321098',
    iban: 'TN59 0300 1000 9876 5432 1098',
    type: 'Compte Épargne BNA Moussafir',
    balance: 32400.000,
    currency: 'TND',
    status: 'active'
  }
];

export const MOCK_CARDS_PARTICULIER: BankCard[] = [
  {
    id: 'crd-1',
    cardNumber: '5358 •••• •••• 4092',
    cardHolder: 'MOHAMED ALI BEN SALAH',
    expiry: '08/28',
    type: 'Visa Gold',
    status: 'active',
    monthlyLimit: 5000,
    usedAmount: 1250
  },
  {
    id: 'crd-2',
    cardNumber: '4502 •••• •••• 1108',
    cardHolder: 'MOHAMED ALI BEN SALAH',
    expiry: '11/27',
    type: 'CCT Nationale',
    status: 'active',
    monthlyLimit: 2000,
    usedAmount: 340
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    date: '06/08/2026',
    description: 'Virement Reçu - Salaire Mensuel MENA',
    amount: 3450.000,
    type: 'credit',
    category: 'Salaire',
    reference: 'VIR-2026-0892',
    status: 'completed'
  },
  {
    id: 'tx-102',
    date: '04/08/2026',
    description: 'Paiement STEG - Facture Électricité',
    amount: -185.400,
    type: 'debit',
    category: 'Factures',
    reference: 'FAC-STEG-8821',
    status: 'completed'
  },
  {
    id: 'tx-103',
    date: '02/08/2026',
    description: 'Retrait DAB BNA Agence Bourguiba',
    amount: -300.000,
    type: 'debit',
    category: 'Retrait',
    reference: 'DAB-00129',
    status: 'completed'
  },
  {
    id: 'tx-104',
    date: '28/07/2026',
    description: 'Paiement TPE Carrefour Market',
    amount: -142.800,
    type: 'debit',
    category: 'Achat',
    reference: 'TPE-99012',
    status: 'completed'
  },
  {
    id: 'tx-105',
    date: '25/07/2026',
    description: 'Recharge Ligne Ooredoo 50DT',
    amount: -50.000,
    type: 'debit',
    category: 'Recharge',
    reference: 'TEL-44102',
    status: 'completed'
  }
];

export const MOCK_ACCOUNTS_PRO: BankAccount[] = [
  {
    id: 'acc-pro-1',
    accountNumber: '03 084 0008899112 44',
    rib: '03084000889911244011',
    iban: 'TN59 0308 4000 8899 1124 4011',
    type: 'Compte Courant Professionnel Agricole',
    balance: 184920.450,
    currency: 'TND',
    status: 'active'
  },
  {
    id: 'acc-pro-2',
    accountNumber: '03 084 0007711223 99',
    rib: '03084000771122399088',
    iban: 'TN59 0308 4000 7711 2239 9088',
    type: 'Compte Devise Convertible (Export)',
    balance: 45000.000,
    currency: 'EUR',
    status: 'active'
  }
];

export const MOCK_EFFECTS_PRO: CommercialEffect[] = [
  {
    id: 'eff-01',
    reference: 'LC-2026-8801',
    type: 'Lettre de Change',
    issuer: 'Comptoir Agricole du Centre',
    beneficiary: 'Société AgriNord SARL',
    amount: 38500.000,
    dueDate: '15/09/2026',
    status: 'Remis à l\'encaissement'
  },
  {
    id: 'eff-02',
    reference: 'BO-2026-4412',
    type: 'Billet à Ordre',
    issuer: 'Société AgriNord SARL',
    beneficiary: 'Fournisseur Engrais & Semences Bizerte',
    amount: 14200.000,
    dueDate: '28/08/2026',
    status: 'En attente'
  },
  {
    id: 'eff-03',
    reference: 'CHQ-2026-0092',
    type: 'Chèque Certifié',
    issuer: 'Groupement Céréalier Nord',
    beneficiary: 'Société AgriNord SARL',
    amount: 52000.000,
    dueDate: '01/08/2026',
    status: 'Payé'
  }
];

export const MOCK_CREDITS_AGRICOLES: AgriculturalCredit[] = [
  {
    id: 'crd-agri-1',
    reference: 'CRED-CAMP-2026-04',
    type: 'Crédit Campagne Agricole Céréaliculture',
    totalAmount: 120000.000,
    remainingAmount: 45000.000,
    nextDueDate: '15/10/2026',
    monthlyPayment: 8500.000,
    rate: '7.5% Bonifié BNA',
    status: 'En cours'
  },
  {
    id: 'crd-agri-2',
    reference: 'CRED-EQUIP-2025-12',
    type: 'Investissement Équipement Tracteurs & Moissonneuse',
    totalAmount: 250000.000,
    remainingAmount: 160000.000,
    nextDueDate: '01/11/2026',
    monthlyPayment: 12400.000,
    rate: '8.2%',
    status: 'En cours'
  }
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-01',
    name: 'Yasmine Karray',
    email: 'yasmine.karray@bna.tn',
    role: 'Admin',
    status: 'actif',
    lastLogin: 'Aujourd\'hui à 09:14',
    permissions: ['Gestion Profils', 'Gestion Menus', 'Attribution Packs']
  },
  {
    id: 'adm-02',
    name: 'Karim Mansour',
    email: 'karim.mansour@bna.tn',
    role: 'Support',
    status: 'actif',
    lastLogin: 'Hier à 16:45',
    permissions: ['Consultation Clients', 'Déblocage OTP']
  },
  {
    id: 'adm-03',
    name: 'Ines Ben Ammar',
    email: 'ines.benammar@bna.tn',
    role: 'Auditeur',
    status: 'actif',
    lastLogin: '05/08/2026',
    permissions: ['Audit Trail', 'Rapports Conformité']
  }
];

export const MOCK_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-1001',
    timestamp: '07/08/2026 09:32:11',
    user: 'SUPERADMIN-IT88Ss',
    action: 'MODIFICATION_PARAM_SECURITE',
    ipAddress: '196.203.112.45',
    status: 'SUCCÈS',
    details: 'Mise à jour de la politique d\'expiration OTP (300 secondes)'
  },
  {
    id: 'log-1002',
    timestamp: '07/08/2026 09:15:02',
    user: 'ADMIN-BK42Xp',
    action: 'ATTRIBUTION_PACK_PRO',
    ipAddress: '196.203.112.50',
    status: 'SUCCÈS',
    details: 'Affectation du Pack Agricole Pro pour le compte PRO-99210'
  },
  {
    id: 'log-1003',
    timestamp: '07/08/2026 08:44:19',
    user: 'Inconnu (197.28.14.88)',
    action: 'TENTATIVE_CONNEXION_ECHEC',
    ipAddress: '197.28.14.88',
    status: 'ÉCHEC',
    details: 'Identifiant erroné saisi sur la page de connexion'
  },
  {
    id: 'log-1004',
    timestamp: '06/08/2026 18:22:40',
    user: 'PARTICULIER-77401',
    action: 'VIREMENT_EXECUTED',
    ipAddress: '41.226.15.110',
    status: 'SUCCÈS',
    details: 'Virement de 350.000 TND vers RIB 03002000887766554433'
  }
];

export const MOCK_PACKS: ApplicationPack[] = [
  {
    id: 'pck-1',
    name: 'Pack BNA Particulier Standard',
    code: 'PACK-PART-STD',
    targetRole: 'Client Particulier',
    featuresCount: 14,
    status: 'Actif',
    rights: ['Consultation Comptes', 'RIB/IBAN PDF', 'Virement Unitaire', 'Paiement Factures STEG/SONEDE']
  },
  {
    id: 'pck-2',
    name: 'Pack BNA AgriPro Enterprise',
    code: 'PACK-AGRI-PRO',
    targetRole: 'Client Professionnel',
    featuresCount: 28,
    status: 'Actif',
    rights: ['Consultation Comptes Pro', 'Crédits Agricoles', 'Gestion Effets & LDC', 'Virements Multiples Paie', 'Mandats Cash']
  },
  {
    id: 'pck-3',
    name: 'Pack Administration Systèmes',
    code: 'PACK-ADMIN-SYS',
    targetRole: 'Admin / Super Admin',
    featuresCount: 42,
    status: 'Actif',
    rights: ['Gestion Utilisateurs', 'Audit Logs', 'Attribution Rôles', 'Configuration OTP & API']
  }
];
