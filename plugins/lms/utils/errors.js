export class LMSError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.name = 'LMSError';
  }
}

export const handleError = (error) => {
  console.error(`[LMS ERROR] ${new Date().toISOString()}:`, error);
  
  if (error instanceof LMSError) {
    return { message: error.message, status: error.status };
  }

  // Handle Zod Errors
  if (error.name === 'ZodError') {
    return { message: 'Validation failed', details: error.errors, status: 400 };
  }

  return { message: 'An internal server error occurred', status: 500 };
};

export const logger = {
  info: (msg, data = {}) => console.log(`[LMS INFO] ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[LMS WARN] ${msg}`, data),
  error: (msg, data = {}) => console.error(`[LMS ERROR] ${msg}`, data),
};
