import React from 'react';

interface MainLayoutProps {
  header: React.ReactNode;
  leftSidebar: React.ReactNode;
  center: React.ReactNode;
  rightSidebar: React.ReactNode;
  modals: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ header, leftSidebar, center, rightSidebar, modals }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 bg-glass-gradient overflow-hidden font-sans text-slate-700 relative">
      <div className="relative z-10 flex flex-col h-full">
        {modals}
        {header}
        <div className="flex-1 flex overflow-hidden">
            {leftSidebar}
            {center}
            {rightSidebar}
        </div>
      </div>
    </div>
  );
};