import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(system, user) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

function cleanJSON(raw) {
  return raw.trim().replace(/```json|```/g, "").trim();
}

const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 3;
  const requests = rateLimit.get(ip) || [];
  const recent = requests.filter(time => now - time < windowMs);
  if (recent.length >= maxRequests) return false;
  rateLimit.set(ip, [...recent, now]);
  return true;
}

export async function POST(request) {
  try {
    // Rate limiting — INSIDE the function
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const { appName, appDescription, targetAudience, budget } = await request.json();

    if (!appDescription || !targetAudience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1 - Find channels
    const channelsRaw = await callGroq(
      "You are a distribution strategist. Return ONLY a raw JSON array. No markdown, no backticks, no explanation.",
      `Return ONLY this exact JSON array format with 3 items. Nothing else before or after.

[
  {"name": "r/indiehackers", "type": "subreddit", "why": "50k founders active daily"},
  {"name": "Indie Hackers Discord", "type": "discord", "why": "10k members very active"},
  {"name": "r/SideProject", "type": "subreddit", "why": "30k members who love new tools"}
]

Now return the same format for:
Product: ${appName} - ${appDescription}
Audience: ${targetAudience}
Budget: ${budget}
Do NOT suggest r/entrepreneur or r/startups.`
    );

    let channels = JSON.parse(cleanJSON(channelsRaw));
    if (!Array.isArray(channels)) channels = [channels];

    // Step 2 - Template for channel 1 only (free tier)
   const freeTemplate = await callGroq(
  "You are a copywriter for indie founders. Write genuine, non-salesy posts.",
  `Write a ready-to-post message for ${channels[0].name}.
You are writing AS THE FOUNDER of this product, in first person.
Do NOT write as a third party who discovered the product.
Do NOT say "I stumbled upon" or "there's a platform".
Write as if YOU built it and YOU are sharing it with the community.

Product: ${appName} - ${appDescription}
Audience: ${targetAudience}
Tone: genuine, humble, founder sharing their work
Length: 3 short paragraphs
Start with the problem you noticed, then what you built, then invite feedback.`
);

    // Step 3 - Week 1 actions
    const actionsRaw = await callGroq(
      "You are a growth strategist. Return ONLY a raw JSON array of 5 strings. No markdown, no backticks.",
      `Return ONLY a JSON array of exactly 5 action strings. Nothing else.

["action 1", "action 2", "action 3", "action 4", "action 5"]

Now return for:
Product: ${appName}
Channels: ${channels.map(c => c.name).join(", ")}`
    );

    let actions = JSON.parse(cleanJSON(actionsRaw));

    return NextResponse.json({
      channels,
      templates: {
        [channels[0]?.name]: freeTemplate,
        [channels[1]?.name]: null,
        [channels[2]?.name]: null,
      },
      week1Actions: actions,
      isPro: false
    });

  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}