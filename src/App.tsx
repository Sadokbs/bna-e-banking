/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount } from './types';
import { DEMO_ACCOUNTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { SuperAdminPage } from './components/SuperAdminPage';
import { AdminPage } from './components/AdminPage';
import { ClientParticulierPage } from './components/ClientParticulierPage';
import { ClientProfessionnelPage } from './components/ClientProfessionnelPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSelectIdentifiantFromNav = (identifiant: string) => {
    const acc = DEMO_ACCOUNTS[identifiant];
    if (acc) {
      setCurrentUser(acc);
    }
  };

  const handleSelectUserFromDb = (user: UserAccount) => {
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onSelectIdentifiant={handleSelectIdentifiantFromNav}
        onSelectUserFromDb={handleSelectUserFromDb}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {!currentUser ? (
          /* When not authenticated, show Login Portal */
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* When authenticated, render the specific page linked to the user's Identifiant & Role */
          <>
            {currentUser.role === 'SUPER_ADMIN' && (
              <SuperAdminPage currentUser={currentUser} />
            )}

            {currentUser.role === 'ADMIN' && (
              <AdminPage currentUser={currentUser} />
            )}

            {currentUser.role === 'CLIENT_PARTICULIER' && (
              <ClientParticulierPage currentUser={currentUser} />
            )}

            {currentUser.role === 'CLIENT_PROFESSIONNEL' && (
              <ClientProfessionnelPage currentUser={currentUser} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
