import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/model/group';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, members, admin, dp } = await request.json();

    if (!name || !admin || !members || !Array.isArray(members)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Include admin in members if not already there
    const allMembers = Array.from(new Set([...members, admin]));

    const group = new Group({
      name,
      admin,
      members: allMembers,
      dp: dp || ''
    });

    await group.save();

    return NextResponse.json({ group });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
