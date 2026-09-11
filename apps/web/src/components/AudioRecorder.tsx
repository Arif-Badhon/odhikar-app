"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

interface AudioRecorderProps {
    onTranscribeComplete: (text: string) => void;
}

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([buffer], { type: "audio/wav" });
}

export default function AudioRecorder({ onTranscribeComplete }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const pcmDataRef = useRef<Float32Array[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            mediaStreamRef.current = stream;

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioCtx({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            pcmDataRef.current = [];

            processor.onaudioprocess = (e) => {
                const channelData = e.inputBuffer.getChannelData(0);
                pcmDataRef.current.push(new Float32Array(channelData));
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
            setAudioUrl(null);
        } catch (err) {
            alert("মাইক্রোফোন অ্যাক্সেস পাওয়া যায়নি। অনুগ্রহ করে অনুমতি দিন অথবা নিচে টাইপ করুন।");
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }

        const totalLength = pcmDataRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
        if (totalLength === 0) return;

        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of pcmDataRef.current) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }

        const wavBlob = encodeWAV(merged, 16000);
        setAudioUrl(URL.createObjectURL(wavBlob));
        await sendWavToServer(wavBlob);
    };

    const sendWavToServer = async (blob: Blob) => {
        setIsLoading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const resultString = reader.result as string;
                const base64Audio = resultString.includes(",")
                    ? resultString.split(",")
                    : resultString;

                const res = await fetch("http://localhost:8000/intake/transcribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        audio_base64: base64Audio,
                        mime_type: "audio/wav",
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
                }

                const data = await res.json();
                if (data.transcript) {
                    onTranscribeComplete(data.transcript);
                }
            };
        } catch (e: any) {
            console.error("Transcription error:", e);
            alert("ট্রান্সক্রিপশন ত্রুটি: " + (e.message || "অনুগ্রহ করে নিচে টাইপ করুন।"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/50">
            <div className="flex items-center space-x-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-medium shadow-sm transition"
                    >
                        <Mic className="h-5 w-5" />
                        <span>ভয়েস রেকর্ড করুন (বাংলা)</span>
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-medium animate-pulse transition"
                    >
                        <Square className="h-5 w-5" />
                        <span>রেকর্ডিং বন্ধ করুন</span>
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center space-x-2 mt-4 text-emerald-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">ভয়েস থেকে টেক্সট রূপান্তর হচ্ছে...</span>
                </div>
            )}

            {audioUrl && !isLoading && (
                <audio controls src={audioUrl} className="mt-4 h-10 w-full max-w-sm" />
            )}
        </div>
    );
}