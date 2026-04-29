/**
 * TENTATIVE — EnterpriseIQ inventory queries.
 *
 * Primary tables:
 *   arinvt        — item master
 *   inventloc     — on-hand by location
 *   lotmast       — lot master
 *   lothist       — lot transaction history (used for genealogy walks)
 */

import type { OracleDriver } from '../index.js';
import type {
  InventoryOnHand,
  InventoryOnHandParams,
  LotTraceNode,
  LotTraceParams,
} from '../../../types/inventory.js';

interface OnHandRow {
  ITEM_NUMBER: string;
  ITEM_DESCRIPTION: string | null;
  LOCATION: string;
  LOT_NUMBER: string | null;
  QTY_ON_HAND: number;
  UOM: string;
}

export async function listOnHand(
  driver: OracleDriver,
  params: InventoryOnHandParams,
  defaultLimit: number,
): Promise<InventoryOnHand[]> {
  const limit = Math.min(params.limit ?? defaultLimit, 500);
  const where: string[] = [];
  const binds: Record<string, unknown> = { lim: limit };

  if (params.itemNumber) {
    where.push('l.item = :item');
    binds.item = params.itemNumber;
  }
  if (params.location) {
    where.push('l.location = :loc');
    binds.loc = params.location;
  }
  if (params.lotNumber) {
    where.push('l.lot = :lot');
    binds.lot = params.lotNumber;
  }
  if (params.hideZeroOnHand !== false) {
    where.push('l.qty_on_hand > 0');
  }

  const sql = `
    SELECT
      l.item              AS "ITEM_NUMBER",
      i.description       AS "ITEM_DESCRIPTION",
      l.location          AS "LOCATION",
      l.lot               AS "LOT_NUMBER",
      l.qty_on_hand       AS "QTY_ON_HAND",
      i.uom               AS "UOM"
    FROM inventloc l
    LEFT JOIN arinvt i ON i.item = l.item
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY l.item, l.location
    FETCH FIRST :lim ROWS ONLY
  `;

  const result = await driver.query<OnHandRow>(sql, binds);
  return result.rows.map((r) => ({
    itemNumber: r.ITEM_NUMBER,
    itemDescription: r.ITEM_DESCRIPTION ?? undefined,
    location: r.LOCATION,
    lotNumber: r.LOT_NUMBER ?? undefined,
    quantityOnHand: r.QTY_ON_HAND,
    uom: r.UOM,
  }));
}

interface LotTraceRow {
  LOT_NUMBER: string;
  ITEM_NUMBER: string;
  QUANTITY: number;
  UOM: string;
  PARENT_LOT: string | null;
  WORKORDER_ID: number | null;
}

/**
 * Recursive lot genealogy walk via Oracle's CONNECT BY. Direction:
 * - `where_produced` walks consumption forward (lot → work orders → output lots)
 * - `from_components` walks back (lot → input components)
 */
export async function traceLot(
  driver: OracleDriver,
  params: LotTraceParams,
): Promise<LotTraceNode[]> {
  const direction = params.direction ?? 'from_components';
  const sql =
    direction === 'from_components'
      ? `
        SELECT
          h.lot              AS "LOT_NUMBER",
          h.item             AS "ITEM_NUMBER",
          h.quantity         AS "QUANTITY",
          h.uom              AS "UOM",
          h.parent_lot       AS "PARENT_LOT",
          h.workorder_id     AS "WORKORDER_ID"
        FROM lothist h
        START WITH h.lot = :lot
        CONNECT BY PRIOR h.parent_lot = h.lot
      `
      : `
        SELECT
          h.lot              AS "LOT_NUMBER",
          h.item             AS "ITEM_NUMBER",
          h.quantity         AS "QUANTITY",
          h.uom              AS "UOM",
          h.parent_lot       AS "PARENT_LOT",
          h.workorder_id     AS "WORKORDER_ID"
        FROM lothist h
        START WITH h.parent_lot = :lot
        CONNECT BY PRIOR h.lot = h.parent_lot
      `;

  const result = await driver.query<LotTraceRow>(sql, { lot: params.lotNumber });
  return result.rows.map((r) => ({
    lotNumber: r.LOT_NUMBER,
    itemNumber: r.ITEM_NUMBER,
    quantity: r.QUANTITY,
    uom: r.UOM,
    parentLotNumber: r.PARENT_LOT ?? undefined,
    workOrderId: r.WORKORDER_ID ?? undefined,
  }));
}
