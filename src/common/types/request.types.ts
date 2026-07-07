import type { Request } from 'express';

/**
 * Authenticated request interface for type-safe request handling
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id?: number;
    userId: number;
    email?: string;
    username?: string;
  };
}

/**
 * Optional authenticated request (for endpoints that support both authenticated and unauthenticated access)
 */
export interface OptionalAuthenticatedRequest extends Request {
  user?: {
    id?: number;
    userId: number;
    email?: string;
    username?: string;
  };
}
