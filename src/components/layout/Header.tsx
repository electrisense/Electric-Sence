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
        return activeSessionTitle || 'Electrical Engineering AI Chat';
      case 'subjects':
        return 'Electrical Engineering Curriculum & Concepts';
      case 'tools':
        return 'Engineering Calculators & Analyzers';
      case 'study-materials':
        return 'Academic Study Materials & Formula Sheets';
      case 'projects':
        return 'EEE Project Blueprints & Hardware Assistance';
      case 'settings':
        return 'Application Configuration & Preferences';
      default:
        return 'Electric Sence';
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hidden sm:inline-block">
            Electric Sence
          </span>
          <span className="text-slate-300 hidden sm:inline-block">/</span>
          <h1 className="text-sm font-semibold text-slate-800 truncate max-w-xs md:max-w-md">
            {getTabLabel(currentTab)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-mono border border-slate-200">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>Department of EEE</span>
        </div>
      </div>
    </header>
  );
};
