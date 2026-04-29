/**
 * Connection configuration for the IqmsClient.
 *
 * Two driver blocks are supported:
 * - `oracle` (required) — read-only access to the EnterpriseIQ schema
 * - `webapi` (optional) — DELMIAworks WebAPI module for transactional writes
 *
 * If `webapi` is omitted the client runs in read-only mode and any write tool
 * call throws a `DriverNotConfiguredError`.
 */
export interface IqmsConfig {
  oracle: OracleConfig;
  webapi?: WebApiConfig;
  /**
   * Default page size applied to list/search resource methods when the caller
   * doesn't pass `limit`. Defaults to 50.
   */
  defaultPageSize?: number;
}

export interface OracleConfig {
  user: string;
  password: string;
  /**
   * Easy Connect string (`host:port/service`) or a TNS alias.
   * Example: `eiq-db.example.com:1521/EIQ`
   */
  connectString: string;
  /** Connection pool minimum. Defaults to 1. */
  poolMin?: number;
  /** Connection pool maximum. Defaults to 4. */
  poolMax?: number;
  /** Statement timeout in seconds. Defaults to 30. */
  statementTimeout?: number;
}

export interface WebApiConfig {
  /**
   * Base URL of the DELMIAworks WebAPI module on the customer's EnterpriseIQ
   * application server. Example: `https://eiq-app.example.com/webapi`
   */
  baseUrl: string;
  username: string;
  password: string;
  /** Per-minute rate limit. Defaults to 60. */
  rateLimitPerMinute?: number;
  /** Number of retries on 5xx / network errors. Defaults to 3. */
  maxRetries?: number;
}
