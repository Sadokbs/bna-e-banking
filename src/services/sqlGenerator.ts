import { StoredUserAccount } from '../types';

export function generateMySQLScript(users: StoredUserAccount[]): string {
  const insertStatements = users.map(u => {
    const cleanId = u.id.replace(/'/g, "\\'");
    const cleanIdent = u.identifiant.replace(/'/g, "\\'");
    const cleanName = u.name.replace(/'/g, "\\'");
    const cleanEmail = u.email.replace(/'/g, "\\'");
    const cleanPhone = u.phone.replace(/'/g, "\\'");
    const cleanCin = (u.cin || '').replace(/'/g, "\\'");
    const cleanTitle = (u.title || '').replace(/'/g, "\\'");
    const cleanOrg = (u.organization || '').replace(/'/g, "\\'");
    const cleanHash = u.passwordHash.replace(/'/g, "\\'");
    const cleanSalt = u.salt.replace(/'/g, "\\'");
    const cleanAlgo = (u.encryptionAlgorithm || 'PBKDF2-SHA256 (10000)').replace(/'/g, "\\'");
    const status = u.status || 'ACTIF';

    return `('${cleanId}', '${cleanIdent}', '${u.role}', '${cleanName}', '${cleanEmail}', '${cleanPhone}', '${cleanCin}', '${cleanTitle}', '${cleanOrg}', '${cleanHash}', '${cleanSalt}', '${cleanAlgo}', '${status}')`;
  }).join(',\n');

  return `-- ==============================================================================
-- BNA E-BANKING - SCRIPT D'EXPORT MYSQL 8.0+ / MARIADB
-- Généré dynamiquement le : ${new Date().toISOString()}
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS bna_ebanking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bna_ebanking;

-- Structure de la table utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    identifiant VARCHAR(50) NOT NULL UNIQUE,
    role ENUM('SUPER_ADMIN', 'ADMIN', 'CLIENT_PARTICULIER', 'CLIENT_PROFESSIONNEL') NOT NULL,
    nom_complet VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telephone VARCHAR(30) NOT NULL,
    cin VARCHAR(20) NULL,
    titre VARCHAR(100) NULL,
    organisation VARCHAR(200) NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    algo_chiffrement VARCHAR(50) DEFAULT 'PBKDF2-SHA256 (10000)',
    statut ENUM('ACTIF', 'SUSPENDU', 'EN_ATTENTE') DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_identifiant (identifiant),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertion des ${users.length} comptes avec mots de passe chiffrés SHA-256
INSERT INTO utilisateurs (id, identifiant, role, nom_complet, email, telephone, cin, titre, organisation, password_hash, salt, algo_chiffrement, statut)
VALUES 
${insertStatements}
ON DUPLICATE KEY UPDATE 
    nom_complet = VALUES(nom_complet),
    password_hash = VALUES(password_hash),
    salt = VALUES(salt);
`;
}

export function generateOracleScript(users: StoredUserAccount[]): string {
  const insertStatements = users.map(u => {
    const cleanId = u.id.replace(/'/g, "''");
    const cleanIdent = u.identifiant.replace(/'/g, "''");
    const cleanName = u.name.replace(/'/g, "''");
    const cleanEmail = u.email.replace(/'/g, "''");
    const cleanPhone = u.phone.replace(/'/g, "''");
    const cleanCin = (u.cin || '').replace(/'/g, "''");
    const cleanTitle = (u.title || '').replace(/'/g, "''");
    const cleanOrg = (u.organization || '').replace(/'/g, "''");
    const cleanHash = u.passwordHash.replace(/'/g, "''");
    const cleanSalt = u.salt.replace(/'/g, "''");
    const cleanAlgo = (u.encryptionAlgorithm || 'PBKDF2-SHA256 (10000)').replace(/'/g, "''");
    const status = u.status || 'ACTIF';

    return `INSERT INTO BNA_UTILISATEURS (ID, IDENTIFIANT, ROLE, NOM_COMPLET, EMAIL, TELEPHONE, CIN, TITRE, ORGANISATION, PASSWORD_HASH, SALT, ALGO_CHIFFREMENT, STATUT)
VALUES ('${cleanId}', '${cleanIdent}', '${u.role}', '${cleanName}', '${cleanEmail}', '${cleanPhone}', '${cleanCin}', '${cleanTitle}', '${cleanOrg}', '${cleanHash}', '${cleanSalt}', '${cleanAlgo}', '${status}');`;
  }).join('\n');

  return `-- ==============================================================================
-- BNA E-BANKING - SCRIPT D'EXPORT ORACLE DATABASE (19c / 21c / 23c)
-- Généré dynamiquement le : ${new Date().toISOString()}
-- ==============================================================================

-- 1. TABLE DES UTILISATEURS
CREATE TABLE BNA_UTILISATEURS (
    ID VARCHAR2(64) NOT NULL,
    IDENTIFIANT VARCHAR2(50) NOT NULL,
    ROLE VARCHAR2(30) NOT NULL,
    NOM_COMPLET VARCHAR2(150) NOT NULL,
    EMAIL VARCHAR2(150) NOT NULL,
    TELEPHONE VARCHAR2(30) NOT NULL,
    CIN VARCHAR2(20),
    TITRE VARCHAR2(100),
    ORGANISATION VARCHAR2(200),
    PASSWORD_HASH VARCHAR2(255) NOT NULL,
    SALT VARCHAR2(64) NOT NULL,
    ALGO_CHIFFREMENT VARCHAR2(50) DEFAULT 'PBKDF2-SHA256 (10000)',
    STATUT VARCHAR2(20) DEFAULT 'ACTIF',
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT PK_BNA_UTILISATEURS PRIMARY KEY (ID),
    CONSTRAINT UQ_BNA_IDENTIFIANT UNIQUE (IDENTIFIANT),
    CONSTRAINT CK_BNA_ROLE CHECK (ROLE IN ('SUPER_ADMIN', 'ADMIN', 'CLIENT_PARTICULIER', 'CLIENT_PROFESSIONNEL'))
);

CREATE INDEX IDX_BNA_USER_IDENTIFIANT ON BNA_UTILISATEURS (IDENTIFIANT);

-- 2. INSERTIONS (${users.length} comptes avec hachage SHA-256 salé)
${insertStatements}

COMMIT;
`;
}
