import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MessageService } from '@/lib/services/MessageService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';
import { authenticateUser } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const withUser = searchParams.get('with');
    const groupId = searchParams.get('groupId');

    let messages;
    if (groupId) {
      messages = await MessageService.getGroupMessages(groupId);
    } else if (withUser) {
      messages = await MessageService.getMessagesBetweenUsers(
        authResult.username,
        withUser
      );
    } else {
      return createSuccessResponse(
        { error: 'Query parameter "with" (username) or "groupId" is required' },
        400
      );
    }

    return createSuccessResponse({ messages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const { content, receiver, groupId, fileUrl, fileType } = await request.json();

    const hasBody = typeof content === 'string' && content.trim().length > 0;
    if (!hasBody && !fileUrl) {
      return createSuccessResponse(
        { error: 'Either message content or fileUrl is required' },
        400
      );
    }

    let message;
    if (groupId) {
      message = await MessageService.sendGroupMessage(
        authResult.username,
        groupId,
        hasBody ? content.trim() : '',
        fileUrl,
        fileType
      );
    } else if (receiver) {
      message = await MessageService.sendDirectMessage(
        authResult.username,
        receiver,
        hasBody ? content.trim() : '',
        fileUrl,
        fileType
      );
    } else {
      return createSuccessResponse(
        { error: 'Either receiver (username) or groupId is required' },
        400
      );
    }

    return createSuccessResponse(
      { message: MessageService.toPublicMessage(message) },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
