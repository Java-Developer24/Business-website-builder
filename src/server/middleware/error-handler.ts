import type { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res.status(500).json({
    error: message,
    status: 500,
  });
};

// Common error factories
export const notFound = (resource: string) => {
  return new ApiError(404, `${resource} not found`);
};

export const badRequest = (message: string) => {
  return new ApiError(400, message);
};

export const unauthorized = (message = 'Unauthorized') => {
  return new ApiError(401, message);
};

export const forbidden = (message = 'Forbidden') => {
  return new ApiError(403, message);
};

export const conflict = (message: string) => {
  return new ApiError(409, message);
};

export const validationError = (message: string) => {
  return new ApiError(422, message);
};
