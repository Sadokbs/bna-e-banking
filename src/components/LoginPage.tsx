import React, { useState, useEffect } from 'react';
import { DEMO_ACCOUNTS } from '../data/mockData';
import { UserAccount, UserRole, StoredUserAccount } from '../types';
import { dbService } from '../services/db';
import { BnaLogo } from './BnaLogo';
import { CurrencyExchangeWidget } from './CurrencyExchangeWidget';
import { 
  ShieldCheck, 
  KeyRound, 
  User, 
  Building2, 
  Lock, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Info,
  Smartphone,
  Eye,
  EyeOff,
  HelpCircle,
  UserPlus,
  Mail,
  CreditCard,
  Phone,
  Check,
  Shield,
  FileCheck2,
  Copy,
  Database,
  Hash
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (account: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Mode: 'login' or 'register'
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifiantInput, setIdentifiantInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [showOtpStep, setShowOtpStep] = useState<boolean>(false);
  const [pendingAccount, setPendingAccount] = useState<StoredUserAccount | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Dynamic user accounts registry
  const [registeredUsers, setRegisteredUsers] = useState<StoredUserAccount[]>([]);

  useEffect(() => {
    setRegisteredUsers(dbService.getAllUsers());
  }, []);

  // Registration form state (First-time users)
  const [regFullName, setRegFullName] = useState<string>('');
  const [regCin, setRegCin] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regAccountType, setRegAccountType] = useState<UserRole>('CLIENT_PARTICULIER');
  const [regAcceptTerms, setRegAcceptTerms] = useState<boolean>(true);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);
  
  // Registration flow steps: 1 = Form, 2 = OTP SMS verification, 3 = Confirmation & ID Generated
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regOtpInput, setRegOtpInput] = useState<string>('');
  const [regError, setRegError] = useState<string | null>(null);
  const [createdAccountResult, setCreatedAccountResult] = useState<StoredUserAccount | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Handler for login submission
  const handleValidateIdentifiant = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = identifiantInput.trim();

    if (!cleanInput) {
      setErrorMessage("Veuillez saisir votre identifiant d'accès.");
      return;
    }

    setIsLoggingIn(true);
    try {
      // Find in secure database
      const matchedAccount = dbService.getUserByIdentifiant(cleanInput);

      if (!matchedAccount) {
        setErrorMessage(
          "Information incorrecte : Identifiant non reconnu dans la base de données. L'accès à la page demandée est refusé. Veuillez vérifier votre identifiant ou créer votre compte si vous êtes un nouveau client."
        );
        return;
      }

      // If user supplied a non-placeholder password, authenticate and verify cryptographic hash
      if (passwordInput && passwordInput !== '••••••••••••') {
        const authResult = await dbService.authenticate(cleanInput, passwordInput);
        if (!authResult.success) {
          setErrorMessage(authResult.error || "Information incorrecte : Mot de passe invalide.");
          return;
        }
      }

      // Valid identifiant and encrypted credentials! Proceed to OTP validation
      setPendingAccount(matchedAccount);
      setShowOtpStep(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFinalConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingAccount) {
      onLoginSuccess(pendingAccount);
    }
  };

  const handleQuickFill = (id: string) => {
    setActiveMode('login');
    setIdentifiantInput(id);
    setPasswordInput('••••••••••••');
    setErrorMessage(null);
    setShowOtpStep(false);
    setPendingAccount(null);
  };

  // Password strength calculator for registration
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const passwordScore = calculatePasswordStrength(regPassword);

  // Registration step 1 submit: Validate CIN, Phone, Email, Password
  const handleRegisterSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Validations
    if (!regFullName.trim()) {
      setRegError('Veuillez renseigner votre nom complet ou raison sociale.');
      return;
    }

    const cleanCin = regCin.replace(/\s+/g, '');
    if (!/^\d{8}$/.test(cleanCin)) {
      setRegError('Le numéro de Carte d\'Identité Nationale (CIN) doit comporter exactement 8 chiffres.');
      return;
    }

    const cleanPhone = regPhone.replace(/\s+/g, '');
    if (cleanPhone.length < 8) {
      setRegError('Veuillez saisir un numéro de téléphone mobile tunisien valide (8 chiffres).');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setRegError('Veuillez renseigner une adresse e-mail valide (ex: client@domaine.com).');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Les deux mots de passe saisis ne correspondent pas.');
      return;
    }

    if (!regAcceptTerms) {
      setRegError('Veuillez accepter les conditions générales du service E-Banking BNA.');
      return;
    }

    // Step 1 passed, advance to Step 2 (OTP SMS verification simulation)
    setRegOtpInput('884920'); // Pre-fill suggested OTP for instant ease
    setRegStep(2);
  };

  // Registration step 2 submit: Validate OTP, encrypt password, enforce unique ID in database
  const handleRegisterSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsRegistering(true);

    try {
      // Register through dbService with SHA-256 Salted PBKDF2 encryption + unique ID guarantee
      const result = await dbService.registerUser({
        role: regAccountType,
        name: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone,
        cin: regCin,
        password: regPassword
      });

      if (!result.success || !result.user) {
        setRegError(result.error || "Erreur lors de l'enregistrement dans la base de données.");
        return;
      }

      setCreatedAccountResult(result.user);
      setRegisteredUsers(dbService.getAllUsers());
      setRegStep(3);
    } catch (err) {
      setRegError("Erreur cryptographique ou base de données inattendue.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Copy identifiant to clipboard
  const handleCopyGeneratedId = () => {
    if (createdAccountResult) {
      navigator.clipboard.writeText(createdAccountResult.identifiant);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
    }
  };

  // Immediate connect with newly created account
  const handleDirectConnectNewAccount = () => {
    if (createdAccountResult) {
      onLoginSuccess(createdAccountResult);
    }
  };

  // Reset registration
  const handleResetRegistration = () => {
    setRegStep(1);
    setRegFullName('');
    setRegCin('');
    setRegPhone('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegError(null);
    setCreatedAccountResult(null);
    setActiveMode('login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        
        {/* Left Column: Authentic BNA E-Banking Info, 4-Step Account Creation Guide & Demo Identifiants Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-900/60 border border-emerald-700/60 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Système d'Authentification Sécurisé BNA</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bienvenue sur <span className="text-emerald-400">BNA E-Banking</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Accédez en toute sécurité à vos services bancaires ou activez votre premier accès en ligne en quelques minutes.
            </p>
          </div>

          {/* Mode Switch Tabs (Connexion vs Première Connexion) */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activeMode === 'login'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>J'ai déjà un compte (Connexion)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('register');
                setRegError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activeMode === 'register'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span className="relative">
                Première Connexion (Nouveau Client)
                <span className="hidden sm:inline-block ml-1.5 bg-emerald-400/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  4 étapes
                </span>
              </span>
            </button>
          </div>

          {/* Real-time BNA Currency Exchange Rates & Converter */}
          <CurrencyExchangeWidget />

          {/* Demo Identifiants Box (The 4 Pages Link Identifiers) */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Accès Rapides Préconfigurés (Comptes Démonstration)
                </h3>
              </div>
              <span className="text-[11px] bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                Cliquer pour tester
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Super Admin */}
              <button
                type="button"
                onClick={() => handleQuickFill('SUPERADMIN-IT88Ss')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  identifiantInput === 'SUPERADMIN-IT88Ss' && activeMode === 'login'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    1. Super Admin
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded">
                    SUPERADMIN
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-white group-hover:text-emerald-300">
                  SUPERADMIN-IT88Ss
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Configuration système, gestion admins & supervision globale.
                </p>
              </button>

              {/* Card 2: Admin */}
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN-BK42Xp')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  identifiantInput === 'ADMIN-BK42Xp' && activeMode === 'login'
                    ? 'bg-teal-950/80 border-teal-500 ring-2 ring-teal-500/30'
                    : 'bg-slate-900/80 border-slate-700 hover:border-teal-500/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-teal-400" />
                    2. Admin Fonctionnel
                  </span>
                  <span className="text-[10px] font-mono bg-teal-900/80 text-teal-300 px-1.5 py-0.5 rounded">
                    ADMIN
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-white group-hover:text-teal-300">
                  ADMIN-BK42Xp
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Gestion des applications, profils, menus & attribution droits.
                </p>
              </button>

              {/* Card 3: Client Particulier */}
              <button
                type="button"
                onClick={() => handleQuickFill('PARTICULIER-77401')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  identifiantInput === 'PARTICULIER-77401' && activeMode === 'login'
                    ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/80 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" />
                    3. Client Particulier
                  </span>
                  <span className="text-[10px] font-mono bg-blue-900/80 text-blue-300 px-1.5 py-0.5 rounded">
                    PARTICULIER
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-white group-hover:text-blue-300">
                  PARTICULIER-77401
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Comptes, cartes, virements, factures STEG/SONEDE, épargne.
                </p>
              </button>

              {/* Card 4: Client Professionnel */}
              <button
                type="button"
                onClick={() => handleQuickFill('PRO-99210')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  identifiantInput === 'PRO-99210' && activeMode === 'login'
                    ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    4. Client Professionnel
                  </span>
                  <span className="text-[10px] font-mono bg-amber-900/80 text-amber-300 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-white group-hover:text-amber-300">
                  PRO-99210
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Crédits agricoles, effets & lettres de change, mandats cash.
                </p>
              </button>
            </div>
          </div>

          {/* Security details footer note */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Toutes les données saisies (CIN, E-mail, Téléphone) sont chiffrées selon les normes bancaires TLS 1.3 et FIPS 180-4 de la Banque Nationale Agricole.
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Form (Login OR First-Time Registration) */}
        <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle green glow ornament */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header of the Right Card */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center shadow-xl border border-emerald-500/50 p-2.5 mb-3">
              <BnaLogo className="w-full h-full" variant="emerald" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {activeMode === 'login' ? 'Connexion E-Banking' : 'Création de Compte en Ligne'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeMode === 'login'
                ? "Entrez votre identifiant pour être dirigé vers votre espace"
                : "Activez votre accès avec CIN, e-mail, mot de passe et téléphone"}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* MODE 1: STANDARD LOGIN FORM                                               */}
          {/* ========================================================================= */}
          {activeMode === 'login' && (
            <>
              {/* Error Message Display when Identifiant is Incorrect */}
              {errorMessage && (
                <div className="mb-4 bg-rose-950/90 border-2 border-rose-600 rounded-xl p-3.5 text-rose-100 flex items-start space-x-3 shadow-xl">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-rose-200">
                      Accès Refusé
                    </p>
                    <p className="text-[11px] text-rose-300 leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {!showOtpStep ? (
                /* Step 1: Identifiant & Mot de passe */
                <form onSubmit={handleValidateIdentifiant} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Identifiant Réseau <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifiantInput}
                        onChange={(e) => {
                          setIdentifiantInput(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="ex: SUPERADMIN-IT88Ss ou PARTICULIER-77401"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                      <div className="absolute right-3 top-3 text-slate-500 text-xs">
                        ID
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Exemples : <code className="text-emerald-400">SUPERADMIN-IT88Ss</code>, <code className="text-blue-400">PARTICULIER-77401</code>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900" />
                      <span>Mémoriser l'identifiant</span>
                    </label>
                    <a 
                      href="#forgot" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        alert("Pour réinitialiser votre mot de passe, vous recevrez un code OTP sur votre numéro de téléphone mobile associé à votre CIN."); 
                      }} 
                      className="text-emerald-400 hover:underline"
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer mt-2"
                  >
                    <span>Accéder à l'Espace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-4 border-t border-slate-700/80 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('register');
                        setRegStep(1);
                        setRegError(null);
                      }}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Première fois ? Créer mon compte BNA avec CIN</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Validation OTP (Mot de passe à usage unique) */
                <form onSubmit={handleFinalConnect} className="space-y-5">
                  <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-xl p-3 text-xs text-emerald-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Identifiant Reconnu
                      </span>
                      <span className="bg-emerald-900 px-2 py-0.5 rounded text-[10px]">
                        {pendingAccount?.identifiant}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Compte associé : <strong className="text-white">{pendingAccount?.name}</strong> ({pendingAccount?.title})
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                      <span>Code OTP de Sécurité</span>
                      <span className="text-[10px] text-emerald-400 font-normal">SMS envoyé au {pendingAccount?.phone}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="Saisissez 889900 (Simulé)"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <Smartphone className="absolute right-3 top-3.5 w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-center">
                      Pour la démonstration, cliquez simplement sur "Confirmer la Connexion".
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <span>Confirmer la Connexion à {pendingAccount?.identifiant}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOtpStep(false)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium py-2 rounded-lg transition-all cursor-pointer"
                    >
                      Changer d'identifiant
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: FIRST-TIME REGISTRATION WIZARD (CIN, PHONE, EMAIL, PASSWORD)      */}
          {/* ========================================================================= */}
          {activeMode === 'register' && (
            <div className="space-y-4">
              
              {/* Registration Stepper indicator */}
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-700/80 text-[11px]">
                <div className={`flex items-center space-x-1.5 ${regStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${regStep >= 1 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800'}`}>1</span>
                  <span>Informations</span>
                </div>
                <div className="w-6 h-0.5 bg-slate-700"></div>
                <div className={`flex items-center space-x-1.5 ${regStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${regStep >= 2 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800'}`}>2</span>
                  <span>Validation SMS</span>
                </div>
                <div className="w-6 h-0.5 bg-slate-700"></div>
                <div className={`flex items-center space-x-1.5 ${regStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${regStep >= 3 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800'}`}>3</span>
                  <span>Activation</span>
                </div>
              </div>

              {/* Error Message */}
              {regError && (
                <div className="bg-rose-950/90 border-2 border-rose-600 rounded-xl p-3 text-rose-100 flex items-start space-x-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* REGISTRATION STEP 1: INPUT FORM (CIN, PHONE, EMAIL, PASSWORD) */}
              {regStep === 1 && (
                <form onSubmit={handleRegisterSubmitStep1} className="space-y-3.5">
                  
                  {/* Account Type Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wide">
                      Type de Compte à Activer
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegAccountType('CLIENT_PARTICULIER')}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                          regAccountType === 'CLIENT_PARTICULIER'
                            ? 'bg-blue-950/80 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <User className="w-4 h-4 shrink-0" />
                        <div>
                          <div className="text-xs font-bold leading-tight">Particulier</div>
                          <div className="text-[10px] text-slate-400">Compte individuel</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegAccountType('CLIENT_PROFESSIONNEL')}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                          regAccountType === 'CLIENT_PROFESSIONNEL'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Building2 className="w-4 h-4 shrink-0" />
                        <div>
                          <div className="text-xs font-bold leading-tight">Professionnel</div>
                          <div className="text-[10px] text-slate-400">Agriculteur / Société</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Field: Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wide">
                      Nom et Prénom / Raison Sociale <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="ex: Ahmed Trabelsi"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <User className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Row: CIN and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Field 1: Numéro Carte d'Identité (CIN) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wide">
                        Numéro CIN (8 chiffres) <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={8}
                          value={regCin}
                          onChange={(e) => setRegCin(e.target.value.replace(/\D/g, ''))}
                          placeholder="ex: 08765432"
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                        <CreditCard className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                      </div>
                    </div>

                    {/* Field 2: Numéro de Téléphone */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wide">
                        Téléphone Mobile <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="ex: 98 123 456"
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                      </div>
                    </div>
                  </div>

                  {/* Field 3: E-mail */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wide">
                      Adresse E-mail <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="ex: ahmed.trabelsi@gmail.com"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Field 4: Password & Confirmation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wide">
                        Mot de Passe <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 8 caractères"
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wide">
                        Confirmer Mot de Passe <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? "text" : "password"}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Répéter mot de passe"
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {regPassword && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Force du mot de passe</span>
                        <span className={`font-bold ${
                          passwordScore >= 75 ? 'text-emerald-400' : passwordScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {passwordScore >= 75 ? 'Robuste' : passwordScore >= 50 ? 'Moyen' : 'Faible'}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passwordScore >= 75 ? 'bg-emerald-500' : passwordScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${passwordScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Terms acceptance */}
                  <label className="flex items-start space-x-2 text-[11px] text-slate-400 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regAcceptTerms}
                      onChange={(e) => setRegAcceptTerms(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 mt-0.5"
                    />
                    <span>
                      J'atteste être titulaire de la CIN renseignée et j'accepte les conditions générales du service E-Banking BNA.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>Continuer vers la Validation SMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveMode('login')}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Vous avez déjà un compte ? <strong className="text-emerald-400 underline">Se connecter</strong>
                    </button>
                  </div>
                </form>
              )}

              {/* REGISTRATION STEP 2: SMS OTP VERIFICATION */}
              {regStep === 2 && (
                <form onSubmit={handleRegisterSubmitStep2} className="space-y-4">
                  <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-xl p-3.5 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <Smartphone className="w-4 h-4" />
                      <span>Code d'activation envoyé par SMS</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Un code à 6 chiffres a été envoyé au numéro <strong className="text-white">{regPhone}</strong> pour valider l'association de votre CIN <strong className="text-white">{regCin}</strong> et de votre e-mail <strong className="text-white">{regEmail}</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide text-center">
                      Code de Sécurité Reçu (OTP)
                    </label>
                    <input
                      type="text"
                      required
                      value={regOtpInput}
                      onChange={(e) => setRegOtpInput(e.target.value)}
                      placeholder="884920"
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 text-center">
                      Pour la démonstration, le code de test <code className="text-emerald-400 font-bold">884920</code> est pré-rempli.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Valider & Générer Mon Identifiant BNA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Modifier mes coordonnées</span>
                    </button>
                  </div>
                </form>
              )}

              {/* REGISTRATION STEP 3: SUCCESS & IDENTIFIER DISPLAY */}
              {regStep === 3 && createdAccountResult && (
                <div className="space-y-4">
                  <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Compte E-Banking Activé avec Succès !
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Bienvenue, <strong className="text-white">{createdAccountResult.name}</strong>. Votre dossier lié à la CIN <strong className="text-white">{regCin}</strong> est maintenant actif.
                      </p>
                    </div>

                    {/* Generated Identifiant display */}
                    <div className="bg-slate-900 border border-emerald-700/60 rounded-xl p-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Votre Identifiant Réseau Unique BNA
                      </span>
                      <div className="text-lg font-mono font-black text-emerald-400 flex items-center justify-center gap-2">
                        <span>{createdAccountResult.identifiant}</span>
                        <button
                          type="button"
                          onClick={handleCopyGeneratedId}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-all"
                          title="Copier l'identifiant"
                        >
                          {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {copiedId && (
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          Identifiant copié dans le presse-papier !
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-tight">
                      Une confirmation d'inscription avec vos accès a également été expédiée à <span className="text-slate-200">{createdAccountResult.email}</span>.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleDirectConnectNewAccount}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <span>Accéder Immédiatement à Mon Espace Bancaire</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetRegistration}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium py-2 rounded-lg transition-all cursor-pointer"
                    >
                      Retourner à la page de connexion
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Page Footer */}
      <div className="max-w-6xl mx-auto w-full text-center border-t border-slate-800 pt-6 mt-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Banque Nationale Agricole (BNA). Tous droits réservés.</p>
        <div className="flex space-x-4">
          <span className="text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> BNA Security Core
          </span>
          <a href="#help" onClick={(e) => e.preventDefault()} className="hover:text-slate-400">Mentions Légales</a>
          <a href="#help" onClick={(e) => e.preventDefault()} className="hover:text-slate-400">Guide de Sécurité</a>
          <a href="#help" onClick={(e) => e.preventDefault()} className="hover:text-slate-400">Assistance Client : 71 830 000</a>
        </div>
      </div>
    </div>
  );
};
