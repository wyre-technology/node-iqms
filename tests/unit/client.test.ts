import { describe, expect, it } from 'vitest';
import { IqmsClient } from '../../src/client.js';
import { DriverNotConfiguredError, NotImplementedError } from '../../src/errors.js';
import { FakeOracleDriver } from '../mocks/oracle.js';

function buildClient(overrides: Parameters<typeof IqmsClient.create>[1] = {}) {
  const oracle = new FakeOracleDriver();
  return IqmsClient.create(
    { oracle: { user: 'u', password: 'p', connectString: 'c' } },
    { oracleDriver: oracle, ...overrides },
  ).then((client) => ({ client, oracle }));
}

describe('IqmsClient', () => {
  it('exposes all resources', async () => {
    const { client } = await buildClient();
    expect(client.workorders).toBeDefined();
    expect(client.inventory).toBeDefined();
    expect(client.boms).toBeDefined();
    expect(client.salesOrders).toBeDefined();
    expect(client.purchaseOrders).toBeDefined();
    expect(client.schedule).toBeDefined();
    expect(client.quality).toBeDefined();
    await client.close();
  });

  it('throws DriverNotConfiguredError when WebAPI is missing and a write is attempted', async () => {
    const { client } = await buildClient();
    await expect(
      client.workorders.create({ itemNumber: 'X-1', quantity: 1 }),
    ).rejects.toBeInstanceOf(DriverNotConfiguredError);
    await client.close();
  });

  it('routes write calls to the WebAPI driver, which currently throws NotImplementedError', async () => {
    const oracle = new FakeOracleDriver();
    const client = await IqmsClient.create(
      {
        oracle: { user: 'u', password: 'p', connectString: 'c' },
        webapi: { baseUrl: 'http://stub', username: 'u', password: 'p' },
      },
      { oracleDriver: oracle },
    );
    await expect(
      client.workorders.create({ itemNumber: 'X-1', quantity: 1 }),
    ).rejects.toBeInstanceOf(NotImplementedError);
    await client.close();
  });
});
