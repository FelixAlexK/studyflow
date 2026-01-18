// Error logging utility
export const logError = (
  error: unknown,
  context?: string,
  severity: 'info' | 'warning' | 'error' = 'error'
) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    timestamp: new Date().toISOString(),
    context,
    message: errorMessage,
    stack: errorStack,
    severity,
  };

  // Log to console in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const consoleMethod = severity === 'warning' ? 'warn' : severity;
    (console[consoleMethod as keyof Console] as any)(`[${context}]`, errorMessage, errorStack);
  }

  // In production, could send to error tracking service
  // e.g., Sentry, LogRocket, etc.
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: sendToErrorService(logData)
    console.error('[Error Logged]', logData);
  }
};

// User-friendly error messages
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet and try again.';
    }
    // Authentication errors
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'Your session expired. Please sign in again.';
    }
    // Validation errors
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return error.message; // These are already user-friendly
    }
    // Generic fallback
    return 'Something went wrong. Please try again.';
  }
  return 'An unexpected error occurred. Please refresh the page.';
};
