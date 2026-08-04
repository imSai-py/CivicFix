import React from 'react';
import { Shield, Building2 } from 'lucide-react';

interface FooterProps {
  onOpenStaffLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStaffLogin }) => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-slate-300">CivicFix Platform</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>

        {onOpenStaffLogin && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenStaffLogin}
              className="text-slate-600 hover:text-slate-400 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <Building2 className="w-3 h-3 text-slate-600" />
              <span>Municipal Staff Login</span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
