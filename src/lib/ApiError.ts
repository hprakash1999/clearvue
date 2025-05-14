export class ApiError extends Error {
  statusCode: number;
  data: unknown;
  success: boolean;
  errors: unknown[];

  constructor(
    statusCode: number,
    message = 'Something went wrong. Please try again later.',
    errors: unknown[] = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
