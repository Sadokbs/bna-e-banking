import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  UserPlus, 
  Check, 
  Copy, 
  RefreshCw, 
  AlertTriangle, 
  Eye, 
  Hash, 
  Server, 
  Trash2, 
  CheckCircle2,
  Code2,
  Download,
  Terminal,
  FileCode2,
  Cpu
} from 'lucide-react';
import { dbService } from '../services/db';
import { hashPassword } from '../services/crypto';
import { generateMySQLScript, generateOracleScript } from '../services/sqlGenerator';
import { BnaLogo } from './BnaLogo';
import { StoredUserAccount, DatabaseStats, UserRole } from '../types';

interface DatabaseViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUserToLogin?: (user: StoredUserAccount) => void;
}

export const DatabaseViewerModal: React.FC<DatabaseViewerModalProps> = ({
  isOpen,
  onClose,
  onSelectUserToLogin
}) => {
  const [users, setUsers] = useState<StoredUserAccount[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sql' | 'hasher' | 'create'>('users');
  const [selectedSqlDialect, setSelectedSqlDialect] = useState<'oracle' | 'mysql'>('oracle');

  // Test hasher state
  const [testPasswordInput, setTestPasswordInput] = useState<string>('ExempleMotDePasse#2026');
  const [testSaltInput, setTestSaltInput] = useState<string>('bna_salt_demo123');
  const [computedHashResult, setComputedHashResult] = useState<{ hash: string; salt: string; formatted: string } | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // New user creation in DB state
  const [newRole, setNewRole] = useState<UserRole>('CLIENT_PARTICULIER');
  const [newName, setNewName] = useState<string>('');
  const [newCin, setNewCin] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [customIdInput, setCustomIdInput] = useState<string>('');
  const [creationStatus, setCreationStatus] = useState<{ success: boolean; message: string } | null>(null);

  const refreshData = () => {
    setUsers(dbService.getAllUsers());
    setStats(dbService.getStats());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      handleRunTestHash();
    }
  }, [isOpen]);

  const handleRunTestHash = async () => {
    if (!testPasswordInput) return;
    setIsHashing(true);
    try {
      const res = await hashPassword(testPasswordInput, testSaltInput || undefined, 10000);
      setComputedHashResult(res);
    } finally {
      setIsHashing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDownloadSql = () => {
    const content = selectedSqlDialect === 'oracle' 
      ? generateOracleScript(users) 
      : generateMySQLScript(users);
    const filename = selectedSqlDialect === 'oracle' 
      ? 'bna_ebanking_oracle_schema.sql' 
      : 'bna_ebanking_mysql_schema.sql';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreationStatus(null);

    if (!newName || !newPassword) {
      setCreationStatus({ success: false, message: 'Le nom et le mot de passe sont obligatoires.' });
      return;
    }

    const res = await dbService.registerUser({
      role: newRole,
      name: newName,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@client.tn`,
      phone: newPhone || '98 000 000',
      cin: newCin || '08000000',
      password: newPassword,
      customIdentifiant: customIdInput.trim() ? customIdInput.trim() : undefined
    });

    if (res.success && res.user) {
      setCreationStatus({
        success: true,
        message: `Utilisateur créé avec succès ! Identifiant Unique attribué : ${res.user.identifiant} (Mot de passe chiffré stocké).`
      });
      refreshData();
      setNewName('');
      setNewPassword('');
      setNewCin('');
      setNewEmail('');
      setNewPhone('');
      setCustomIdInput('');
    } else {
      setCreationStatus({
        success: false,
        message: res.error || 'Échec de la création de l\'utilisateur.'
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de ${name} de la base de données ?`)) {
      dbService.deleteUser(id);
      refreshData();
    }
  };

  const handleResetDb = async () => {
    if (confirm('Voulez-vous réinitialiser la base de données aux comptes par défaut ?')) {
      await dbService.resetToDefault();
      refreshData();
    }
  };

  if (!isOpen) return null;

  const currentSqlScript = selectedSqlDialect === 'oracle' 
    ? generateOracleScript(users) 
    : generateMySQLScript(users);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-700/80 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-950 rounded-xl border border-emerald-500/40 p-1.5 flex items-center justify-center shrink-0">
              <BnaLogo className="w-full h-full" variant="emerald" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white">
                  Console Super Administrateur : Base de Données (Oracle DB & MySQL)
                </h2>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Super Admin Exclusif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualisation des enregistrements physiques et scripts d'exportation natifs pour <strong>Oracle Database (19c/21c/23c)</strong> et <strong>MySQL 8.0+ / MariaDB</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Top Metric Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Comptes en Base</div>
              <div className="text-base font-extrabold text-white mt-0.5">{stats.totalUsers} enregistrements</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-800/40">
              <div className="text-emerald-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Clé Unique (PRIMARY/UNIQUE)
              </div>
              <div className="text-base font-extrabold text-emerald-300 mt-0.5">
                100% Unique ({stats.uniqueIdentifiantsCount}/{stats.totalUsers})
              </div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-blue-800/40">
              <div className="text-blue-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Mots de Passe Chiffrés
              </div>
              <div className="text-base font-extrabold text-blue-300 mt-0.5">
                {stats.encryptedPasswordsCount} / {stats.totalUsers} Chiffrés
              </div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-purple-800/40">
              <div className="text-purple-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Moteurs SQL Compatibles
              </div>
              <div className="text-xs font-mono font-bold text-purple-300 mt-1 truncate">
                Oracle 19c/21c & MySQL 8.0+
              </div>
            </div>
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Table des Utilisateurs ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span>Scripts SQL (Oracle / MySQL)</span>
          </button>
          <button
            onClick={() => setActiveTab('hasher')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'hasher'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Testeur SHA-256</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Créer Utilisateur</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: USERS LIST WITH ENCRYPTED PASSWORDS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-300">
                  Enregistrements actuels dans la base de données. Chaque ligne possède une contrainte d'<strong>identifiant unique</strong> et un <strong>mot de passe salé chiffré</strong>.
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={refreshData}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Actualiser</span>
                  </button>
                  <button
                    onClick={handleResetDb}
                    className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Réinitialiser Base
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Identifiant Unique (PK/UQ)</th>
                      <th className="py-3 px-3">Utilisateur / Rôle</th>
                      <th className="py-3 px-3">CIN / Contact</th>
                      <th className="py-3 px-3">Empreinte SHA-256 Salée (Hash)</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-sans">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Unique ID */}
                        <td className="py-3 px-3 font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                              {u.identifiant}
                            </span>
                            <button
                              onClick={() => handleCopy(u.identifiant, `id-${u.id}`)}
                              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800"
                              title="Copier l'identifiant"
                            >
                              {copiedText === `id-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">ID Système: {u.id}</div>
                        </td>

                        {/* User & Role */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{u.name}</div>
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${u.badgeColor}`}>
                            {u.role}
                          </span>
                        </td>

                        {/* CIN & Contact */}
                        <td className="py-3 px-3">
                          <div className="font-mono text-slate-300 text-[11px]">CIN: {u.cin || 'Non renseigné'}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                          <div className="text-[10px] text-slate-400">{u.phone}</div>
                        </td>

                        {/* Encrypted Password Hash */}
                        <td className="py-3 px-3 font-mono max-w-xs">
                          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Chiffré & Salé
                              </span>
                              <span className="text-slate-500 text-[9px]">PBKDF2-SHA256</span>
                            </div>
                            <div className="text-[10px] text-slate-400 break-all line-clamp-2 select-all font-mono">
                              {u.passwordHash}
                            </div>
                            <div className="text-[9px] text-slate-500 flex items-center justify-between">
                              <span>Sel: <code className="text-purple-400">{u.salt}</code></span>
                              <button
                                onClick={() => handleCopy(u.passwordHash, `hash-${u.id}`)}
                                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 text-[9px]"
                              >
                                {copiedText === `hash-${u.id}` ? 'Copié !' : 'Copier Hash'}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {onSelectUserToLogin && (
                              <button
                                onClick={() => {
                                  onSelectUserToLogin(u);
                                  onClose();
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold cursor-pointer"
                                title="Se connecter instantanément avec ce compte"
                              >
                                Connexion
                              </button>
                            )}
                            {u.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SQL EXPORT (ORACLE & MYSQL) */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Exportateur de Schéma & Données SQL (Oracle & MySQL)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Générez instantanément le script SQL prêt à être exécuté dans <strong>Oracle SQL Developer / SQL*Plus</strong> ou <strong>MySQL Workbench / phpMyAdmin</strong>.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="bg-slate-900 border border-slate-700 p-1 rounded-xl flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedSqlDialect('oracle')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSqlDialect === 'oracle'
                          ? 'bg-red-950/80 text-red-300 border border-red-700/80'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Oracle Database
                    </button>
                    <button
                      onClick={() => setSelectedSqlDialect('mysql')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSqlDialect === 'mysql'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-700/80'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      MySQL / MariaDB
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(currentSqlScript, 'sql-script')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
                  >
                    {copiedText === 'sql-script' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedText === 'sql-script' ? 'Copié !' : 'Copier SQL'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSql}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger .sql</span>
                  </button>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Pour Oracle Database (19c, 21c, 23c) :
                  </div>
                  <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Types de données natifs : <code>VARCHAR2</code>, <code>NUMBER(15,3)</code>, <code>TIMESTAMP WITH TIME ZONE</code>.</li>
                    <li>Contraintes d'unicité : <code>CONSTRAINT UQ_BNA_IDENTIFIANT UNIQUE</code>.</li>
                    <li>Exécution : Ouvrir dans <strong>SQL Developer</strong> ou exécuter <code>@schema_oracle.sql</code> dans <strong>SQL*Plus</strong>.</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Pour MySQL 8.0+ / MariaDB :
                  </div>
                  <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Encodage bancaire : <code>utf8mb4_unicode_ci</code> avec moteur <code>InnoDB</code>.</li>
                    <li>Contraintes d'unicité : <code>identifiant VARCHAR(50) NOT NULL UNIQUE</code>.</li>
                    <li>Exécution : Importer dans <strong>phpMyAdmin</strong> ou <code>mysql -u root -p &lt; schema_mysql.sql</code>.</li>
                  </ul>
                </div>
              </div>

              {/* Code viewer */}
              <div className="relative">
                <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {selectedSqlDialect === 'oracle' ? 'Dialecte: Oracle PL/SQL' : 'Dialecte: MySQL InnoDB'}
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-[11px] font-mono text-emerald-300 max-h-[380px] overflow-y-auto leading-relaxed select-all">
                  {currentSqlScript}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SHA-256 PASSWORD HASHER & CRYPTOGRAPHY SIMULATOR */}
          {activeTab === 'hasher' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Simulateur de Chiffrement Cryptographique SHA-256 / PBKDF2
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ce module illustre la manière dont chaque mot de passe saisi par l'utilisateur est instantanément transformé en une empreinte irréversible de 256 bits avec sel aléatoire avant tout stockage dans la base de données.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mot de Passe à Chiffrer (Entrée Utilisateur)
                    </label>
                    <input
                      type="text"
                      value={testPasswordInput}
                      onChange={(e) => setTestPasswordInput(e.target.value)}
                      placeholder="Saisissez un mot de passe..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Sel Aléatoire (Généré par Cryptographie)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={testSaltInput}
                        onChange={(e) => setTestSaltInput(e.target.value)}
                        placeholder="Sel..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-purple-300 focus:border-purple-500 focus:outline-none font-mono"
                      />
                      <button
                        onClick={() => {
                          setTestSaltInput(Math.random().toString(36).substring(2, 18));
                        }}
                        className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs whitespace-nowrap cursor-pointer"
                      >
                        Nouveau Sel
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunTestHash}
                  disabled={isHashing}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Hash className="w-4 h-4" />
                  <span>{isHashing ? 'Calcul du Hash...' : 'Générer l\'Empreinte Chiffrée SHA-256'}</span>
                </button>

                {computedHashResult && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 mt-4">
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                      <span>Format Stocké en Base de Données :</span>
                      <span className="text-[10px] font-mono text-slate-400">10 000 Itérations PBKDF2</span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all flex items-center justify-between">
                      <span>{computedHashResult.formatted}</span>
                      <button
                        onClick={() => handleCopy(computedHashResult.formatted, 'test-hash')}
                        className="ml-2 text-slate-400 hover:text-white p-1"
                        title="Copier"
                      >
                        {copiedText === 'test-hash' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">HASH BRUT HEX (256-BIT):</span>
                        <span className="text-white truncate block">{computedHashResult.hash}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">SEL UTILISÉ:</span>
                        <span className="text-purple-400 truncate block">{computedHashResult.salt}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CREATE USER WITH UNIQUE ID & ENCRYPTION */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Création d'un Nouveau Compte avec Validation d'Unicité
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Le système refusera tout identifiant déjà existant et chiffrera automatiquement le mot de passe avant insertion.
                </p>
              </div>

              {creationStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2 ${
                    creationStatus.success
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-600 text-rose-200'
                  }`}
                >
                  {creationStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{creationStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rôle du Compte</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CLIENT_PARTICULIER">Client Particulier</option>
                    <option value="CLIENT_PROFESSIONNEL">Client Professionnel (Société / Agriculteur)</option>
                    <option value="ADMIN">Administrateur Fonctionnel</option>
                    <option value="SUPER_ADMIN">Super Administrateur</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nom Complet / Raison Sociale *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="ex: Rim Karray"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Numéro CIN (8 chiffres)</label>
                    <input
                      type="text"
                      maxLength={8}
                      value={newCin}
                      onChange={(e) => setNewCin(e.target.value.replace(/\D/g, ''))}
                      placeholder="ex: 09871234"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Adresse E-mail</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="client@domaine.tn"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+216 98 123 456"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Identifiant Personnalisé (Optionnel - Auto-généré unique si vide)
                    </label>
                    <input
                      type="text"
                      value={customIdInput}
                      onChange={(e) => setCustomIdInput(e.target.value)}
                      placeholder="Laisser vide pour auto-génération unique"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Mot de Passe (Sera Chiffré SHA-256) *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer mt-2"
                >
                  Enregistrer l'Utilisateur dans la Base de Données
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Console Développeur BNA : Support DDL/DML natif pour Oracle Database & MySQL.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
