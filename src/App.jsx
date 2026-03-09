import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import ForecastView from './components/Forecast/ForecastView';
import LoginPage from './components/LoginPage';
import UsersView from './components/Users/UsersView';
import DemoBanner from './components/DemoBanner';
import { useTransactions } from './hooks/useTransactions';
import { useForecasts } from './hooks/useForecasts';
import { useAuth } from './hooks/useAuth';
import { useUserRole } from './hooks/useUserRole';
import { isSupabaseReady, isDemoMode } from './lib/supabase';
import { sampleTransactions, sampleForecasts } from './data/sampleData';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div
        className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"
        style={{ borderTopColor: 'var(--primary)' }}
      />
      <p className="text-sm text-gray-400">Adatok betöltése...</p>
    </div>
  );
}

function MainApp({ user, onSignOut, userRole }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    transactions,
    incomeCategories,
    loading: txLoading,
    addTransaction,
    deleteTransaction,
    deleteTransactions,
    toggleStatus,
    addIncomeCategory,
    resetDemo,
  } = useTransactions();

  const {
    forecasts,
    loading: fcLoading,
    addForecast,
    updateForecastStatus,
    deleteForecast,
    resetDemo: resetDemoFc,
  } = useForecasts();

  const loading = txLoading || fcLoading;

  function handleDemoReset() {
    if (resetDemo) resetDemo();
    if (resetDemoFc) resetDemoFc();
  }

  const canEdit = userRole === 'master_admin' || userRole === 'admin' || userRole === 'manager';
  const canManageUsers = userRole === 'master_admin' || userRole === 'admin';
  const canManageCategories = userRole === 'master_admin' || userRole === 'admin';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <DemoBanner onReset={handleDemoReset} />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignOut={onSignOut}
        canManageUsers={canManageUsers}
        userRole={userRole}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <Dashboard transactions={transactions} forecasts={forecasts} />
          )}
          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              incomeCategories={incomeCategories}
              onToggleStatus={toggleStatus}
              onDelete={deleteTransaction}
              onDeleteBulk={deleteTransactions}
              onAdd={addTransaction}
              onAddCategory={addIncomeCategory}
              canEdit={canEdit}
              canManageCategories={canManageCategories}
            />
          )}
          {activeTab === 'forecast' && (
            <ForecastView
              forecasts={forecasts}
              onAdd={addForecast}
              onStatusChange={updateForecastStatus}
              onDelete={deleteForecast}
              canEdit={canEdit}
            />
          )}
          {activeTab === 'users' && canManageUsers && (
            <UsersView userRole={userRole} />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { userRole, roleLoading } = useUserRole(isDemoMode ? { id: 'demo', email: 'demo@demo.hu' } : user);

  if (authLoading || (isSupabaseReady && !isDemoMode && user && roleLoading)) {
    return <LoadingSpinner />;
  }

  // Demo módban nincs login
  if (!isDemoMode && isSupabaseReady && !user) {
    return <LoginPage onLogin={signIn} />;
  }

  const effectiveRole = isDemoMode ? 'master_admin' : (userRole || 'master_admin');

  return <MainApp user={isDemoMode ? { email: 'demo@scrollers.hu' } : user} onSignOut={isDemoMode ? null : signOut} userRole={effectiveRole} />;
}
