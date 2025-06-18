import Image from 'next/image';
import { FaPlus, FaSearch, FaHistory, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import logo from '@/assets/mic.webp';
import { UserButton } from '@clerk/nextjs';
import { getCurrentUser } from '@/action/getCurrentUser';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  history: Chat[];
  onNewChat: () => void;
  name: string;
}

export default function Sidebar({ isCollapsed, toggleSidebar, history, onNewChat, name }: SidebarProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Toggle Button - Visible only on <768px */}
      <button
        onClick={toggleSidebar}
        className="p-4 text-neon-cyan hover:text-neon-purple md:hidden fixed top-0 right-0 z-50"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`glass block ${isCollapsed && 'max-md:hidden'} ${
          isCollapsed ? 'w-16 md:w-0 lg:w-16 ' : 'w-64 md:w-64 lg:w-72'
        } transition-all duration-300 flex flex-col min-h-screen shadow-lg md:shadow-none fixed top-0 left-0 z-40 lg:static overflow-hidden md:overflow-visible lg:overflow-visible`}
      >
        {/* Header Section */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src={logo} alt="Logo" className="w-8 h-8 rounded-full" />
            {!isCollapsed && (
              <span className="text-lg font-bold text-neon-purple">VideoLab</span>
            )}
          </div>
          {/* Desktop Toggle Button - Hidden on mobile and md, visible on lg */}
          <button
            onClick={toggleSidebar}
            className="p-4 text-neon-cyan hover:text-neon-purple hidden lg:block"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="p-4 flex items-center text-neon-purple hover:bg-glass-white glow-on-hover"
        >
          <FaPlus />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </button>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {history.map((chat) => (
            <div
              key={chat.id}
              className="p-4 flex items-center text-gray-300 hover:bg-glass-white glow-on-hover cursor-pointer"
            >
              <FaHistory />
              {!isCollapsed && <span className="ml-2">{chat.title}</span>}
            </div>
          ))}
        </div>

        {/* User Section */}
        <div className="p-4 flex items-center">
          <UserButton />
          {!isCollapsed && <span className="text-gray-300 pl-1.5">{name}</span>}
        </div>
      </div>
    </div>
  );
}