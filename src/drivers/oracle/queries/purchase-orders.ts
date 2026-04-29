/**
 * TENTATIVE — EnterpriseIQ purchase order queries.
 *
 * Primary tables:
 *   apsuplpo     — PO header
 *   apsuplpod    — PO detail lines (not currently joined; available for future)
 *   apsupl       — supplier master
 */

import type { OracleDriver } from '../index.js';
import type {
  PurchaseOrder,
  PurchaseOrderListParams,
  PurchaseOrderStatus,
} from '../../../types/purchase-orders.js';

const STATUS_MAP: Record<string, PurchaseOrderStatus> = {
  O: 'open',
  P: 'partial',
  R: 'received',
  X: 'cancelled',
};
const STATUS_REVERSE: Record<PurchaseOrderStatus, string> = {
  open: 'O',
  partial: 'P',
  received: 'R',
  cancelled: 'X',
};

interface PoRow {
  ID: number;
  PO_NUMBER: string;
  SUPPLIER_ID: number;
  SUPPLIER_NAME: string | null;
  ORDER_DATE: Date;
  EXPECTED_RECEIPT: Date | null;
  STATUS: string;
  TOTAL_AMOUNT: number | null;
}

export async function listPurchaseOrders(
  driver: OracleDriver,
  params: PurchaseOrderListParams,
  defaultLimit: number,
): Promise<PurchaseOrder[]> {
  const limit = Math.min(params.limit ?? defaultLimit, 500);
  const where: string[] = [];
  const binds: Record<string, unknown> = { lim: limit };

  if (params.status) {
    where.push('p.status = :status');
    binds.status = STATUS_REVERSE[params.status];
  }
  if (params.supplierId !== undefined) {
    where.push('p.supplier = :supplier');
    binds.supplier = params.supplierId;
  }
  if (params.expectedBefore) {
    where.push('p.expected_receipt_date <= :before');
    binds.before = new Date(params.expectedBefore);
  }
  if (params.expectedAfter) {
    where.push('p.expected_receipt_date >= :after');
    binds.after = new Date(params.expectedAfter);
  }

  const sql = `
    SELECT
      p.id                       AS "ID",
      p.po_number                AS "PO_NUMBER",
      p.supplier                 AS "SUPPLIER_ID",
      s.supplier_name            AS "SUPPLIER_NAME",
      p.order_date               AS "ORDER_DATE",
      p.expected_receipt_date    AS "EXPECTED_RECEIPT",
      p.status                   AS "STATUS",
      p.total_amount             AS "TOTAL_AMOUNT"
    FROM apsuplpo p
    LEFT JOIN apsupl s ON s.id = p.supplier
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY p.expected_receipt_date NULLS LAST, p.id DESC
    FETCH FIRST :lim ROWS ONLY
  `;

  const result = await driver.query<PoRow>(sql, binds);
  return result.rows.map((r) => ({
    id: r.ID,
    number: r.PO_NUMBER,
    supplierId: r.SUPPLIER_ID,
    supplierName: r.SUPPLIER_NAME ?? undefined,
    orderDate: r.ORDER_DATE.toISOString(),
    expectedReceiptDate: r.EXPECTED_RECEIPT?.toISOString(),
    status: STATUS_MAP[r.STATUS] ?? 'open',
    totalAmount: r.TOTAL_AMOUNT ?? undefined,
  }));
}
