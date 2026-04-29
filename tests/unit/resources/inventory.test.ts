import { describe, expect, it } from 'vitest';
import { IqmsClient } from '../../../src/client.js';
import { FakeOracleDriver } from '../../mocks/oracle.js';

describe('InventoryResource', () => {
  it('onHand applies hideZeroOnHand by default', async () => {
    const oracle = new FakeOracleDriver();
    oracle.setHandlers([
      {
        match: 'FROM inventloc l',
        rows: [
          {
            ITEM_NUMBER: 'PART-A',
            ITEM_DESCRIPTION: 'Widget',
            LOCATION: 'WH1',
            LOT_NUMBER: 'L1',
            QTY_ON_HAND: 5,
            UOM: 'EA',
          },
        ],
      },
    ]);

    const client = await IqmsClient.create(
      { oracle: { user: 'u', password: 'p', connectString: 'c' } },
      { oracleDriver: oracle },
    );

    const rows = await client.inventory.onHand({ itemNumber: 'PART-A' });
    expect(rows).toHaveLength(1);
    expect(oracle.calls[0]!.sql).toContain('l.qty_on_hand > 0');
    await client.close();
  });

  it('trace defaults to from_components direction', async () => {
    const oracle = new FakeOracleDriver();
    oracle.setHandlers([{ match: 'FROM lothist h', rows: [] }]);

    const client = await IqmsClient.create(
      { oracle: { user: 'u', password: 'p', connectString: 'c' } },
      { oracleDriver: oracle },
    );

    await client.inventory.trace({ lotNumber: 'LOT-1' });
    expect(oracle.calls[0]!.sql).toContain('PRIOR h.parent_lot = h.lot');
    await client.close();
  });
});
