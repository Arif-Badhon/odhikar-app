import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    geminiKey: process.env.GEMINI_API_KEY ? 'Set' : 'Missing',
    geminiKeyBracket: process.env["GEMINI_API_KEY"] ? 'Set' : 'Missing'
  });
}
