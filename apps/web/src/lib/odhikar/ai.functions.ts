// Server boundary for the two real AI capabilities: Bangla speech-to-text and
// narrative analysis. Both run on Lovable AI; the API key never leaves the server.
"use server";

import type { ClassificationResult, ExtractionResult, SafetyResult } from "./services/types";
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_CATEGORIES } from "./knowledge";

export type TranscribeResponse =
  | { ok: true; text: string; provider: string }
  | { ok: false; reason: string; provider: string };

export const transcribeAudio = async ({ data: input }: { data: { base64: string; mimeType: string } }): Promise<TranscribeResponse> => {
  if (typeof input?.base64 !== "string" || input.base64.length < 100) {
    throw new Error("Recording is empty or too short");
  }
  const data = { base64: input.base64, mimeType: input.mimeType || "audio/webm" };
  const key = process.env["GEMINI_API_KEY"];
  const provider = "google/gemini-3.6-flash";
  if (!key) return { ok: false, reason: "AI transcription is not configured. Missing GEMINI_API_KEY.", provider };

  const cleanMime = data.mimeType.split(";")[0] || "audio/webm";

  const payload = {
    contents: [
      {
        parts: [
          { text: "You are an expert Bangla speech-to-text transcriber for Bangladesh legal aid. Accurately transcribe the attached spoken audio into clean Bangla text. Do NOT summarize, invent, or translate to English. Return only the verbatim Bangla transcript." },
          {
            inlineData: {
              mimeType: cleanMime,
              data: data.base64
            }
          }
        ]
      }
    ]
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, reason: `Transcription failed (${res.status}). ${body.slice(0, 180)}`, provider };
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!text) return { ok: false, reason: "No speech was recognised in the recording.", provider };
    return { ok: true, text, provider };
  } catch (e) {
    return { ok: false, reason: `Transcription service unreachable: ${String(e)}`, provider };
  }
};

export type AnalyseResponse =
  | {
    ok: true;
    safety: SafetyResult;
    extraction: ExtractionResult;
    classification: ClassificationResult;
    missing: { key: string; labelEn: string; labelBn: string }[];
  }
  | { ok: false; reason: string };

const getSystemPrompt = () => {
  const laws = KNOWLEDGE_ARTICLES.map(a => `${a.titleEn}: ${a.summaryBn}`).join("\n");
  const cats = KNOWLEDGE_CATEGORIES.map(c => `"${c.nameEn}"`).join(", ");

  return `You are the intake analyst of Odhikar, a Bangladeshi legal-aid paralegal assistant.
You NEVER give legal advice and NEVER invent facts. Work only from the client's own words.
Supported categories: "Dower & Maintenance", "Dowry", "Land Dispute", "Unpaid Wages".
If the narrative matches none of them use "Out of scope" with outOfScope=true.
Apply these Bangladesh laws for context:
${laws}

Leave any value you cannot ground in the text out of the JSON entirely (do not guess).
For unpaid wages, if daysWorked and dailyRate are stated, compute wagesTotal and outstanding.
Detect safety indicators (physical violence, injury, denial of medical care, confinement,
threat to life). severity "immediate" means the automated flow must stop.
Based on the provided narrative and legal context, you MUST return exactly 4 or 5 missing pieces of information a paralegal would still need to build a complete case, as machine keys from this set:
respondent, marriageDate, dower, dowryPaid, dependants, daysWorked, dailyRate, wagesPaid,
evidence, evidenceLocation, landArea, saleRisk, who, what, howLong.
Reply with JSON only.`;
};

const SCHEMA = `{
 "safety": {"triggered": bool, "severity": "none"|"elevated"|"immediate", "reasons": [string]},
 "classification": {"primary": string, "secondary": string|null, "confidence": 0..1, "rationale": string, "outOfScope": bool},
 "extraction": {
   "applicants": [{"name": string|null, "relationship": string|null}],
   "respondents": [{"name": string|null, "relationship": string|null}],
   "keyDates": [{"label": string, "value": string, "inferred": bool}],
   "amounts": {"dower": number|null, "dowryPaid": number|null, "wagesTotal": number|null, "wagesPaid": number|null, "dailyRate": number|null, "daysWorked": number|null, "outstanding": number|null},
   "timeline": [{"when": string, "what": string, "inferred": bool}],
   "claimedHarm": string|null, "currentSituation": string|null, "dependants": string|null,
   "evidence": [{"item": string, "location": string|null}],
   "previousActions": string|null
 },
 "missing": [{"key": string, "labelEn": string, "labelBn": string}]
}`;

export const analyseNarrative = async ({ data: input }: { data: { transcript: string; answers?: Record<string, string> } }): Promise<AnalyseResponse> => {
  const data = {
    transcript: String(input?.transcript ?? "").slice(0, 8000),
    answers: input?.answers ?? {},
  };
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return { ok: false, reason: "AI analysis is not configured. Missing GEMINI_API_KEY." };
  if (data.transcript.trim().length === 0) return { ok: false, reason: "Empty transcript." };

  const answerLines = Object.entries(data.answers)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: `${getSystemPrompt()}\nJSON shape:\n${SCHEMA}` }]
      },
      generationConfig: {
        responseMimeType: "application/json"
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: `Client narrative (Bangla, verbatim):\n"""${data.transcript}"""\n\nFollow-up answers so far:\n${answerLines || "(none)"}\n\nReturn the JSON.` }
          ]
        }
      ]
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, reason: `AI analysis failed (${res.status}). ${body.slice(0, 180)}` };
    }

    const json = await res.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const parsed = JSON.parse(content.replace(/^```json\s*|```$/g, "")) as AnalyseResponse & {
      safety?: SafetyResult;
    };
    if (!parsed.safety || !("classification" in parsed)) {
      return { ok: false, reason: "AI analysis returned an unexpected shape." };
    }
    return { ...(parsed as object), ok: true } as AnalyseResponse;
  } catch (e) {
    return { ok: false, reason: `AI analysis unreachable: ${String(e)}` };
  }
};

export type GenerateReportResponse = 
  | { ok: true; report: string }
  | { ok: false; reason: string };

export const generateCaseReport = async ({
  data: input
}: {
  data: { transcript: string; answers?: Record<string, string>; classification: string }
}): Promise<GenerateReportResponse> => {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return { ok: false, reason: "AI generation is not configured. Missing GEMINI_API_KEY." };

  const transcript = String(input?.transcript ?? "").slice(0, 8000);
  const answers = Object.entries(input?.answers ?? {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  const classification = input?.classification ?? "Unknown";

  const lawsContext = KNOWLEDGE_ARTICLES
    .filter(a => a.categoryId === classification.toLowerCase() || classification.includes(a.categoryId))
    .map(a => `${a.titleBn} (${a.titleEn}): ${a.summaryBn}`)
    .join("\n");

  const prompt = `You are a legal-aid paralegal assistant in Bangladesh.
Write a comprehensive, professional case report for the admin paralegal based on the following client narrative and their answers to follow-up questions.
The case has been classified as: ${classification}.
Relevant BD laws context:
${lawsContext}

Client Narrative:
"""
${transcript}
"""

Follow-up Answers:
${answers || "(None provided)"}

Your report must:
1. Provide a clear summary of the incident.
2. Outline the legal rights and potential paths of action for the client based on BD laws.
3. Highlight any immediate safety concerns or critical missing information.
4. Be structured with clear headings.
5. Be written in formal Bengali (Bangla).

Do not include JSON, just return the markdown report text.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }),
    });

    if (!res.ok) {
      return { ok: false, reason: `Report generation failed (${res.status})` };
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    return { ok: true, report: text };
  } catch (e) {
    return { ok: false, reason: `Report generation unreachable: ${String(e)}` };
  }
};

