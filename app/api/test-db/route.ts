import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ status: '✅ MongoDB Connected Successfully!' });
  } catch (error) {
    return NextResponse.json({ 
      status: '❌ Connection Failed', 
      error: String(error)  // Exact error dikhayega
    }, { status: 500 });
  }
}