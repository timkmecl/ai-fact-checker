import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useHistory } from './hooks/useHistory';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';

const App: React.FC = () => {
  const { isAuthenticated, passwordInput, setPasswordInput, authError, handleLogin, handleLogout } = useAuth();
  const { history, addToHistory, deleteHistoryItem, clearHistory } = useHistory();

  if (!isAuthenticated) {
    return (
      <LoginPage
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        authError={authError}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <MainPage
      onLogout={handleLogout}
      history={history}
      onSelectHistory={() => {}} // Will be handled inside MainPage
      onClearHistory={clearHistory}
      onDeleteHistoryItem={deleteHistoryItem}
      addToHistory={addToHistory}
    />
  );
};

export default App;