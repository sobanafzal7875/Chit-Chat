import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MessageService } from '@/lib/services/MessageService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';
import { authenticateUser } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const { otherUsername, groupId } = await request.json();

    if (!otherUsername && !groupId) {
      return createSuccessResponse(
        { error: 'Either otherUsername or groupId is required' },
        400
      );
    }

    if (groupId) {
      await MessageService.markGroupMessagesAsRead(groupId, authResult.username);
    } else {
      await MessageService.markDirectMessagesAsRead(
        authResult.username,
        otherUsername
      );
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
