import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { UserService } from '@/lib/services/UserService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';
import { authenticateUser } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const user = await UserService.getUserById(authResult.userId!);

    return createSuccessResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const { name, dp, currentPassword, newPassword } = await request.json();

    const user = await UserService.updateUser(authResult.userId!, {
      name,
      dp,
      currentPassword,
      newPassword,
    });

    return createSuccessResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
