"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function EditScriptPage() {
  const { getToken } = useAuth();
  const { podcastId } = useParams();
  const router = useRouter();

  const [scriptText, setScriptText] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    async function loadScript() {
      const token = await getToken();
      const res = await fetch(`/api/get-script/${podcastId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      if (res.ok) {
        const data = await res.json();
        setScriptText(data.script.text);
        setStatus(data.script.status);
      } else {
        console.error("Failed to fetch script");
      }
    }
    loadScript();
  }, [podcastId, getToken]);

  async function handleSave() {
    const token = await getToken();
    const payload = {
      text: scriptText,
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
      router.push(`/podcast/${podcastId}/assign-voices`);
    } else {
      console.error("Failed to save script");
    }
  }

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Your Script</h1>
      <textarea
        className="w-full h-96 border rounded p-2"
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleSave}
      >
        Save & Continue
      </button>
    </main>
  );
}
