"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface Segment {
  hostName: string;
  text: string;
  segmentIndex: number;
}

export default function StatusPage() {
  const { getToken } = useAuth();
  const { podcastId } = useParams() as { podcastId: string };

  const [scriptStatus, setScriptStatus] = useState<string>("");
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [finalAudio, setFinalAudio] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>("");
  const [readyTime, setReadyTime] = useState<string>("");

  useEffect(() => {
    let interval: NodeJS.Timer;

    async function fetchStatus() {
      const token = await getToken();
      const currentTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setLastUpdatedTime(currentTime); // Update last updated time on each fetch
      const res = await fetch(`/api/get-podcast/${podcastId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const { podcast } = await res.json();
        setScriptStatus(podcast.status);
        setFinalAudio(podcast.finalAudioUrl || null);
        setSegments(podcast.segments || []);
        setAudioUrls(podcast.audioUrls || []);

        if (podcast.status === "AUDIO_READY") {
          setReadyTime(currentTime); // Set ready time when AUDIO_READY
          clearInterval(interval);
          setLoading(false);
        }
      } else {
        console.error("Failed to fetch podcast status:", await res.text());
        clearInterval(interval);
        setLoading(false);
      }
    }

    fetchStatus();
    interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [podcastId, getToken]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] p-4 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">Audio Generation Status</h1>
          <p className="text-gray-400 mb-4 text-center">Fetching the latest updates for your podcast...</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] h-40 rounded-lg animate-pulse transition-all duration-300"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] p-4 md:p-6 font-orbitron text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-10 bg-[#121212]/90 backdrop-blur-md p-4 flex justify-between items-center animate-fade-in">
          <button
            onClick={() => window.history.back()}
            className="text-white hover:text-gray-200 transition-all duration-300 transform hover:scale-105"
          >
            ← Back
          </button>
          <h1 className="text-2xl md:text-4xl font-bold text-center drop-shadow-md">
            Audio Generation Status
          </h1>
          <button
            onClick={() => window.location.reload()}
            className="text-white border block max-md:hidden border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
          >
            Refresh
          </button>
        </header>

        <div className="mt-20 space-y-8">
          {(scriptStatus === "SYNTHESIS_QUEUED" || scriptStatus === "SYNTHESIS_IN_PROGRESS") && (
            <div className="flex flex-col items-center justify-center h-72 bg-[#1a1a1a] rounded-lg shadow-lg p-6 animate-pulse-slow">
              <p className="text-lg mb-4">Status: Generating audio segments...</p>
              <p className="text-gray-400 mb-4">Please wait while we process your audio. This may take a few minutes depending on the length of your script.</p>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
              <p className="mt-4 text-sm text-gray-400">Last updated: {lastUpdatedTime}</p>
            </div>
          )}

          {scriptStatus === "SYNTHESIS_COMPLETE" && (
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-lg shadow-lg p-6 animate-fade-in">
                <p className="text-xl mb-2">Status: Audio generation complete</p>
                <p className="text-gray-400">Your individual audio segments are ready for review. Listen to each segment and ensure they align with your vision before proceeding.</p>
              </div>
              {audioUrls.length === 0 || segments.length === 0 ? (
                <p className="text-gray-400 text-center">No audio segments found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {audioUrls.map((url, idx) => {
                    const segment = segments.find((s) => s.segmentIndex === idx);
                    return (
                      <div
                        key={idx}
                        className="bg-[#1a1a1a] rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <p className="font-medium">
                          Segment {idx + 1} - Host: {segment ? segment.hostName : "Unknown"}
                        </p>
                        <audio controls src={url} className="w-full mt-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {scriptStatus === "AUDIO_READY" && (
            <div className="flex flex-col items-center justify-center h-72 bg-[#1a1a1a] rounded-lg shadow-lg p-6 animate-fade-in">
              <p className="text-xl mb-4">Final audio is ready!</p>
              <p className="text-gray-400 mb-4">Your complete podcast audio is now available. Download it or listen to ensure it meets your expectations.</p>
              {finalAudio ? (
                <>
                  <audio controls src={finalAudio} className="w-full max-w-md mb-4" />
                  <a
                    href={finalAudio}
                    download={`podcast_${podcastId}_final_audio.mp3`}
                    className="mt-4 px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                  >
                    Download Final Audio
                  </a>
                </>
              ) : (
                <p className="text-gray-400">No final audio available.</p>
              )}
              <p className="mt-4 text-sm text-gray-400">Ready at: {readyTime}</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-[#1a1a1a] rounded-lg shadow-lg p-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">Generation Stages</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-white rounded-full mr-2"></span>
              <span className="text-white">Script Received</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-white rounded-full mr-2"></span>
              <span className="text-white">Synthesis Started</span>
            </div>
            <div className="flex items-center">
              <span
                className={
                  scriptStatus === "SYNTHESIS_COMPLETE" || scriptStatus === "AUDIO_READY"
                    ? "w-4 h-4 bg-white rounded-full mr-2"
                    : "w-4 h-4 border-2 border-white rounded-full mr-2 animate-pulse-slow"
                }
              ></span>
              <span className="text-white">Synthesis in Progress</span>
            </div>
            <div className="flex items-center">
              <span
                className={
                  scriptStatus === "AUDIO_READY"
                    ? "w-4 h-4 bg-white rounded-full mr-2"
                    : "w-4 h-4 border-2 border-white rounded-full mr-2 animate-pulse-slow"
                }
              ></span>
              <span className="text-white">Final Audio Ready</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}