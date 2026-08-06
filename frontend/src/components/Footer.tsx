import React from 'react';
import { Shield, Building2 } from 'lucide-react';

interface FooterProps {
  onOpenStaffLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStaffLogin }) => {
  return (
    <footer className="border-t border-[#1b1e34] bg-[#0e101d] py-8 mt-12 pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-label">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#00ffcc]" />
          <span className="font-bold text-white">CivicFix Platform</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>

        {onOpenStaffLogin && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenStaffLogin}
              className="text-slate-400 hover:text-[#00ffcc] transition-colors inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[11px]"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00ffcc]" />
              <span>Municipal Staff Login</span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
