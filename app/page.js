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
    setResult(null);
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
    <main className="min-h-screen bg-[#09090b] text-white">

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#F5C800] rounded-md flex items-center justify-center">
            <span className="text-black text-xs font-black">D</span>
          </div>
          <span className="font-semibold text-white tracking-tight">DistroAI</span>
        </div>
        <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          Free beta
        </span>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#F5C800]/10 border border-[#F5C800]/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 bg-[#F5C800] rounded-full animate-pulse" />
          <span className="text-[#F5C800] text-xs font-medium">Powered by Llama 3.3 70B</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
          Find where your{" "}
          <span className="text-[#F5C800]">product belongs</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Tell us what you built. Get a specific distribution plan — communities, message templates, and a week 1 action plan.
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-4">
          <div className="space-y-5">

            <div>
              <label className="text-white/60 text-xs font-medium block mb-2 uppercase tracking-wider">
                App name
              </label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#F5C800]/50 focus:bg-white/[0.07] transition-all text-sm"
                placeholder="e.g. DistroAI"
                value={form.appName}
                onChange={e => setForm({ ...form, appName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-white/60 text-xs font-medium block mb-2 uppercase tracking-wider">
                What does it do?
              </label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#F5C800]/50 focus:bg-white/[0.07] transition-all text-sm h-24 resize-none"
                placeholder="e.g. AI tool that gives founders a distribution plan — paste what you built, get specific communities and message templates"
                value={form.appDescription}
                onChange={e => setForm({ ...form, appDescription: e.target.value })}                
              />
              <p className="text-white/20 text-xs mt-1">Be specific — at least 20 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs font-medium block mb-2 uppercase tracking-wider">
                  Target audience
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#F5C800]/50 focus:bg-white/[0.07] transition-all text-sm"
                  placeholder="e.g. indie founders"
                  value={form.targetAudience}
                  onChange={e => setForm({ ...form, targetAudience: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white/60 text-xs font-medium block mb-2 uppercase tracking-wider">
                  Budget
                </label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C800]/50 transition-all text-sm"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                >
                  <option value="zero" className="bg-[#09090b]">Zero — ₹0</option>
                  <option value="small" className="bg-[#09090b]">Small — ₹1k–5k</option>
                  <option value="decent" className="bg-[#09090b]">Decent — ₹5k+</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || form.appDescription.length < 20 || form.targetAudience.length < 5}
          className="w-full bg-[#F5C800] hover:bg-[#f0c000] text-black font-bold py-4 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Generating your plan...
            </>
          ) : (
            "Get my distribution plan →"
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-4">

            {/* Channels */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-5 h-5 bg-[#F5C800]/20 rounded-md flex items-center justify-center text-[#F5C800] text-xs">1</span>
                Best channels for you
              </h2>
              <div className="space-y-3">
                {result.channels.map((channel, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="w-8 h-8 bg-[#F5C800]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#F5C800] text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{channel.name}</span>
                        <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          {channel.type}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed">{channel.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free template */}
            <div className="bg-white/[0.03] border border-[#F5C800]/20 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                <span className="w-5 h-5 bg-[#F5C800]/20 rounded-md flex items-center justify-center text-[#F5C800] text-xs">2</span>
                Message template
              </h2>
              <p className="text-white/40 text-xs mb-4 ml-7">
                Ready to post in {result.channels[0]?.name}
              </p>
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.templates[result.channels[0]?.name]}
                </p>
              </div>
              <button
                onClick={() => handleCopy(result.templates[result.channels[0]?.name])}
                className="mt-3 text-xs text-[#F5C800]/70 hover:text-[#F5C800] transition-colors flex items-center gap-1"
              >
                {copied ? "✓ Copied!" : "Copy to clipboard"}
              </button>
            </div>

            {/* Locked */}
            {result.channels.slice(1).map((channel, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-white/30 text-sm">Template for {channel.name}</p>
                  <p className="text-white/20 text-xs mt-0.5">Unlock with Pro</p>
                </div>
                <span className="text-xs text-white/30 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  🔒 Pro
                </span>
              </div>
            ))}

            {/* Week 1 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-5 h-5 bg-[#F5C800]/20 rounded-md flex items-center justify-center text-[#F5C800] text-xs">3</span>
                Your week 1 action plan
              </h2>
              <div className="space-y-3">
                {result.week1Actions.map((action, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-[#F5C800] text-xs font-bold mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                    <p className="text-white/60 text-sm leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/20 text-xs">
            Built by{" "}
            <a href="https://www.threads.com/@prarthi.builds" target="_blank"
              className="text-white/40 hover:text-[#F5C800] transition-colors">
              @prarthi.builds
            </a>
            {" "}· DistroAI © 2026
          </p>
        </div>

      </div>
    </main>
  );
}