// components/MainContent.tsx
import PodcastForm from './PodcastForm';
import { Dispatch, SetStateAction } from 'react';
import { useUser } from '@clerk/nextjs';

interface PodcastPayload {
  title: string;
  hosts: string[];
  style: string;
  length_minutes: number;
  user_id: string;
}

interface MainContentProps {
  formData: PodcastPayload;
  setFormData: Dispatch<SetStateAction<PodcastPayload>>;
}

export default function MainContent({ formData, setFormData }: MainContentProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const name = isLoaded && isSignedIn ? user?.fullName || 'User' : 'User';
  return (
    <div className="flex-1 p-6 md:p-10 relative">
      <div className="text-4xl md:text-5xl font-bold">
        Hi there,{' '}
        <span className="gradient-text">
          {name}
        </span>
      </div>
      <div className="text-2xl md:text-3xl mt-2">
        What would{' '}
        <span className="gradient-text">
          like to
        </span>{' '}
        Generate?
      </div>
      <div className="text-sm text-gray-400 mt-1">
        Create a podcast session by filling out the details below.
      </div>
      <PodcastForm formData={formData} setFormData={setFormData} />
    </div>
  );
}