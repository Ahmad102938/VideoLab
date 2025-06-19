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
  const [lastFetchTime, setLastFetchTime] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      const startTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long",
      });
      if (isMounted) {
        setLastFetchTime(startTime);
      }
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
          headers: { Authorization: `Bearer ${token}` },
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
      <main className="min-h-screen bg-[#121212] p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Assign Voices to Hosts</h1>
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Assign Voices to Hosts</h1>
          <p className="text-gray-400 mb-4">Loading host details and available voices...</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] h-48 rounded-lg animate-pulse transition-all duration-300"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] p-4 md:p-6 font-orbitron text-white">
      <div className="max-w-6xl mx-auto">
        <header className="fixed top-0 left-0 right-0 z-10 bg-[#121212]/90 backdrop-blur-md p-4 flex justify-between items-center animate-fade-in">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-white hover:text-gray-200 transition-all duration-300 transform hover:scale-105"
          >
            ← Back
          </button>
          <h1 className="text-2xl md:text-4xl font-bold text-center drop-shadow-md">
            Assign Voices to Hosts
          </h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 block max-md:hidden bg-white border-2 hover:border-white text-black rounded-md hover:bg-transparent hover:text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Save & Continue"}
          </button>
        </header>

        <div className="mt-20 space-y-8">
          {assignments.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-400">No hosts found for this podcast.</p>
              <button
                onClick={() => router.push(`/dashboard/podcast/${podcastId}/edit-script`)}
                className="mt-4 px-6 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-300"
              >
                Add Hosts
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((a, idx) => {
                const selectedVoice = availableVoices.find((v) => v.id === a.voiceId);
                const language = selectedVoice ? selectedVoice.languageCode : "Not Chosen";
                return (
                  <div
                    key={idx}
                    className="bg-[#1a1a1a] rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 cursor-move">☰</span>
                        <label className="font-semibold text-white">
                          Host: <span className="text-gray-300">{a.hostName}</span>
                        </label>
                      </div>
                      <span className="text-sm text-gray-400">Host {idx + 1}</span>
                    </div>
                    <p className="mb-2 text-gray-400">
                      Role: <span className="text-white">Narrator</span> | Language: {language}
                    </p>
                    <p className="mb-4 text-gray-300">
                      Selected Voice:{" "}
                      {selectedVoice
                        ? `${selectedVoice.name} (${selectedVoice.languageCode} · ${selectedVoice.gender})`
                        : "No voice selected"}
                    </p>
                    <button
                      onClick={() => setSelectedHostIndex(idx)}
                      className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-300"
                    >
                      Select Voice
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 bg-[#1a1a1a] rounded-lg shadow-lg p-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">AI Voice Recommendations</h2>
          <p className="text-gray-400 mb-4">Based on your script and host profiles, here are some suggested voices:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableVoices.slice(0, 4).map((v, idx) => (
              <div key={idx} className="p-3 border border-gray-700 rounded hover:bg-gray-800 transition-all duration-300">
                <p className="font-medium text-white">{v.name}</p>
                <p className="text-xs text-gray-400">{v.languageCode} · {v.gender}</p>
                <button
                  onClick={() => {
                    setAssignments((prev) => {
                      const copy = [...prev];
                      copy[0] = { ...copy[0], voiceId: v.id, provider: v.provider };
                      return copy;
                    });
                  }}
                  className="mt-2 px-3 py-1 bg-white text-black rounded text-sm hover:bg-gray-200 transition-all duration-300"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-400">Recommendations updated: {lastFetchTime}</p>
        </div>

        {selectedHostIndex !== -1 && (
          <VoiceSelectionModal
            hostName={assignments[selectedHostIndex].hostName}
            currentVoiceId={assignments[selectedHostIndex].voiceId}
            availableVoices={availableVoices}
            onSelect={(voiceId, provider) => {
              setAssignments((prev) => {
                const copy = [...prev];
                const selectedVoice = availableVoices.find((v) => v.id === voiceId);
                copy[selectedHostIndex] = {
                  ...copy[selectedHostIndex],
                  voiceId,
                  provider,
                };
                return copy;
              });
            }}
            onClose={() => setSelectedHostIndex(-1)}
            playSample={playSample}
          />
        )}

        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#121212]/90 backdrop-blur-md flex justify-center space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 border border-gray-300 text-white rounded-md hover:bg-white hover:text-black transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-white border-2 hover:border-white text-black rounded-md hover:bg-transparent hover:text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Save Voice Assignments & Continue"}
          </button>
        </footer>
      </div>
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
        className="bg-[#1a1a1a] p-6 rounded-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Select Voice for {hostName}</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableVoices.length === 0 ? (
            <p className="text-gray-400">No voices available.</p>
          ) : (
            availableVoices.map((v) => (
              <label
                key={v.id}
                className="flex items-center p-2 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 transition-all duration-300"
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
                  <div className="font-medium text-white">{v.name}</div>
                  <div className="text-xs text-gray-400">
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
                  className="ml-2 px-2 py-1 bg-white text-black rounded text-sm hover:bg-gray-200 transition-all duration-300"
                >
                  ▶ Demo
                </button>
              </label>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}