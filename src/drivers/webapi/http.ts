import type { WebApiConfig } from '../../config.js';
import {
  AuthenticationError,
  ForbiddenError,
  IqmsError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from '../../errors.js';

interface RequestOptions {
  method?: string;
  params?: Record<string, unknown>;
  body?: unknown;
}

/**
 * HTTP client for the DELMIAworks WebAPI module.
 *
 * @remarks
 * The WebAPI module is a paid licensed add-on without public documentation.
 * Auth shape (session token vs. basic auth vs. cookie) and the exact endpoint
 * conventions are inferred from the public WebAPI marketing pages and the
 * .NET SOA pattern referenced by partner integrators. Treat this client as
 * scaffolding — the auth handshake will need to be reworked once we have
 * vendor SDK access.
 */
export class WebApiHttpClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly maxRetries: number;
  private sessionToken: string | null = null;

  constructor(config: WebApiConfig) {
    // Trailing-slash normalization — IQMS-style .NET servers have been seen
    // to issue 301 redirects that strip Authorization headers when a path
    // is missing the trailing slash.
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.username = config.username;
    this.password = config.password;
    this.maxRetries = config.maxRetries ?? 3;
  }

  async close(): Promise<void> {
    this.sessionToken = null;
  }

  /**
   * Stub session-token acquisition. Real handshake will be implemented once
   * vendor SDK docs are available.
   */
  private async ensureSession(): Promise<string> {
    if (this.sessionToken) return this.sessionToken;
    // Placeholder — real implementation will POST credentials to a /login
    // endpoint and stash the returned token.
    this.sessionToken = `${this.username}:placeholder-session`;
    return this.sessionToken;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', params, body } = options;
    const normalizedPath = path.endsWith('/') ? path : `${path}/`;

    let url = `${this.baseUrl}${normalizedPath}`;
    if (params) {
      const search = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) search.set(k, String(v));
      }
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 30_000);
        await new Promise((r) => setTimeout(r, delay));
      }

      const token = await this.ensureSession();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };
      if (body !== undefined) headers['Content-Type'] = 'application/json';

      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      } catch (err) {
        lastError = err as Error;
        continue;
      }

      if (response.ok) {
        if (response.status === 204) return {} as T;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return (await response.json()) as T;
        }
        return {} as T;
      }

      // Read body once as text, then attempt JSON.parse — never call .json()
      // and .text() on the same Response.
      let parsedBody: unknown;
      const rawText = await response.text();
      try {
        parsedBody = JSON.parse(rawText);
      } catch {
        parsedBody = rawText;
      }

      switch (response.status) {
        case 400:
          throw new ValidationError('Bad request', [], parsedBody);
        case 401:
          // Invalidate cached session and retry once
          this.sessionToken = null;
          if (attempt < this.maxRetries) continue;
          throw new AuthenticationError('Authentication failed', parsedBody);
        case 403:
          throw new ForbiddenError('Forbidden', parsedBody);
        case 404:
          throw new NotFoundError('Resource not found', parsedBody);
        case 429: {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
          if (attempt < this.maxRetries) {
            await new Promise((r) => setTimeout(r, retryAfter * 1000));
            continue;
          }
          throw new RateLimitError('Rate limit exceeded', retryAfter, parsedBody);
        }
        default:
          if (response.status >= 500) {
            lastError = new ServerError(`Server error: ${response.status}`, parsedBody);
            if (attempt < this.maxRetries) continue;
            throw lastError;
          }
          throw new IqmsError(`HTTP ${response.status}`, response.status, parsedBody);
      }
    }

    throw lastError ?? new IqmsError('Request failed after retries', 0, null);
  }
}
