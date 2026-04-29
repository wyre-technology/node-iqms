/**
 * TENTATIVE — EnterpriseIQ quality / non-conformance queries.
 *
 * Primary tables:
 *   carmast      — CAR (Corrective Action Request) / NCR master
 *   qcinsp       — inspection records (referenced for future expansion)
 */

import type { OracleDriver } from '../index.js';
import type {
  NcrListParams,
  NcrStatus,
  NonConformance,
} from '../../../types/quality.js';

const STATUS_MAP: Record<string, NcrStatus> = {
  O: 'open',
  I: 'investigating',
  C: 'closed',
};
const STATUS_REVERSE: Record<NcrStatus, string> = {
  open: 'O',
  investigating: 'I',
  closed: 'C',
};

interface NcrRow {
  ID: number;
  CAR_NUMBER: string;
  ITEM_NUMBER: string | null;
  WORKORDER_ID: number | null;
  STATUS: string;
  REPORTED_DATE: Date;
  REPORTED_BY: string | null;
  DESCRIPTION: string | null;
  DISPOSITION: string | null;
}

export async function listNcrs(
  driver: OracleDriver,
  params: NcrListParams,
  defaultLimit: number,
): Promise<NonConformance[]> {
  const limit = Math.min(params.limit ?? defaultLimit, 500);
  const where: string[] = [];
  const binds: Record<string, unknown> = { lim: limit };

  if (params.status) {
    where.push('n.status = :status');
    binds.status = STATUS_REVERSE[params.status];
  }
  if (params.itemNumber) {
    where.push('n.item = :item');
    binds.item = params.itemNumber;
  }
  if (params.reportedAfter) {
    where.push('n.reported_date >= :after');
    binds.after = new Date(params.reportedAfter);
  }
  if (params.reportedBefore) {
    where.push('n.reported_date <= :before');
    binds.before = new Date(params.reportedBefore);
  }

  const sql = `
    SELECT
      n.id                AS "ID",
      n.car_number        AS "CAR_NUMBER",
      n.item              AS "ITEM_NUMBER",
      n.workorder_id      AS "WORKORDER_ID",
      n.status            AS "STATUS",
      n.reported_date     AS "REPORTED_DATE",
      n.reported_by       AS "REPORTED_BY",
      n.description       AS "DESCRIPTION",
      n.disposition       AS "DISPOSITION"
    FROM carmast n
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY n.reported_date DESC
    FETCH FIRST :lim ROWS ONLY
  `;

  const result = await driver.query<NcrRow>(sql, binds);
  return result.rows.map((r) => ({
    id: r.ID,
    number: r.CAR_NUMBER,
    itemNumber: r.ITEM_NUMBER ?? undefined,
    workOrderId: r.WORKORDER_ID ?? undefined,
    status: STATUS_MAP[r.STATUS] ?? 'open',
    reportedDate: r.REPORTED_DATE.toISOString(),
    reportedBy: r.REPORTED_BY ?? undefined,
    description: r.DESCRIPTION ?? undefined,
    disposition: r.DISPOSITION ?? undefined,
  }));
}
