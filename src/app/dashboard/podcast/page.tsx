"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/interface/sidebar';
import MainContent from '@/components/interface/mainContent';
import { useUser } from '@clerk/nextjs';

interface Chat {
  id: number;
  title: string;
}

interface PodcastPayload {
  title: string;
  hosts: string[];
  style: string;
  length_minutes: number;
  user_id: string;
}

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<Chat[]>([
    { id: 1, title: 'Previous Chat 1' },
    { id: 2, title: 'Previous Chat 2' },
  ]);
  
  const { user, isLoaded, isSignedIn } = useUser();
  const name = isLoaded && isSignedIn ? user?.fullName || 'User' : 'User';
  const userId = isLoaded && isSignedIn ? user.id : "guestwhy123";
  console.log("User ID:", userId);
  const [formData, setFormData] = useState<PodcastPayload>({
    title: '',
    hosts: [],
    style: '',
    length_minutes: 0,
    user_id: userId,
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setFormData(prev => ({
        ...prev,
        user_id: user.id,
      }));
    }
  }, [isLoaded, isSignedIn, user?.id]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNewChat = () => {
    // Save current chat to history if there's a title
    if (formData.title.trim()) {
      setHistory((prev) => [
        ...prev,
        { id: prev.length + 1, title: formData.title },
      ]);
    }
    // Reset form for a new chat
    setFormData({
      title: '',
      hosts: [],
      style: '',
      length_minutes: 0,
      user_id: isLoaded && isSignedIn ? user.id : 'guestwhy123',
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        history={history}
        onNewChat={handleNewChat}
        name={name}
      />
      <MainContent formData={formData} setFormData={setFormData} />
    </div>
  );
}