import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { UserService } from '@/lib/services/UserService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';
import { tryGetUsernameFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') ?? '';

    const excludeUsername = tryGetUsernameFromRequest(request) ?? undefined;

    const users = await UserService.searchUsers(query, excludeUsername);

    return createSuccessResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
