"use client";
import { useState } from 'react';
import Sidebar from '@/components/interface/sidebar';
import MainContent from '@/components/interface/mainContent';

interface Chat {
  id: number;
  title: string;
}

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<Chat[]>([
    { id: 1, title: 'Previous Chat 1' },
    { id: 2, title: 'Previous Chat 2' },
  ]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        history={history}
      />
      <MainContent />
    </div>
  );
}