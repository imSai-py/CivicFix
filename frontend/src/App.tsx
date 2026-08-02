import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FeedPage } from './pages/FeedPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CreateIssueModal } from './components/CreateIssueModal';
import { GeoJSONMapView } from './components/GeoJSONMapView';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'admin' | 'login' | 'register'>('feed');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      setActiveTab('login');
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div>
        <Navbar
          onOpenCreateModal={handleOpenCreateModal}
          activeTab={activeTab === 'admin' ? 'admin' : activeTab === 'map' ? 'map' : 'feed'}
          setActiveTab={(tab) => setActiveTab(tab)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'feed' && <FeedPage isAuthenticated={isAuthenticated} />}
          {activeTab === 'map' && <GeoJSONMapView />}
          {activeTab === 'admin' && <AdminDashboardPage />}
          {activeTab === 'login' && (
            <LoginPage
              onSwitchToRegister={() => setActiveTab('register')}
              onSuccess={() => setActiveTab('feed')}
            />
          )}
          {activeTab === 'register' && (
            <RegisterPage onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </main>
      </div>

      <Footer />

      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setActiveTab('feed')}
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
