import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-slate-300">CivicFix Enterprise Platform</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
