import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/model/message';
import User from '@/model/user';
import Group from '@/model/group';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // 1. Get recent direct messages
    const messages = await Message.find({
      $or: [{ sender: username }, { receiver: username }]
    }).sort({ createdAt: -1 });

    const chatMap = new Map();
    let unreadTotal = 0;

    for (const msg of messages) {
      if (msg.groupId) continue; // skip group messages here

      const otherUser = msg.sender === username ? msg.receiver : msg.sender;
      if (!otherUser) continue;

      if (!chatMap.has(otherUser)) {
        chatMap.set(otherUser, {
          isGroup: false,
          id: otherUser,
          username: otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      // If message is sent TO the current user and not read
      if (msg.receiver === username && !msg.read) {
        chatMap.get(otherUser).unreadCount += 1;
        unreadTotal += 1;
      }
    }

    // Resolve user details for direct chats
    const directChats = Array.from(chatMap.values());
    for (let chat of directChats) {
      const u = await User.findOne({ username: chat.username }).select('name dp username');
      if (u) {
        chat.name = u.name;
        chat.dp = u.dp;
      }
    }

    // 2. Get groups
    const groups = await Group.find({ members: username });
    const groupChats = [];
    
    for (const group of groups) {
      // get last message for group
      const lastMsg = await Message.findOne({ groupId: group._id }).sort({ createdAt: -1 });
      
      groupChats.push({
        isGroup: true,
        id: group._id,
        name: group.name,
        dp: group.dp,
        admin: group.admin,
        members: group.members,
        lastMessage: lastMsg || null,
        unreadCount: 0 // Simplification for MVP
      });
    }

    // Merge and sort by last message date
    const allChats = [...directChats, ...groupChats].sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || new Date(0);
      const dateB = b.lastMessage?.createdAt || new Date(0);
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return NextResponse.json({ chats: allChats, unreadTotal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
