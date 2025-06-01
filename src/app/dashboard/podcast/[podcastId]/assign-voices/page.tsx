"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

type Assignment = {
  hostName: string;
  voiceId: string;
  provider: string;
};

export default function AssignVoicesPage() {
  const { getToken } = useAuth();
  const { podcastId } = useParams();
  const router = useRouter();

  const [hosts, setHosts] = useState<string[]>([]);
  const [availableVoices, setAvailableVoices] = useState<{ id: string; provider: string; name: string; }[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    async function loadData() {
      const token = await getToken();
      // 1) Fetch host list (maybe from /api/get-podcast or /api/get-script)
      const res = await fetch(`/api/get-podcast/${podcastId}`, {
  headers: { "Authorization": `Bearer ${token}` },
});
console.log("get-podcast status:", res.status);
if (res.ok) {
  const { podcast } = await res.json();
  console.log("=== podcast payload:", podcast);
  // Now you’ll see if podcast.hosts is actually an array or if it’s missing / empty.
  setHosts(podcast.hosts.map((h: { hostName: string }) => h.hostName));
  setAssignments(
    podcast.hosts.map((h: { hostName: string; voiceId: string; provider: string }) => ({
      hostName: h.hostName,
      voiceId: h.voiceId || "",
      provider: h.provider || "",
    }))
  );
} else {
  console.error("GET /api/get-podcast failed:", res.status, await res.text());
}

      // 2) Fetch voices from your TTS provider (or a static JSON)
      // For simplicity, let’s hardcode a few options:
      setAvailableVoices([
        { id: "voiceA", name: "Voice A (US-English)", provider: "ProviderX" },
        { id: "voiceB", name: "Voice B (UK-English)", provider: "ProviderX" },
        { id: "voiceC", name: "Voice C (Robo-Chad)", provider: "ProviderY" },
      ]);
    }
    loadData();
  }, [podcastId, getToken]);

  // Handle dropdown changes
  function handleSelectChange(index: number, field: "voiceId" | "provider", value: string) {
    setAssignments((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  }

  async function handleSubmit() {
    // Validate that each assignment has both voiceId & provider selected
    for (const a of assignments) {
      if (!a.voiceId || !a.provider) {
        alert("Please select a voice for every host.");
        return;
      }
    }

    const token = await getToken();
    const res = await fetch(`/api/assign-voices/${podcastId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ assignments }),
    });

    if (res.ok) {
      // Done! Redirect to dashboard or status page
      router.push(`/podcast/${podcastId}/status`);
    } else {
      console.error("Failed to assign voices");
    }
  }

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assign Voices to Hosts</h1>
      <form>
        {assignments.map((a, idx) => (
          <div key={idx} className="mb-4">
            <label className="block font-medium mb-1">Host: {a.hostName}</label>
            <select
              className="border rounded p-2 w-full mb-1"
              value={a.voiceId}
              onChange={(e) => handleSelectChange(idx, "voiceId", e.target.value)}
            >
              <option value="">Select a voice...</option>
              {availableVoices.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <select
              className="border rounded p-2 w-full"
              value={a.provider}
              onChange={(e) => handleSelectChange(idx, "provider", e.target.value)}
            >
              <option value="">Select provider...</option>
              {[...new Set(availableVoices.map((v) => v.provider))].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        ))}

        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Voice Assignments & Continue
        </button>
      </form>
    </main>
  );
}
