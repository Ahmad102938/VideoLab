// components/MainContent.tsx
import PromptCard from './PromptCard';
import InputArea from './InputArea';
import { FaList, FaEnvelope, FaFileAlt, FaCog } from 'react-icons/fa';

const prompts = [
  { icon: <FaList />, text: 'Write a to-do list for a personal project or task' },
  { icon: <FaEnvelope />, text: 'Generate an email no reply to a job offer' },
  { icon: <FaFileAlt />, text: 'Summarise this article or text for me in one or paragraph' },
  { icon: <FaCog />, text: 'How does AI work a technical capacity' },
];

export default function MainContent() {
  return (
    <div className="flex-1 bg-gray-200 p-8 relative">
      <div className="text-3xl font-bold text-gray-800">
        Hi there,{' '}
        <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-transparent bg-clip-text">
          John
        </span>
      </div>
      <div className="text-xl mt-2 text-gray-800">
        What would{' '}
        <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-transparent bg-clip-text">
          like to
        </span>{' '}
        know?
      </div>
      <div className="text-sm text-gray-600 mt-1">
        Use one of the most common prompts below or use your own
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        {prompts.map((prompt, index) => (
          <PromptCard key={index} icon={prompt.icon} text={prompt.text} />
        ))}
      </div>
      <button className="mt-4 text-purple-600 hover:underline text-sm">
        Refresh Prompts ↻
      </button>
      <InputArea />
      <img
        src="/avatar.jpg"
        alt="User Avatar"
        className="w-12 h-12 rounded-full absolute bottom-4 left-4"
      />
    </div>
  );
}