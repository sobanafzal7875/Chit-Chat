import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { UserService } from '@/lib/services/UserService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { name, username, email, password } = await request.json();

    if (!name || !username || !email || !password) {
      return createSuccessResponse(
        { error: 'Name, username, email, and password are required' },
        400
      );
    }

    const user = await UserService.createUser(username, name, password, email);

    return createSuccessResponse(
      {
        message: 'User created successfully',
        user,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
