// Server boundary for the two real AI capabilities: Bangla speech-to-text and
// narrative analysis. Both run on Lovable AI; the API key never leaves the server.
"use server";

import type { ClassificationResult, ExtractionResult, SafetyResult } from "./services/types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export type TranscribeResponse =
  | { ok: true; text: string; provider: string }
  | { ok: false; reason: string; provider: string };

export const transcribeAudio = async ({ data: input }: { data: { base64: string; mimeType: string } }): Promise<TranscribeResponse> => {
    if (typeof input?.base64 !== "string" || input.base64.length < 100) {
      throw new Error("Recording is empty or too short");
    }
    const data = { base64: input.base64, mimeType: input.mimeType || "audio/webm" };
    const key = process.env["LOVABLE_API_KEY"];
    const provider = "lovable-ai/google/gemini-3.5-transcribe";
    if (!key) return { ok: false, reason: "AI transcription is not configured.", provider };

    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const ext =
      ({ "audio/webm": "webm", "audio/mp4": "mp4", "audio/mpeg": "mp3", "audio/wav": "wav", "audio/ogg": "ogg" } as Record<string, string>)[
        data.mimeType.split(";")[0] ?? ""
      ] ?? "webm";

    const form = new FormData();
    form.append("model", "google/gemini-3.5-transcribe");
    form.append("file", new Blob([bytes], { type: data.mimeType }), `recording.${ext}`);
    form.append("language", "bn");

    try {
      const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return { ok: false, reason: `Transcription failed (${res.status}). ${body.slice(0, 180)}`, provider };
      }
      const json = (await res.json()) as { text?: string };
      const text = (json.text ?? "").trim();
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

const SYSTEM = `You are the intake analyst of Odhikar, a Bangladeshi legal-aid paralegal assistant.
You NEVER give legal advice and NEVER invent facts. Work only from the client's own words.
Supported categories: "Dower & Maintenance", "Dowry", "Land Dispute", "Unpaid Wages".
If the narrative matches none of them use "Out of scope" with outOfScope=true.
Leave any value you cannot ground in the text out of the JSON entirely (do not guess).
For unpaid wages, if daysWorked and dailyRate are stated, compute wagesTotal and outstanding.
Detect safety indicators (physical violence, injury, denial of medical care, confinement,
threat to life). severity "immediate" means the automated flow must stop.
Return the missing information a paralegal would still need, as machine keys from this set:
respondent, marriageDate, dower, dowryPaid, dependants, daysWorked, dailyRate, wagesPaid,
evidence, evidenceLocation, landArea, saleRisk, who, what, howLong.
Reply with JSON only.`;

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
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, reason: "AI analysis is not configured." };
    if (data.transcript.trim().length === 0) return { ok: false, reason: "Empty transcript." };

    const answerLines = Object.entries(data.answers)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    try {
      const res = await fetch(`${GATEWAY}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "google/gemini-3.8-flash",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: `${SYSTEM}\nJSON shape:\n${SCHEMA}` },
            {
              role: "user",
              content: `Client narrative (Bangla, verbatim):\n"""${data.transcript}"""\n\nFollow-up answers so far:\n${answerLines || "(none)"}\n\nReturn the JSON.`,
            },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return { ok: false, reason: `AI analysis failed (${res.status}). ${body.slice(0, 180)}` };
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content ?? "";
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
