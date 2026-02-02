/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user info for Socket.IO and REST routes
 */

export default function authMiddleware(req, res, next) {
  // For development/testing, allow requests with or without token
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      // TODO: Verify JWT token
      // For now, just pass through - implement token verification as needed
      req.user = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        role: 'user'
      };
    } catch (error) {
      console.warn('Token verification failed (development mode):', error.message);
    }
  } else {
    // Allow unauthenticated access in development
    req.user = {
      id: 'anonymous',
      role: 'guest'
    };
  }

  next();
}
