import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { GroupService } from '@/lib/services/GroupService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';
import { authenticateUser } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const { name, members, dp } = await request.json();

    if (!name || !members || !Array.isArray(members)) {
      return createSuccessResponse({ error: 'Name and members are required' }, 400);
    }

    const group = await GroupService.createGroup({
      name,
      admin: authResult.username,
      members,
      dp,
    });

    return createSuccessResponse({ group }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const groups = await GroupService.getUserGroups(authResult.username);

    return createSuccessResponse({ groups });
  } catch (error) {
    return handleApiError(error);
  }
}
