// components/Sidebar.tsx
import { FaPlus, FaSearch, FaHistory, FaCog } from 'react-icons/fa';
import logo from '@/assets/img5.png';
import Image from 'next/image';
import { useState } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  history: Chat[];
}

export default function Sidebar({ isCollapsed, toggleSidebar, history }: SidebarProps) {
    const [open, setOpen] = useState(false);
    const chatHandler = (e) => {
    e.preventDefault();
    setOpen(!open);
    }
  return (
    <div
      className={`bg-[#FFA896] ${
        isCollapsed ? 'w-16' : 'w-64'
      } transition-width duration-300 flex flex-col h-full`}
    >
      <div className="p-4">
        <Image src={logo} alt="Logo" className="w-8 h-8" />
      </div>
      <button onClick={toggleSidebar} className="p-4 text-gray-600 hover:bg-gray-200">
        {isCollapsed ? '→' : '←'}
      </button>
      <button className="p-4 flex items-center text-gray-600 hover:bg-gray-200">
        <FaPlus />
        {!isCollapsed && <span className="ml-2 " onClick={chatHandler} >New Chat</span>}
      </button>
      {!isCollapsed && (
        <div className={`${open ? 'block' : 'hidden'} p-4`}>
        <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 border border-gray-300 rounded-2xl bg-gray-600  text-sm"
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {history.map((chat) => (
          <div
            key={chat.id}
            className="p-4 flex items-center text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            <FaHistory />
            {!isCollapsed && <span className="ml-2">{chat.title}</span>}
          </div>
        ))}
      </div>
      <button className="p-4 flex items-center text-gray-600 hover:bg-gray-200">
        <FaCog />
        {!isCollapsed && <span className="ml-2">Settings</span>}
      </button>
    </div>
  );
}