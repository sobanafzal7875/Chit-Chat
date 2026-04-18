import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/model/message';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { sender, receiver } = await request.json();

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Mark all messages sent BY sender TO receiver as read
    // Wait, the API caller is the receiver who just read them.
    // So receiver is the one making the call. "sender" is the person who originally sent it.
    await Message.updateMany(
      { sender, receiver, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
