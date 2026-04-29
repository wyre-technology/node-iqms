export class IqmsError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}

export class AuthenticationError extends IqmsError {
  constructor(message: string, response: unknown) {
    super(message, 401, response);
  }
}

export class ForbiddenError extends IqmsError {
  constructor(message: string, response: unknown) {
    super(message, 403, response);
  }
}

export class NotFoundError extends IqmsError {
  constructor(message: string, response: unknown) {
    super(message, 404, response);
  }
}

export class ValidationError extends IqmsError {
  constructor(
    message: string,
    public readonly errors: Array<{ field: string; message: string }>,
    response: unknown,
  ) {
    super(message, 400, response);
  }
}

export class RateLimitError extends IqmsError {
  constructor(
    message: string,
    public readonly retryAfter: number,
    response: unknown,
  ) {
    super(message, 429, response);
  }
}

export class ServerError extends IqmsError {
  constructor(message: string, response: unknown) {
    super(message, 500, response);
  }
}

/**
 * Thrown when an Oracle query fails. Wraps the underlying oracledb error so
 * callers don't need to import oracledb to catch it.
 */
export class OracleError extends IqmsError {
  constructor(message: string, public readonly cause: unknown) {
    super(message, 0, cause);
  }
}

/**
 * Thrown when a write operation is attempted but the WebAPI driver has not
 * been configured (i.e. the customer hasn't licensed the WebAPI module or
 * hasn't supplied credentials).
 */
export class DriverNotConfiguredError extends IqmsError {
  constructor(driver: 'oracle' | 'webapi', operation: string) {
    super(
      `Driver "${driver}" is not configured — cannot perform "${operation}". ` +
        (driver === 'webapi'
          ? 'Provide a `webapi` block in IqmsConfig to enable write operations.'
          : 'Provide an `oracle` block in IqmsConfig to enable read operations.'),
      0,
      null,
    );
  }
}

/**
 * Thrown by WebAPI driver stubs that exist as scaffolding but have not yet
 * been validated against a live DELMIAworks WebAPI instance.
 */
export class NotImplementedError extends IqmsError {
  constructor(operation: string) {
    super(
      `Operation "${operation}" is not yet implemented. ` +
        'The DELMIAworks WebAPI module has no public documentation; this method ' +
        'is scaffolded and requires design-partner validation before use.',
      501,
      null,
    );
  }
}
