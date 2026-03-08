import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import ForecastView from './components/Forecast/ForecastView';
import ClientsView from './components/Clients/ClientsView';
import LoginPage from './components/LoginPage';
import { useTransactions } from './hooks/useTransactions';
import { useForecasts } from './hooks/useForecasts';
import { useGoals } from './hooks/useGoals';
import { useAuth } from './hooks/useAuth';
import { isSupabaseReady } from './lib/supabase';
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

function MainApp({ user, onSignOut }) {
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
  } = useTransactions();

  const {
    forecasts,
    loading: fcLoading,
    addForecast,
    updateForecastStatus,
    deleteForecast,
  } = useForecasts();

  const { goals, setGoal } = useGoals();

  const knownPartners = useMemo(
    () => getKnownPartners(transactions, forecasts),
    [transactions, forecasts]
  );

  const loading = txLoading || fcLoading;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onSignOut={onSignOut} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="pb-16 sm:pb-0">
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
              knownClients={knownPartners}
            />
          )}
          {activeTab === 'clients' && (
            <ClientsView transactions={transactions} forecasts={forecasts} />
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();

  if (authLoading) return <LoadingSpinner />;

  if (isSupabaseReady && !user) {
    return <LoginPage onLogin={signIn} />;
  }

  return <MainApp user={user} onSignOut={signOut} />;
}
