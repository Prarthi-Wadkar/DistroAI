"use client";
import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    appName: "",
    appDescription: "",
    targetAudience: "",
    budget: "zero"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#F5C800] mb-2">DistroAI</h1>
          <p className="text-gray-400">Tell us what you built. We'll tell you where to find your first users.</p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <input
            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white placeholder-gray-600 focus:border-[#F5C800] outline-none"
            placeholder="App name"
            value={form.appName}
            onChange={e => setForm({...form, appName: e.target.value})}
          />
          <textarea
            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white placeholder-gray-600 focus:border-[#F5C800] outline-none h-24 resize-none"
            placeholder="What does it do? Be specific."
            value={form.appDescription}
            onChange={e => setForm({...form, appDescription: e.target.value})}
          />
          <input
            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white placeholder-gray-600 focus:border-[#F5C800] outline-none"
            placeholder="Who is it for?"
            value={form.targetAudience}
            onChange={e => setForm({...form, targetAudience: e.target.value})}
          />
          <select
            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-[#F5C800] outline-none"
            value={form.budget}
            onChange={e => setForm({...form, budget: e.target.value})}
          >
            <option value="zero">Zero budget</option>
            <option value="small">Small (₹1k–5k)</option>
            <option value="decent">Decent (₹5k+)</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.appDescription || !form.targetAudience}
          className="w-full bg-[#F5C800] text-black font-bold py-3 rounded-lg hover:bg-[#e0b400] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Generating your plan..." : "Get my distribution plan →"}
        </button>

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-6">

            {/* Channels */}
            <div>
              <h2 className="text-lg font-semibold text-[#F5C800] mb-3">Best channels for you</h2>
              <div className="space-y-3">
                {result.channels.map((channel, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{channel.name}</span>
                      <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded">{channel.type}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{channel.why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Free template */}
            <div>
              <h2 className="text-lg font-semibold text-[#F5C800] mb-3">
                Message template — {result.channels[0]?.name}
              </h2>
              <div className="bg-[#111] border border-[#F5C80033] rounded-lg p-4">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {result.templates[result.channels[0]?.name]}
                </p>
                <button
                  onClick={() => handleCopy(result.templates[result.channels[0]?.name])}
                  className="text-xs text-[#F5C800] hover:underline mt-3 block"
                >
                  {copied ? "Copied!" : "Copy to clipboard"}
                </button>
              </div>
            </div>

            {/* Locked templates */}
            {result.channels.slice(1).map((channel, i) => (
              <div key={i} className="bg-[#111] border border-[#333] rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Template for {channel.name}</span>
                  <span className="text-xs bg-[#1a1a1a] border border-[#333] text-gray-500 px-3 py-1 rounded-full">
                    🔒 Pro
                  </span>
                </div>
              </div>
            ))}

            {/* Week 1 actions */}
            <div>
              <h2 className="text-lg font-semibold text-[#F5C800] mb-3">Your week 1 action plan</h2>
              <div className="space-y-2">
                {result.week1Actions.map((action, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-[#F5C800] font-bold text-sm mt-0.5">{i + 1}.</span>
                    <p className="text-gray-300 text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}