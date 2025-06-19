import { ReactNode } from 'react';

interface PromptCardProps {
  icon: ReactNode;
  text: string;
}

export default function PromptCard({ icon, text }: PromptCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow flex flex-col items-center w-48 h-28 hover:shadow-lg transition-shadow">
      <div className="text-2xl text-gray-600">{icon}</div>
      <p className="text-sm mt-2 text-gray-600 text-center">{text}</p>
    </div>
  );
}