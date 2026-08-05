import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { FeedPage } from './pages/FeedPage';
import { ActivityFeedPage } from './pages/ActivityFeedPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportPage } from './pages/ReportPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { GeoJSONMapView } from './components/GeoJSONMapView';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'report' | 'activity' | 'profile' | 'admin' | 'login' | 'register'>('home');

  const handleLoginSuccess = (role?: UserRole) => {
    if (role === 'OFFICIAL' || role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-on-surface selection:bg-primary selection:text-white pb-20 md:pb-0">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'home' && (
            <FeedPage
              isAuthenticated={isAuthenticated}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'map' && <GeoJSONMapView />}
          {activeTab === 'report' && (
            <ReportPage
              isAuthenticated={isAuthenticated}
              onSuccessNavigate={() => setActiveTab('home')}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
          {activeTab === 'activity' && <ActivityFeedPage />}
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
