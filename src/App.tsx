import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { WaitlistPage } from './pages/WaitlistPage';
import { InviteLandingPage } from './pages/InviteLandingPage';
import { AccountPage } from './pages/AccountPage';
import { SettingsPage } from './pages/SettingsPage';
import AddTimesPage from './pages/AddTimesPage';
import { useAuth } from './hooks/useAuth';

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div aria-label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!user.consent_at) {
    return <Navigate to="/onboarding" replace />;
  }
  if (!user.has_access) {
    return <Navigate to="/waitlist" replace />;
  }
  return <Navigate to="/main" replace />;
}

function AppRoutes() {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate('/main');
  };

  const handleWaitlistAdmitted = () => {
    navigate('/main');
  };

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/main" element={<MainPage />} />
      <Route
        path="/onboarding"
        element={<OnboardingPage onComplete={handleOnboardingComplete} />}
      />
      <Route path="/waitlist" element={<WaitlistPage onAdmitted={handleWaitlistAdmitted} />} />
      <Route path="/add-times" element={<AddTimesPage />} />
      <Route path="/invite/:token" element={<InviteLandingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
