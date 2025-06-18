"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

// Import Orbitron font for a futuristic look
// import 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap';

const EditScriptPage = () => {
  const { getToken } = useAuth();
  const { podcastId } = useParams();
  const router = useRouter();

  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadScript() {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`/api/get-script/${podcastId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const { script } = await res.json();
        setSegments(script.segments);
      } else {
        console.error("Failed to fetch script");
      }
      setLoading(false);
    }
    loadScript();
  }, [podcastId, getToken]);

  const handleSegmentChange = (index, newText) => {
    setSegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, text: newText } : seg))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = await getToken();
    const payload = {
      segments,
      status: "READY_FOR_SYNTHESIS",
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
      router.push(`/dashboard/podcast/${ podcastId }/assign-voices`);
    } else {
      console.error("Failed to save script");
    }
    setIsSaving(false);
  };

  const handleAISuggestions = async (index) => {
    const segment = segments[index];
    // Placeholder for AI suggestion API call
    const response = await fetch('/api/ai-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: segment.text }),
    });
    const data = await response.json();
    alert(`AI Suggestions for segment ${ index + 1 }: ${ data.suggestions }`);
  };

  const handleVoicePreview = async (index) => {
    const segment = segments[index];
    // Placeholder for text-to-speech API call
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: segment.text }),
    });
    const data = await response.json();
    const audio = new Audio(data.audioUrl);
    audio.play();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Edit Your Script</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] h-32 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] p-4 md:p-6 font-orbitron">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-10 bg-[#121212]/90 backdrop-blur-md p-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[#fff] hover:text-[#6551d6] transition"
          >
            ← Back
          </button>
          <h1 className="text-2xl md:text-4xl font-bold text-white text-center drop-shadow-md">
            Edit Your Script
          </h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-3 bg-[#fff] text-black rounded-md hover:bg-transparent hover:text-white border-2 hover:border-amber-50 transition ${isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isSaving ? "Saving..." : "save"}
          </button>
        </header>

        {/* Main Content */}
        <div className="mt-20 space-y-6">
          {segments.length === 0 ? (
            <p className="text-gray-400 text-center">No segments found.</p>
          ) : (
            segments.map((seg, idx) => (
              <div
                key={idx}
                className="bg-[#1a1a1a] rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 max-w-3xl mx-auto"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 cursor-move">☰</span>
                    <label className="font-semibold text-[#fff]">
                      Host: <span className="text-[#ffffffce]">{seg.hostName}</span>
                    </label>
                  </div>
                  <span className="text-sm text-gray-400">Segment {idx + 1}</span>
                </div>
                <textarea
                  className="w-full bg-[#121212] border border-gray-700 rounded-md p-3 text-gray-200 resize-y focus:outline-none focus:ring-2 focus:ring-[#fff] transition"
                  rows={4}
                  value={seg.text}
                  onChange={(e) => handleSegmentChange(idx, e.target.value)}
                  placeholder="Enter script text here..."
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => handleAISuggestions(idx)}
                    className="text-[#fff] border border-[#fff] px-3 py-1 rounded-md hover:bg-[#fff] hover:text-black transition text-sm glow-button"
                  >
                    Get AI Suggestions
                  </button>
                  
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#121212]/90 backdrop-blur-md flex justify-center space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 border border-gray-300 text-white rounded-md hover:bg-[#fff] hover:text-black transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-3 bg-[#fff] text-black rounded-md hover:bg-transparent hover:text-white border-2 hover:border-amber-50 transition ${isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isSaving ? "Saving..." : "Save & Continue"}
          </button>
        </footer>
      </div>
    </main>
  );
};

export default EditScriptPage;