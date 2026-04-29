/**
 * TENTATIVE — EnterpriseIQ work order queries.
 *
 * Source: public partner documentation (Ultra Consultants, TriMech,
 * Constacloud) and commonly-referenced EIQ table names. NOT validated against
 * a live tenant. Column names vary across EIQ versions (2019/2020/2024).
 *
 * Primary tables:
 *   workorder      — work order header
 *   wojobs         — job-level rows (one per routing/operation)
 *   arinvt         — item master (joined for description)
 *   arcust         — customer master (joined for name)
 */

import type { OracleDriver } from '../index.js';
import type {
  WorkOrder,
  WorkOrderDetail,
  WorkOrderListParams,
  WorkOrderRouting,
  WorkOrderStatus,
} from '../../../types/workorders.js';

const STATUS_MAP: Record<string, WorkOrderStatus> = {
  O: 'open',
  P: 'in_progress',
  C: 'complete',
  X: 'cancelled',
  H: 'on_hold',
};

const STATUS_REVERSE: Record<WorkOrderStatus, string> = {
  open: 'O',
  in_progress: 'P',
  complete: 'C',
  cancelled: 'X',
  on_hold: 'H',
};

interface WorkOrderRow {
  ID: number;
  WO_NUMBER: string;
  ITEM_NUMBER: string;
  ITEM_DESCRIPTION: string | null;
  QTY_ORDERED: number;
  QTY_MADE: number;
  QTY_SCRAPPED: number;
  STATUS: string;
  DUE_DATE: Date | null;
  START_DATE: Date | null;
  CUSTOMER_ID: number | null;
  CUSTOMER_NAME: string | null;
}

function mapRow(row: WorkOrderRow): WorkOrder {
  return {
    id: row.ID,
    number: row.WO_NUMBER,
    itemNumber: row.ITEM_NUMBER,
    itemDescription: row.ITEM_DESCRIPTION ?? undefined,
    quantityOrdered: row.QTY_ORDERED,
    quantityMade: row.QTY_MADE,
    quantityScrapped: row.QTY_SCRAPPED,
    status: STATUS_MAP[row.STATUS] ?? 'open',
    dueDate: row.DUE_DATE?.toISOString(),
    startDate: row.START_DATE?.toISOString(),
    customerId: row.CUSTOMER_ID ?? undefined,
    customerName: row.CUSTOMER_NAME ?? undefined,
  };
}

export async function listWorkOrders(
  driver: OracleDriver,
  params: WorkOrderListParams,
  defaultLimit: number,
): Promise<WorkOrder[]> {
  const limit = Math.min(params.limit ?? defaultLimit, 500);
  const where: string[] = [];
  const binds: Record<string, unknown> = { lim: limit };

  if (params.status) {
    where.push('w.status = :status');
    binds.status = STATUS_REVERSE[params.status];
  }
  if (params.customerId !== undefined) {
    where.push('w.customer = :customer');
    binds.customer = params.customerId;
  }
  if (params.itemNumber) {
    where.push('w.item = :item');
    binds.item = params.itemNumber;
  }
  if (params.dueBefore) {
    where.push('w.due_date <= :dueBefore');
    binds.dueBefore = new Date(params.dueBefore);
  }
  if (params.dueAfter) {
    where.push('w.due_date >= :dueAfter');
    binds.dueAfter = new Date(params.dueAfter);
  }

  const sql = `
    SELECT
      w.id              AS "ID",
      w.wo_number       AS "WO_NUMBER",
      w.item            AS "ITEM_NUMBER",
      i.description     AS "ITEM_DESCRIPTION",
      w.qty_ordered     AS "QTY_ORDERED",
      w.qty_made        AS "QTY_MADE",
      w.qty_scrapped    AS "QTY_SCRAPPED",
      w.status          AS "STATUS",
      w.due_date        AS "DUE_DATE",
      w.start_date      AS "START_DATE",
      w.customer        AS "CUSTOMER_ID",
      c.customer_name   AS "CUSTOMER_NAME"
    FROM workorder w
    LEFT JOIN arinvt i ON i.item = w.item
    LEFT JOIN arcust c ON c.id = w.customer
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY w.due_date NULLS LAST, w.id DESC
    FETCH FIRST :lim ROWS ONLY
  `;

  const result = await driver.query<WorkOrderRow>(sql, binds);
  return result.rows.map(mapRow);
}

export async function getWorkOrder(
  driver: OracleDriver,
  id: number,
): Promise<WorkOrderDetail | null> {
  const headerSql = `
    SELECT
      w.id              AS "ID",
      w.wo_number       AS "WO_NUMBER",
      w.item            AS "ITEM_NUMBER",
      i.description     AS "ITEM_DESCRIPTION",
      w.qty_ordered     AS "QTY_ORDERED",
      w.qty_made        AS "QTY_MADE",
      w.qty_scrapped    AS "QTY_SCRAPPED",
      w.status          AS "STATUS",
      w.due_date        AS "DUE_DATE",
      w.start_date      AS "START_DATE",
      w.customer        AS "CUSTOMER_ID",
      c.customer_name   AS "CUSTOMER_NAME",
      w.notes           AS "NOTES"
    FROM workorder w
    LEFT JOIN arinvt i ON i.item = w.item
    LEFT JOIN arcust c ON c.id = w.customer
    WHERE w.id = :id
  `;

  const header = await driver.query<WorkOrderRow & { NOTES: string | null }>(headerSql, { id });
  if (header.rows.length === 0) return null;

  const routingsSql = `
    SELECT
      j.step_number     AS "STEP",
      j.work_center     AS "WORK_CENTER",
      j.setup_hours     AS "SETUP_HOURS",
      j.run_hours       AS "RUN_HOURS",
      j.status          AS "STATUS"
    FROM wojobs j
    WHERE j.workorder_id = :id
    ORDER BY j.step_number
  `;
  const routings = await driver.query<{
    STEP: number;
    WORK_CENTER: string;
    SETUP_HOURS: number | null;
    RUN_HOURS: number | null;
    STATUS: string | null;
  }>(routingsSql, { id });

  const headerRow = header.rows[0]!;
  const detail: WorkOrderDetail = {
    ...mapRow(headerRow),
    notes: headerRow.NOTES ?? undefined,
    routings: routings.rows.map<WorkOrderRouting>((r) => ({
      step: r.STEP,
      workCenter: r.WORK_CENTER,
      setupHours: r.SETUP_HOURS ?? undefined,
      runHours: r.RUN_HOURS ?? undefined,
      status: r.STATUS ?? undefined,
    })),
  };
  return detail;
}
