import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { UserService } from '@/lib/services/UserService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const identifier = (body.email ?? body.username ?? '').trim();
    const password = body.password;

    if (!identifier || !password) {
      return createSuccessResponse(
        { error: 'Email (or username) and password are required' },
        400
      );
    }

    const result = await UserService.authenticateUser(identifier, password);

    return createSuccessResponse({
      token: result.token,
      user: result.user,
      username: result.user.username,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
