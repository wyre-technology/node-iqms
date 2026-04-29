import { describe, expect, it } from 'vitest';
import { IqmsClient } from '../../../src/client.js';
import { FakeOracleDriver } from '../../mocks/oracle.js';

describe('WorkOrdersResource', () => {
  it('list maps Oracle rows to WorkOrder shape', async () => {
    const oracle = new FakeOracleDriver();
    oracle.setHandlers([
      {
        match: 'FROM workorder w',
        rows: [
          {
            ID: 1,
            WO_NUMBER: 'WO-1001',
            ITEM_NUMBER: 'PART-A',
            ITEM_DESCRIPTION: 'Widget A',
            QTY_ORDERED: 100,
            QTY_MADE: 25,
            QTY_SCRAPPED: 1,
            STATUS: 'O',
            DUE_DATE: new Date('2026-05-01T00:00:00Z'),
            START_DATE: null,
            CUSTOMER_ID: 42,
            CUSTOMER_NAME: 'Acme Co',
          },
        ],
      },
    ]);

    const client = await IqmsClient.create(
      { oracle: { user: 'u', password: 'p', connectString: 'c' } },
      { oracleDriver: oracle },
    );

    const result = await client.workorders.list({ status: 'open', limit: 10 });
    expect(result).toEqual([
      {
        id: 1,
        number: 'WO-1001',
        itemNumber: 'PART-A',
        itemDescription: 'Widget A',
        quantityOrdered: 100,
        quantityMade: 25,
        quantityScrapped: 1,
        status: 'open',
        dueDate: '2026-05-01T00:00:00.000Z',
        startDate: undefined,
        customerId: 42,
        customerName: 'Acme Co',
      },
    ]);

    expect(oracle.calls).toHaveLength(1);
    expect(oracle.calls[0]!.binds).toMatchObject({ status: 'O', lim: 10 });
    await client.close();
  });

  it('get returns null when the work order does not exist', async () => {
    const oracle = new FakeOracleDriver();
    oracle.setHandlers([{ match: 'FROM workorder w', rows: [] }]);

    const client = await IqmsClient.create(
      { oracle: { user: 'u', password: 'p', connectString: 'c' } },
      { oracleDriver: oracle },
    );

    expect(await client.workorders.get(999)).toBeNull();
    await client.close();
  });
});
