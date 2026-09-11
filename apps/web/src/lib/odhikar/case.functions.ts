"use server";
import type { CaseRecord } from "./types";
import type { Json } from "@/integrations/supabase/types";

const isVictimRecord = (value: unknown): value is CaseRecord => {
  const record = value as Partial<CaseRecord> | null;
  return Boolean(
    record &&
      typeof record.id === "string" &&
      /^ODH-2026-[0-9]{4,}$/.test(record.id) &&
      typeof record.transcriptBn === "string" &&
      record.transcriptBn.trim().length > 0 &&
      !record.report,
  );
};

/** Narrow public write boundary for the anonymous victim intake. Crime reports are rejected. */
export const submitVictimCase = async ({ data: input }: { data: { record: CaseRecord } }) => {
    if (!isVictimRecord(input?.record)) throw new Error("Invalid victim case submission");
    const data = { record: input.record };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const record = data.record;
    const safeRecord: CaseRecord = { ...record };
    let audioPath: string | null = null;

    if (record.audioDataUrl?.startsWith("data:audio/")) {
      const match = record.audioDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match?.[1] && match[2]) {
        const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
        audioPath = `${record.id}/intake-${Date.now()}.webm`;
        const upload = await supabaseAdmin.storage.from("case-audio").upload(audioPath, bytes, {
          contentType: match[1],
          upsert: true,
        });
        if (upload.error) audioPath = null;
      }
      delete safeRecord.audioDataUrl;
    }

    const row = {
      case_number: record.id,
      case_kind: "victim",
      status: record.status,
      urgency: record.urgency,
      primary_category: record.classification.primary,
      secondary_category: record.classification.secondary ?? null,
      confidence: record.classification.confidence,
      safety_flag: record.safetyFlag,
      safety_note: record.safetyNote ?? null,
      transcript_bn: record.transcriptBn.slice(0, 12000),
      transcript_source: record.transcriptSource ?? null,
      audio_path: audioPath,
      audio_duration_seconds: record.audioDurationSec,
      structured_record: safeRecord as unknown as Json,
      missing_fields: record.missing as Json,
      received_at: record.createdAt,
    };

    const existing = await supabaseAdmin.from("cases").select("id,audio_path").eq("case_number", record.id).maybeSingle();
    const result = existing.data
      ? await supabaseAdmin.from("cases").update({ ...row, audio_path: audioPath ?? existing.data.audio_path }).eq("id", existing.data.id)
      : await supabaseAdmin.from("cases").insert(row);
    if (result.error) throw new Error("The secure case record could not be saved.");

    if (record.appointment) {
      const row2 = await supabaseAdmin.from("cases").select("id").eq("case_number", record.id).maybeSingle();
      const caseId = row2.data?.id;
      if (caseId) {
        const { CLINICS } = await import("./fixtures");
        const clinic = CLINICS.find((c) => c.id === record.appointment!.clinicId);
        const existingAppt = await supabaseAdmin
          .from("appointments")
          .select("id")
          .eq("case_id", caseId)
          .maybeSingle();
        const apptRow = {
          case_id: caseId,
          clinic_id: record.appointment.clinicId,
          clinic_name: clinic?.name ?? record.appointment.clinicId,
          slot_id: record.appointment.slotId,
          appointment_label: record.appointment.label,
          status: "booked",
        };
        if (existingAppt.data) {
          await supabaseAdmin.from("appointments").update(apptRow).eq("id", existingAppt.data.id);
        } else {
          await supabaseAdmin.from("appointments").insert(apptRow);
        }
      }
    }

    return { ok: true as const, caseNumber: record.id };
  };