import { NextResponse } from 'next/server';

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Database connectivity issues should return a retryable server status.
    if (
      message.includes('ecconnrefused') ||
      message.includes('mongoose') ||
      message.includes('server selection') ||
      message.includes('timed out') ||
      message.includes('mongo')
    ) {
      return NextResponse.json(
        { error: 'Database unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    // Handle specific error types
    if (message.includes('validation')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    if (message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (message.includes('unauthorized') || message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

export function createSuccessResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}