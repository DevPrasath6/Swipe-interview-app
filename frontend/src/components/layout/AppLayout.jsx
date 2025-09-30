import React from 'react';
import Topbar from './Topbar';

export default function AppLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="app-layout">
      <Topbar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
