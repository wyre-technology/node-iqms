/**
 * TENTATIVE — EnterpriseIQ sales order queries.
 *
 * Primary tables:
 *   arorder      — sales order header
 *   arorderd     — sales order detail lines (not currently joined; available for future)
 *   arcust       — customer master
 */

import type { OracleDriver } from '../index.js';
import type {
  SalesOrder,
  SalesOrderListParams,
  SalesOrderStatus,
} from '../../../types/sales-orders.js';

const STATUS_MAP: Record<string, SalesOrderStatus> = {
  O: 'open',
  P: 'partial',
  S: 'shipped',
  X: 'cancelled',
};
const STATUS_REVERSE: Record<SalesOrderStatus, string> = {
  open: 'O',
  partial: 'P',
  shipped: 'S',
  cancelled: 'X',
};

interface SalesOrderRow {
  ID: number;
  ORDER_NUMBER: string;
  CUSTOMER_ID: number;
  CUSTOMER_NAME: string | null;
  ORDER_DATE: Date;
  REQ_SHIP_DATE: Date | null;
  STATUS: string;
  TOTAL_AMOUNT: number | null;
}

export async function listSalesOrders(
  driver: OracleDriver,
  params: SalesOrderListParams,
  defaultLimit: number,
): Promise<SalesOrder[]> {
  const limit = Math.min(params.limit ?? defaultLimit, 500);
  const where: string[] = [];
  const binds: Record<string, unknown> = { lim: limit };

  if (params.status) {
    where.push('o.status = :status');
    binds.status = STATUS_REVERSE[params.status];
  }
  if (params.customerId !== undefined) {
    where.push('o.customer = :customer');
    binds.customer = params.customerId;
  }
  if (params.shipBefore) {
    where.push('o.requested_ship_date <= :shipBefore');
    binds.shipBefore = new Date(params.shipBefore);
  }
  if (params.shipAfter) {
    where.push('o.requested_ship_date >= :shipAfter');
    binds.shipAfter = new Date(params.shipAfter);
  }

  const sql = `
    SELECT
      o.id                    AS "ID",
      o.order_number          AS "ORDER_NUMBER",
      o.customer              AS "CUSTOMER_ID",
      c.customer_name         AS "CUSTOMER_NAME",
      o.order_date            AS "ORDER_DATE",
      o.requested_ship_date   AS "REQ_SHIP_DATE",
      o.status                AS "STATUS",
      o.total_amount          AS "TOTAL_AMOUNT"
    FROM arorder o
    LEFT JOIN arcust c ON c.id = o.customer
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY o.requested_ship_date NULLS LAST, o.id DESC
    FETCH FIRST :lim ROWS ONLY
  `;

  const result = await driver.query<SalesOrderRow>(sql, binds);
  return result.rows.map((r) => ({
    id: r.ID,
    number: r.ORDER_NUMBER,
    customerId: r.CUSTOMER_ID,
    customerName: r.CUSTOMER_NAME ?? undefined,
    orderDate: r.ORDER_DATE.toISOString(),
    requestedShipDate: r.REQ_SHIP_DATE?.toISOString(),
    status: STATUS_MAP[r.STATUS] ?? 'open',
    totalAmount: r.TOTAL_AMOUNT ?? undefined,
  }));
}
