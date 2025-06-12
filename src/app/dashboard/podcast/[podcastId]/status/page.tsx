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
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timer;

    async function fetchStatus() {
      const token = await getToken();
      const res = await fetch(`/api/get-script/${podcastId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const { script } = await res.json();
        setScriptStatus(script.status);
        setAudioUrls(script.audioUrls || []);

        // Parse segments
        const parsedSegments = (script.segments as any).segments as Segment[];
        setSegments(parsedSegments || []);

        if (script.status === "SYNTHESIS_COMPLETE") {
          clearInterval(interval);
          setLoading(false);
        }
      } else {
        console.error("Failed to fetch script status:", await res.text());
        clearInterval(interval);
        setLoading(false);
      }
    }

    // Immediately fetch once, then poll every 5 seconds
    fetchStatus();
    interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [podcastId, getToken]);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audio Generation Status</h1>

      {(scriptStatus === "SYNTHESIS_QUEUED" || scriptStatus === "SYNTHESIS_IN_PROGRESS") && (
        <div className="flex flex-col items-center">
          <p className="mb-4">Status: Generating audio segments...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      {scriptStatus === "SYNTHESIS_COMPLETE" && (
        <div>
          <p className="mb-4">Status: Audio generation complete</p>
          {audioUrls.length === 0 || segments.length === 0 ? (
            <p>No audio segments found.</p>
          ) : (
            <div className="space-y-6">
              {audioUrls.map((url, idx) => {
                const segment = segments.find((s) => s.segmentIndex === idx);
                return (
                  <div key={idx} className="border p-3 rounded">
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

      {loading && scriptStatus !== "SYNTHESIS_QUEUED" && scriptStatus !== "SYNTHESIS_IN_PROGRESS" && (
        <p>Loading status...</p>
      )}
    </main>
  );
}