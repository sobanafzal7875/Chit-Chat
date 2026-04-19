import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    username: string;
  };
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedRequest> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = UserService.verifyToken(token);

    (request as AuthenticatedRequest).user = decoded as {
      userId: string;
      username: string;
    };

    return request as AuthenticatedRequest;
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

export type AuthContext =
  | { success: true; userId: string; username: string }
  | { success: false; error: string };

/** Returns username when a valid Bearer token is present; otherwise null. */
export function tryGetUsernameFromRequest(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = UserService.verifyToken(token) as { username: string };
    return decoded.username ?? null;
  } catch {
    return null;
  }
}

export async function authenticateUser(request: NextRequest): Promise<AuthContext> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No authorization token provided' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = UserService.verifyToken(token) as { userId: string; username: string };

    return {
      success: true,
      userId: String(decoded.userId),
      username: decoded.username,
    };
  } catch {
    return { success: false, error: 'Authentication failed' };
  }
}