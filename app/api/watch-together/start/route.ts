import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { authenticateUser } from '@/lib/middleware/auth';
import { UserService } from '@/lib/services/UserService';
import { createSuccessResponse, handleApiError } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createSuccessResponse({ error: authResult.error }, 401);
    }

    const { participants } = await request.json();
    if (!Array.isArray(participants) || participants.length === 0) {
      return createSuccessResponse({ error: 'participants array is required' }, 400);
    }

    const adminUser = await UserService.getUserById(authResult.userId);
    const sessionId = randomUUID();

    const participantRows = await Promise.all(
      participants.map(async (username: string) => {
        try {
          const u = await UserService.getUserByUsername(username);
          return {
            username: u.username,
            name: u.name,
            isAdmin: false,
          };
        } catch {
          return { username, name: username, isAdmin: false };
        }
      })
    );

    return createSuccessResponse(
      {
        session: { id: sessionId },
        participants: [
          {
            username: adminUser.username,
            name: adminUser.name,
            isAdmin: true,
          },
          ...participantRows,
        ],
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
