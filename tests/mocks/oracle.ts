import type { OracleDriver, OracleQueryResult } from '../../src/drivers/oracle/index.js';

export interface FakeOracleHandler {
  /** Substring or regex matched against the SQL — first match wins. */
  match: string | RegExp;
  rows: Array<Record<string, unknown>>;
}

/**
 * Test-only fake Oracle driver. Tests register handlers in the order they
 * should be matched; each `query()` call records its inputs for assertions.
 */
export class FakeOracleDriver implements OracleDriver {
  readonly calls: Array<{ sql: string; binds: Record<string, unknown> }> = [];
  private handlers: FakeOracleHandler[] = [];

  setHandlers(handlers: FakeOracleHandler[]): void {
    this.handlers = handlers;
  }

  async query<T>(
    sql: string,
    binds: Record<string, unknown> = {},
  ): Promise<OracleQueryResult<T>> {
    this.calls.push({ sql, binds });
    for (const h of this.handlers) {
      const matched =
        typeof h.match === 'string' ? sql.includes(h.match) : h.match.test(sql);
      if (matched) return { rows: h.rows as T[] };
    }
    throw new Error(`FakeOracleDriver: no handler matched SQL:\n${sql}`);
  }

  async close(): Promise<void> {
    // no-op
  }
}
