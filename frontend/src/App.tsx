import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { FeedPage } from './pages/FeedPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportPage } from './pages/ReportPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { GeoJSONMapView } from './components/GeoJSONMapView';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'report' | 'admin' | 'profile' | 'login' | 'register'>('feed');

  const handleLoginSuccess = (role?: UserRole) => {
    if (role === 'OFFICIAL' || role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('feed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'feed' && (
            <FeedPage
              isAuthenticated={isAuthenticated}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'map' && <GeoJSONMapView />}
          {activeTab === 'report' && (
            <ReportPage
              isAuthenticated={isAuthenticated}
              onSuccessNavigate={() => setActiveTab('feed')}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
          {activeTab === 'admin' && <AdminDashboardPage />}
          {activeTab === 'profile' && <ProfilePage onSwitchToLogin={() => setActiveTab('login')} />}
          {activeTab === 'login' && (
            <LoginPage
              onSwitchToRegister={() => setActiveTab('register')}
              onSuccess={(role) => handleLoginSuccess(role)}
            />
          )}
          {activeTab === 'register' && (
            <RegisterPage onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </main>
      </div>

      <Footer onOpenStaffLogin={() => setActiveTab('login')} />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};
