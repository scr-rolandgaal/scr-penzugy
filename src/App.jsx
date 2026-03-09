import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import ForecastView from './components/Forecast/ForecastView';
import ClientsView from './components/Clients/ClientsView';
import LoginPage from './components/LoginPage';
import UsersView from './components/Users/UsersView';
import DemoBanner from './components/DemoBanner';
import { useTransactions } from './hooks/useTransactions';
import { useForecasts } from './hooks/useForecasts';
import { useGoals } from './hooks/useGoals';
import { useAuth } from './hooks/useAuth';
import { useUserRole } from './hooks/useUserRole';
import { isSupabaseReady, isDemoMode } from './lib/supabase';
import { getKnownPartners } from './utils/calculations';

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
    expenseCategories,
    loading: txLoading,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    toggleStatus,
    addIncomeCategory,
    addExpenseCategory,
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

  const { goals, setGoal } = useGoals();

  const knownPartners = useMemo(
    () => getKnownPartners(transactions, forecasts),
    [transactions, forecasts]
  );

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
        dbConnected={isSupabaseReady}
        canManageUsers={canManageUsers}
        userRole={userRole}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mobile-content-wrap">
          {activeTab === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              forecasts={forecasts}
              goals={goals}
              setGoal={setGoal}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              onToggleStatus={toggleStatus}
              onDelete={deleteTransaction}
              onDeleteBulk={deleteTransactions}
              onAdd={addTransaction}
              onAddBulk={addTransactions}
              onAddCategory={addIncomeCategory}
              canEdit={canEdit}
              canManageCategories={canManageCategories}
              onAddExpenseCategory={addExpenseCategory}
              onUpdateTransaction={updateTransaction}
              knownPartners={knownPartners}
            />
          )}
          {activeTab === 'forecast' && (
            <ForecastView
              forecasts={forecasts}
              onAdd={addForecast}
              onStatusChange={updateForecastStatus}
              onDelete={deleteForecast}
              canEdit={canEdit}
              knownClients={knownPartners}
            />
          )}
          {activeTab === 'clients' && (
            <ClientsView transactions={transactions} forecasts={forecasts} />
          )}
          {activeTab === 'users' && canManageUsers && (
            <UsersView userRole={userRole} />
          )}
        </div>
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
