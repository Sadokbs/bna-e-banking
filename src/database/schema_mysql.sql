-- ==============================================================================
-- BNA E-BANKING - SCHEMA MYSQL 8.0+ & MARIADB
-- Standard de Sécurité Bancaire : Chiffrement PBKDF2 SHA-256 & Unicité Stricte
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS bna_ebanking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bna_ebanking;

-- 1. TABLE DES UTILISATEURS (Gestion des accès et habilitations)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    identifiant VARCHAR(50) NOT NULL UNIQUE,          -- Contrainte d'unicité absolue (PRIMARY/UNIQUE)
    role ENUM('SUPER_ADMIN', 'ADMIN', 'CLIENT_PARTICULIER', 'CLIENT_PROFESSIONNEL') NOT NULL,
    nom_complet VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telephone VARCHAR(30) NOT NULL,
    cin VARCHAR(20) NULL,
    titre VARCHAR(100) NULL,
    organisation VARCHAR(200) NULL,
    password_hash VARCHAR(255) NOT NULL,              -- Empreinte $sha256$iterations$salt$hash (JAMAIS en clair)
    salt VARCHAR(64) NOT NULL,                        -- Sel cryptographique aléatoire 16 octets
    algo_chiffrement VARCHAR(50) DEFAULT 'PBKDF2-SHA256 (10000)',
    statut ENUM('ACTIF', 'SUSPENDU', 'EN_ATTENTE') DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_identifiant (identifiant),
    INDEX idx_role (role),
    INDEX idx_cin (cin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABLE DES COMPTES BANCAIRES
CREATE TABLE IF NOT EXISTS comptes_bancaires (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    numero_compte VARCHAR(34) NOT NULL UNIQUE,        -- Format RIB / IBAN BNA
    type_compte VARCHAR(50) NOT NULL,                 -- Chèque, Épargne, Pro Agri, etc.
    solde DECIMAL(15, 3) NOT NULL DEFAULT 0.000,      -- Précision Dinar Tunisien (3 décimales)
    devise VARCHAR(5) DEFAULT 'TND',
    statut VARCHAR(20) DEFAULT 'OUVERT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compte_user FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABLE DES VIREMENTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    compte_source_id VARCHAR(64) NOT NULL,
    compte_destination_rib VARCHAR(34) NOT NULL,
    nom_beneficiaire VARCHAR(150) NOT NULL,
    montant DECIMAL(15, 3) NOT NULL,
    motif VARCHAR(255) NULL,
    statut ENUM('EXECUTE', 'EN_ATTENTE_VALIDATION', 'REJETE') DEFAULT 'EXECUTE',
    date_execution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_bna VARCHAR(60) NOT NULL UNIQUE,
    CONSTRAINT fk_transaction_compte FOREIGN KEY (compte_source_id) REFERENCES comptes_bancaires(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABLE DU JOURNAL D'AUDIT SYSTÈME & SÉCURITÉ
CREATE TABLE IF NOT EXISTS journal_audit (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    date_heure TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_identifiant VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    adresse_ip VARCHAR(50) DEFAULT '197.0.24.18 (BNA Gateway TLS)',
    statut ENUM('SUCCES', 'ECHEC', 'ALERTE') NOT NULL,
    details TEXT NULL,
    INDEX idx_audit_user (utilisateur_identifiant),
    INDEX idx_audit_date (date_heure)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- JEU DE DONNÉES INITIAL (Comptes BNA Chiffrés SHA-256)
-- ==============================================================================

INSERT INTO utilisateurs (id, identifiant, role, nom_complet, email, telephone, cin, titre, organisation, password_hash, salt, algo_chiffrement, statut)
VALUES 
('usr-superadmin', 'SUPERADMIN-IT88Ss', 'SUPER_ADMIN', 'M. Sami Trabelsi', 'sami.trabelsi@bna.tn', '+216 71 830 000', '07123456', 'Super Administrateur Système & Sécurité', 'Direction Générale de l\'Informatique & DSI BNA', '$sha256$10000$c92fa07b489d28e1$4b899e34e56580f12443a6d713c23e6f987d6e4b859012a45c34e89123f45a6b', 'c92fa07b489d28e1', 'PBKDF2-SHA256 (10000 itérations)', 'ACTIF'),
('usr-admin', 'ADMIN-BK42Xp', 'ADMIN', 'Mme. Yasmine Karray', 'yasmine.karray@bna.tn', '+216 71 831 200', '08987654', 'Administrateur Fonctionnel E-Banking', 'Direction de la Monétique & Habilitations', '$sha256$10000$a812bf7e990c41d3$3a849f11c750b284e31952a12903847f98ab12e45cf8129048a129ef918234ab', 'a812bf7e990c41d3', 'PBKDF2-SHA256 (10000 itérations)', 'ACTIF'),
('usr-particulier', 'PARTICULIER-77401', 'CLIENT_PARTICULIER', 'M. Mohamed Ali Ben Salah', 'm.bensalah@gmail.com', '+216 98 450 123', '05432198', 'Client Particulier Premium', 'Agence BNA Tunis Habib Bourguiba', '$sha256$10000$f431980a77be3412$7c981240ea8910b42318491240abef78129348ea1204918247a192834bfa8912', 'f431980a77be3412', 'PBKDF2-SHA256 (10000 itérations)', 'ACTIF'),
('usr-pro', 'PRO-99210', 'CLIENT_PROFESSIONNEL', 'Société AgriNord SARL', 'direction@agrinord-tn.com', '+216 72 450 900', '09112233', 'Client Professionnel (Exploitation Agricole)', 'Agence BNA Bizerte Ville - Compte Pro #008402', '$sha256$10000$87bdae09412356ff$8894123aeb90184291849201948ab1248912ef40192847a1928340192847120a', '87bdae09412356ff', 'PBKDF2-SHA256 (10000 itérations)', 'ACTIF')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert Comptes
INSERT INTO comptes_bancaires (id, user_id, numero_compte, type_compte, solde, devise, statut)
VALUES
('cpt-part-1', 'usr-particulier', '03 000 0100123456789 45', 'Compte Chèque Courant', 14850.750, 'TND', 'OUVERT'),
('cpt-part-2', 'usr-particulier', '03 000 0100987654321 82', 'Compte Épargne Agri-Croissance', 42300.000, 'TND', 'OUVERT'),
('cpt-pro-1', 'usr-pro', '03 045 0840200192837 19', 'Compte Courant Commercial Pro', 184520.400, 'TND', 'OUVERT'),
('cpt-pro-2', 'usr-pro', '03 045 0840200987654 33', 'Compte Exploitation Matériel Agricole', 92000.000, 'TND', 'OUVERT')
ON DUPLICATE KEY UPDATE solde = VALUES(solde);
