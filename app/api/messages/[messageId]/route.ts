import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MessageService } from '@/lib/services/MessageService';
import { authenticateUser } from '@/lib/middleware/auth';
import { createSuccessResponse, handleApiError } from '@/lib/utils/apiResponse';
import { getIo } from '@/lib/realtime/serverSocket';
import Message from '@/model/message';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ messageId: string }> }
) {
  try {
    await connectToDatabase();
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const { messageId } = await context.params;
    const existing = await Message.findById(messageId).lean();
    if (!existing) {
      return createSuccessResponse({ error: 'Message not found' }, 404);
    }

    const updated = await MessageService.unsendMessage(messageId, authResult.username);

    const io = getIo();
    if (io) {
      if (existing.groupId) {
        io.to(String(existing.groupId)).emit('message_unsent', {
          messageId,
          groupId: String(existing.groupId),
        });
      } else if (existing.receiver && existing.sender) {
        io.to(existing.receiver).emit('message_unsent', { messageId });
        io.to(String(existing.sender)).emit('message_unsent', { messageId });
      }
    }

    return createSuccessResponse({ message: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
