import { describe, expect, it, vi } from 'vitest';
import { OracleError } from '../../src/errors.js';

// We cannot construct the real driver without the oracledb module loaded with
// a live Instant Client, but we can exercise the read-only guard by injecting
// a stub `oracledb` module via vi.mock. This catches accidental DML attempts
// before they ever reach the driver.

describe('Oracle driver read-only guard', () => {
  it('rejects non-SELECT/WITH statements before opening a connection', async () => {
    const fakeConnection = {
      callTimeout: 0,
      execute: vi.fn().mockResolvedValue({ rows: [] }),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const fakePool = {
      getConnection: vi.fn().mockResolvedValue(fakeConnection),
      close: vi.fn().mockResolvedValue(undefined),
    };

    vi.doMock('oracledb', () => ({
      default: {
        outFormat: 0,
        OUT_FORMAT_OBJECT: 4002,
        createPool: vi.fn().mockResolvedValue(fakePool),
      },
    }));

    const { createOracleDriver } = await import('../../src/drivers/oracle/index.js');

    const driver = await createOracleDriver({
      user: 'u',
      password: 'p',
      connectString: 'localhost:1521/EIQ',
    });

    await expect(
      driver.query('UPDATE workorder SET status = :s', { s: 'X' }),
    ).rejects.toBeInstanceOf(OracleError);

    expect(fakeConnection.execute).not.toHaveBeenCalled();
    await driver.close();
    vi.doUnmock('oracledb');
  });
});
