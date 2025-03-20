"use client";

import { useState } from "react";

export default function AIChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.response || "Error generating response");
    } catch (error) {
      console.error("API Error:", error);
      setResponse("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-background text-foreground">
      <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="border p-2 rounded w-full bg-background text-foreground"
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {response && (
        <div className="mt-4 p-2 border rounded bg-card text-card-foreground">
          <p className="mb-2"><strong>Response:</strong></p>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: response }} 
          />
        </div>
      )}
    </div>
  );
}
