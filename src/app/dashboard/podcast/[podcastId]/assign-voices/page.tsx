"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

type Assignment = {
  hostName: string;
  voiceId: string;
  provider: string;
};

type VoiceOption = {
  id: string;
  name: string;
  languageCode: string;
  gender: string;
  provider: string;
};

export default function AssignVoicesPage() {
  const { getToken } = useAuth();
  const { podcastId } = useParams() as { podcastId: string };
  const router = useRouter();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHostIndex, setSelectedHostIndex] = useState<number>(-1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();

        // Fetch hosts and existing assignments
        const resHosts = await fetch(`/api/get-podcast/${podcastId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resHosts.ok) {
          throw new Error(`Failed to fetch podcast: ${resHosts.status} ${await resHosts.text()}`);
        }
        const { podcast } = await resHosts.json();
        if (isMounted) {
          setAssignments(
  (podcast.hostAssignments ?? podcast.hosts ?? []).map((h: any) => ({
    hostName: typeof h === "string" ? h : h.hostName,
    voiceId: h.voiceId || "",
    provider: h.provider || "",
  }))
);
        }

        // Fetch all Polly voices
        const resVoices = await fetch("/api/polly-voices", {
          headers: { Authorization: `Bearer ${token}` }, // Add token if required
        });
        if (!resVoices.ok) {
          throw new Error(`Failed to fetch Polly voices: ${resVoices.status} ${await resVoices.text()}`);
        }
        const { voices } = await resVoices.json();
        if (isMounted) {
          setAvailableVoices(voices);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, [podcastId, getToken]);

  function playSample(voiceId: string) {
    fetch(`/api/polly-demo?voiceId=${voiceId}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to fetch demo: ${r.status}`);
        }
        return r.json();
      })
      .then(({ demoUrl }) => {
        const audio = new Audio(demoUrl);
        audio.play().catch(console.error);
      })
      .catch((err) => {
        console.error("Error playing sample:", err);
        alert("Failed to play voice sample.");
      });
  }

  async function handleSubmit() {
    for (const a of assignments) {
      if (!a.voiceId || !a.provider) {
        alert("Please select a voice for every host.");
        return;
      }
    }

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/assign-voices/${podcastId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignments }),
      });

      if (!res.ok) {
        throw new Error(`Failed to assign voices: ${await res.text()}`);
      }

      // Trigger TTS job
      const ttsRes = await fetch(`/api/generate-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ podcastId }),
      });

      if (!ttsRes.ok) {
        throw new Error(`Failed to start TTS job: ${await ttsRes.text()}`);
      }

      router.push(`/dashboard/podcast/${podcastId}/status`);
    } catch (err) {
      console.error("Error in submission:", err);
      alert(`Error: ${(err as Error).message}`);
      setLoading(false);
    }
  }

  if (error) {
    return (
      <main className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Assign Voices to Hosts</h1>
        <p className="text-red-500">Error: {error}</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Assign Voices to Hosts</h1>
        <p>Loading hosts and Polly voices…</p>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assign Voices to Hosts</h1>

      {assignments.length === 0 ? (
        <p>No hosts found for this podcast.</p>
      ) : (
        <div className="space-y-8">
          {assignments.map((a, idx) => {
            const selectedVoice = availableVoices.find((v) => v.id === a.voiceId);
            return (
              <div key={idx} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <h2 className="text-lg font-semibold mb-2">Host: {a.hostName}</h2>
                <p className="mb-2">
                  Selected Voice:{" "}
                  {selectedVoice
                    ? `${selectedVoice.name} (${selectedVoice.languageCode} · ${selectedVoice.gender})`
                    : "No voice selected"}
                </p>
                <button
                  onClick={() => setSelectedHostIndex(idx)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Select Voice
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedHostIndex !== -1 && (
        <VoiceSelectionModal
          hostName={assignments[selectedHostIndex].hostName}
          currentVoiceId={assignments[selectedHostIndex].voiceId}
          availableVoices={availableVoices}
          onSelect={(voiceId, provider) => {
            setAssignments((prev) => {
              const copy = [...prev];
              copy[selectedHostIndex] = { ...copy[selectedHostIndex], voiceId, provider };
              return copy;
            });
          }}
          onClose={() => setSelectedHostIndex(-1)}
          playSample={playSample}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-8 px-6 py-3 rounded-lg text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Processing..." : "Save Voice Assignments & Continue"}
      </button>
    </main>
  );
}

function VoiceSelectionModal({
  hostName,
  currentVoiceId,
  availableVoices,
  onSelect,
  onClose,
  playSample,
}: {
  hostName: string;
  currentVoiceId: string;
  availableVoices: VoiceOption[];
  onSelect: (voiceId: string, provider: string) => void;
  onClose: () => void;
  playSample: (voiceId: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Select Voice for {hostName}</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableVoices.length === 0 ? (
            <p>No voices available.</p>
          ) : (
            availableVoices.map((v) => (
              <label
                key={v.id}
                className="flex items-center p-2 border rounded cursor-pointer"
              >
                <input
                  type="radio"
                  name="voice"
                  value={v.id}
                  checked={currentVoiceId === v.id}
                  onChange={() => onSelect(v.id, v.provider)}
                  className="mr-2"
                />
                <div className="flex-1">
                  <div className="font-medium">{v.name}</div>
                  <div className="text-xs text-gray-500">
                    {v.languageCode} · {v.gender}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playSample(v.id);
                  }}
                  className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                >
                  ▶️ Demo
                </button>
              </label>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}