import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ChatService } from '@/lib/services/ChatService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';
import { authenticateUser } from '@/lib/middleware/auth';
import { getIo } from '@/lib/realtime/serverSocket';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const chats = await ChatService.getUserChats(authResult.username);

    return createSuccessResponse({ chats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const body = await request.json();
    const withUser = body.with as string | undefined;
    const groupId = body.groupId as string | undefined;

    const io = getIo();

    if (withUser) {
      await ChatService.deleteDirectConversation(authResult.username, withUser);
      io?.to(withUser).emit('chat_deleted', {
        kind: 'dm' as const,
        peerUsername: authResult.username,
      });
      return createSuccessResponse({ ok: true });
    }

    if (groupId) {
      const { memberUsernames } = await ChatService.deleteGroupConversation(
        groupId,
        authResult.username
      );
      const payload = { kind: 'group' as const, groupId };
      for (const m of memberUsernames) {
        io?.to(m).emit('chat_deleted', payload);
      }
      io?.to(String(groupId)).emit('chat_deleted', payload);
      return createSuccessResponse({ ok: true });
    }

    return createSuccessResponse({ error: 'with or groupId is required' }, 400);
  } catch (error) {
    return handleApiError(error);
  }
}
