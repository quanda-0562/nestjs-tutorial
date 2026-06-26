/**
 * Authenticated request interface for type-safe request handling
 */
export interface AuthenticatedRequest extends Express.Request {
  user?: {
    userId: number;
    username?: string;
  };
}

/**
 * Optional authenticated request (for endpoints that support both authenticated and unauthenticated access)
 */
export interface OptionalAuthenticatedRequest extends Express.Request {
  user?: {
    userId: number;
    username?: string;
  };
}
