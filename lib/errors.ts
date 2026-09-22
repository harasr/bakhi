import { NextResponse } from 'next/server';

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DB_ERROR = 'DATABASE_ERROR',
}

/**
 * Standardized API Response Error
 * Zero-Trust: Never leak stack traces or internal query details to the client.
 */
export function apiError(message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR, status: number = 500) {
  return NextResponse.json({
    success: false,
    error: {
      message,
      code,
    }
  }, { status });
}

export function handleApiError(error: any) {
  console.error("[API ERROR]", error);
  
  if (error.message.includes("Unauthorized")) {
    return apiError("Authentication required", ErrorCode.UNAUTHORIZED, 401);
  }
  
  if (error.message.includes("Forbidden")) {
    return apiError("Permission denied", ErrorCode.FORBIDDEN, 403);
  }

  // Production tip: sanitize database errors
  if (error.message.includes("Database") || error.message.includes("Transaction")) {
    return apiError("A data integrity error occurred", ErrorCode.DB_ERROR, 500);
  }

  return apiError("An unexpected error occurred", ErrorCode.INTERNAL_ERROR, 500);
}
