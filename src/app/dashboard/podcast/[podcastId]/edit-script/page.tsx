"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

type Segment = {
  hostName: string;
  text: string;
  segmentIndex: number;
};

export default function EditScriptPage() {
  const { getToken } = useAuth();
  const { podcastId } = useParams();
  const router = useRouter();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadScript() {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`/api/get-script/${podcastId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const { script } = await res.json();
        // script = { fullText: string, segments: Segment[], status: string }
        setSegments(script.segments);
        setStatus(script.status);
      } else {
        console.error("Failed to fetch script");
      }
      setLoading(false);
    }
    loadScript();
  }, [podcastId, getToken]);

  function handleSegmentChange(index: number, newText: string) {
    setSegments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text: newText };
      return copy;
    });
  }

  async function handleSave() {
    const token = await getToken();
    const payload = {
      segments: segments,
      status: "READY_FOR_SYNTHESIS", // or whatever your next state is
    };
    const res = await fetch(`/api/edit-script/${podcastId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/dashboard/podcast/${podcastId}/assign-voices`);
    } else {
      console.error("Failed to save script");
    }
  }

  if (loading) {
    return (
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Your Script</h1>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Your Script</h1>

      {segments.length === 0 ? (
        <p>No segments found.</p>
      ) : (
        <div className="space-y-6">
          {segments.map((seg, idx) => (
            <div key={idx} className="border p-3 rounded">
              <label className="block font-semibold mb-1">
                Host: <span className="text-blue-600">{seg.hostName}</span>
              </label>
              <textarea
                className="w-full border p-2 rounded"
                rows={4}
                value={seg.text}
                onChange={(e) => handleSegmentChange(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleSave}
      >
        Save & Continue
      </button>
    </main>
  );
}
