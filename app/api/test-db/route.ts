import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ status: '✅ MongoDB Connected Successfully!' });
  } catch (error) {
    return NextResponse.json({
      status: '❌ Connection Failed',
      error: String(error)
    }, { status: 500 });
  }
}