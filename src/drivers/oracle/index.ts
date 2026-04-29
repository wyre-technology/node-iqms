import type { OracleConfig } from '../../config.js';
import { OracleError } from '../../errors.js';

export interface OracleQueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowsAffected?: number;
}

/**
 * Minimal abstraction over `oracledb` so consumers (and tests) can swap in a
 * fake driver. Production driver wraps a `oracledb.Pool`.
 */
export interface OracleDriver {
  /**
   * Execute a SELECT statement with named bind parameters.
   * Bind names use `:name` syntax; values must be primitives or Date.
   */
  query<T = Record<string, unknown>>(
    sql: string,
    binds?: Record<string, unknown>,
  ): Promise<OracleQueryResult<T>>;

  /** Close the underlying connection pool. Idempotent. */
  close(): Promise<void>;
}

/**
 * Build the production Oracle driver. Lazily imports `oracledb` so the
 * package can be tree-shaken in pure-WebAPI deployments. Requires the Oracle
 * Instant Client to be installed on the host.
 */
export async function createOracleDriver(config: OracleConfig): Promise<OracleDriver> {
  // Dynamic import keeps oracledb out of consumer bundles when only the
  // WebAPI driver is in use. Marked external in tsup.config.ts.
  let oracledb: typeof import('oracledb');
  try {
    oracledb = (await import('oracledb')).default;
  } catch (err) {
    throw new OracleError(
      'Failed to load `oracledb`. Install the Oracle Instant Client and ensure ' +
        '`oracledb` is in dependencies.',
      err,
    );
  }

  // EnterpriseIQ schema is OracleDB-numeric-heavy; objects are easier to consume.
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

  let pool: import('oracledb').Pool;
  try {
    pool = await oracledb.createPool({
      user: config.user,
      password: config.password,
      connectString: config.connectString,
      poolMin: config.poolMin ?? 1,
      poolMax: config.poolMax ?? 4,
      poolIncrement: 1,
    });
  } catch (err) {
    throw new OracleError('Failed to open Oracle connection pool', err);
  }

  const statementTimeoutMs = (config.statementTimeout ?? 30) * 1000;

  return {
    async query<T>(
      sql: string,
      binds: Record<string, unknown> = {},
    ): Promise<OracleQueryResult<T>> {
      let connection: import('oracledb').Connection | undefined;
      try {
        connection = await pool.getConnection();
        // Read-only enforcement — block accidental DML.
        const trimmed = sql.trimStart().toUpperCase();
        if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH')) {
          throw new OracleError(
            'Oracle driver is read-only. Only SELECT and WITH statements are allowed.',
            null,
          );
        }
        connection.callTimeout = statementTimeoutMs;
        const result = await connection.execute<T>(
          sql,
          binds as import('oracledb').BindParameters,
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        return {
          rows: (result.rows as T[]) ?? [],
          rowsAffected: result.rowsAffected,
        };
      } catch (err) {
        if (err instanceof OracleError) throw err;
        throw new OracleError('Oracle query failed', err);
      } finally {
        if (connection) {
          try {
            await connection.close();
          } catch {
            // pool will reclaim
          }
        }
      }
    },

    async close(): Promise<void> {
      try {
        await pool.close(0);
      } catch (err) {
        throw new OracleError('Failed to close Oracle connection pool', err);
      }
    },
  };
}
