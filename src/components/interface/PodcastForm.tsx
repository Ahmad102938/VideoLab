// components/PodcastForm.tsx
import { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useRouter} from "next/navigation";

interface PodcastPayload {
  title: string;
  hosts: string[];
  style: string;
  length_minutes: number;
  description: string;
  user_id: string;
}

interface PodcastFormProps {
  formData: PodcastPayload;
  setFormData: Dispatch<SetStateAction<PodcastPayload>>;
}

export default function PodcastForm({ formData, setFormData }: PodcastFormProps) {
  const [hostInput, setHostInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const router = useRouter();
  // const { podcastId } = useParams();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'length_minutes' ? parseInt(value) || 0 : value,
    }));
  };

  const handleHostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostInput(e.target.value);
  };

  const addHost = () => {
    if (hostInput.trim() && !formData.hosts.includes(hostInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        hosts: [...prev.hosts, hostInput.trim()],
      }));
      setHostInput('');
    }
  };

  const removeHost = (host: string) => {
    setFormData((prev) => ({
      ...prev,
      hosts: prev.hosts.filter((h) => h !== host),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScriptId(null);
    console.log('Submitting form data:', formData);
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if(response.ok) {
        router.push(`/dashboard/podcast/${data.podcastId}/edit-script`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate script');
      }

      setScriptId(data.scriptId);
      console.log('Script generated and stored with ID:', data.scriptId);
      console.log(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the script');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto" method='POST'>
        <div className="col-span-1">
          <label className="block text-sm text-gray-300 mb-1">Podcast Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Future of AI"
            className="w-full p-3 bg-glass-white text-white placeholder-gray-400 rounded-xl border border-neon-purple/30 focus:outline-none focus:ring-2 focus:ring-neon-purple"
            required
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm text-gray-300 mb-1">Hosts</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={hostInput}
              onChange={handleHostInputChange}
              placeholder="Add a host"
              className="w-full p-3 bg-glass-white text-white placeholder-gray-400 rounded-xl border border-neon-purple/30 focus:outline-none focus:ring-2 focus:ring-neon-purple"
            />
            <button
              type="button"
              onClick={addHost}
              className="p-3 bg-neon-purple text-white rounded-xl hover:bg-neon-cyan glow-on-hover"
            >
              +
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.hosts.map((host) => (
              <div
                key={host}
                className="bg-neon-purple/20 text-white px-3 py-1 rounded-full flex items-center space-x-2"
              >
                <span>{host}</span>
                <button
                  type="button"
                  onClick={() => removeHost(host)}
                  className="text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-sm text-gray-300 mb-1">Style</label>
          <select
            name="style"
            value={formData.style}
            onChange={handleInputChange}
            className="w-full p-3 bg-black text-white rounded-xl border border-neon-purple/30 focus:outline-none focus:ring-2 focus:ring-neon-purple"
            required
          >
            <option value="" disabled>
              Select style
            </option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="technical">Technical</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-sm text-gray-300 mb-1">Length (Minutes)</label>
          <input
            type="number"
            name="length_minutes"
            value={formData.length_minutes || ''}
            onChange={handleInputChange}
            placeholder="e.g., 5"
            className="w-full p-3 bg-glass-white text-white placeholder-gray-400 rounded-xl border border-neon-purple/30 focus:outline-none focus:ring-2 focus:ring-neon-purple"
            required
            min="1"
          />
        </div>
        <div className="mb-4">
        <label className="block mb-1 font-medium">Description</label>
        <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          className="w-full border p-2 rounded"
          rows={3}
          placeholder="Brief description of your podcast topic..."
          required
        />
      </div>
        <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-8 py-3 rounded-full hover:shadow-lg glow-on-hover ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Generating...' : 'Create Podcast'}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {scriptId && (
        <p className="text-green-500 text-center mt-4">
          Script generated successfully! Script ID: {scriptId}
        </p>
      )}
    </div>
  );
}