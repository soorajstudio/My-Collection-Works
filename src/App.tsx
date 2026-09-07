import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/landing/LandingPage';
import { MainDashboardPage } from './pages/dashboard/MainDashboardPage';
import { BooksDashboardPage } from './pages/books/BooksDashboardPage';
import { BookDetailPage } from './pages/books/BookDetailPage';
import { CertificatesDashboardPage } from './pages/certificates/CertificatesDashboardPage';
import { CertificatesListPage } from './pages/certificates/CertificatesListPage';
import { CertificateDetailPage } from './pages/certificates/CertificateDetailPage';
import { ProjectsDashboardPage } from './pages/projects/ProjectsDashboardPage';
import { ProjectsListPage } from './pages/projects/ProjectsListPage';
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage';
import { WishlistPage } from './pages/wishlist/WishlistPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#07090e] text-indigo-500">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RootHandler: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#07090e] text-indigo-500">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Navigate to="/dashboard" replace />;
};

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Root Route: Shows Intro Landing Page if visitor, or redirects to Dashboard if logged in */}
              <Route path="/" element={<RootHandler />} />
              
              {/* Dedicated Intro Page */}
              <Route path="/intro" element={<LandingPage />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<MainDashboardPage />} />

                {/* Books */}
                <Route path="/books" element={<BooksDashboardPage />} />
                <Route path="/books/all" element={<Navigate to="/books" replace />} />
                <Route path="/books/:id" element={<BookDetailPage />} />

                {/* Certificates */}
                <Route path="/certificates" element={<CertificatesDashboardPage />} />
                <Route path="/certificates/all" element={<CertificatesListPage />} />
                <Route path="/certificates/:id" element={<CertificateDetailPage />} />

                {/* Projects */}
                <Route path="/projects" element={<ProjectsDashboardPage />} />
                <Route path="/projects/all" element={<ProjectsListPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />

                {/* Wishlist */}
                <Route path="/wishlist" element={<WishlistPage />} />

                {/* Account */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
