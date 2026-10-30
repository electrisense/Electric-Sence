import React from 'react';
import { Menu, Zap } from 'lucide-react';
import type { NavigationTab } from '../../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileMenu: () => void;
  activeSessionTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  activeSessionTitle
}) => {
  const getTabLabel = (tab: NavigationTab) => {
    switch (tab) {
      case 'chat':
        return activeSessionTitle || 'Chat Assistant';
      case 'subjects':
        return 'EE Subjects Curriculum';
      case 'tools':
        return 'Engineering Tools & Calculators';
      case 'study-materials':
        return 'Study Materials & Formula Sheets';
      case 'projects':
        return 'EEE Projects Assistance';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'Electric Sence';
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hidden sm:inline-block shrink-0">
            Electric Sence
          </span>
          <span className="text-slate-300 hidden sm:inline-block">/</span>
          <h1 className="text-sm font-semibold text-slate-900 truncate">
            {getTabLabel(currentTab)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-mono border border-slate-200">
          <Zap className="w-3 h-3 text-blue-600" />
          <span className="hidden sm:inline">Department of EEE</span>
          <span className="sm:hidden">EEE</span>
        </div>
      </div>
    </header>
  );
};
