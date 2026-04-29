/**
 * TENTATIVE — EnterpriseIQ scheduling queries.
 *
 * Primary tables:
 *   schedule       — scheduled slots per work center
 *   workorder      — joined for WO number
 *   arinvt         — joined for item description (not exposed yet)
 */

import type { OracleDriver } from '../index.js';
import type { CapacityParams, ScheduleSlot } from '../../../types/schedule.js';

interface ScheduleRow {
  WORK_CENTER: string;
  WORKORDER_ID: number;
  WO_NUMBER: string;
  ITEM_NUMBER: string;
  SCHEDULED_START: Date;
  SCHEDULED_END: Date;
  SETUP_HOURS: number | null;
  RUN_HOURS: number | null;
}

export async function listScheduleSlots(
  driver: OracleDriver,
  params: CapacityParams,
  defaultLimit: number,
): Promise<ScheduleSlot[]> {
  const limit = Math.min(params.limit ?? defaultLimit, 1000);
  const where: string[] = [
    's.scheduled_start >= :start',
    's.scheduled_end   <= :endDate',
  ];
  const binds: Record<string, unknown> = {
    start: new Date(params.startDate),
    endDate: new Date(params.endDate),
    lim: limit,
  };
  if (params.workCenter) {
    where.push('s.work_center = :wc');
    binds.wc = params.workCenter;
  }

  const sql = `
    SELECT
      s.work_center        AS "WORK_CENTER",
      s.workorder_id       AS "WORKORDER_ID",
      w.wo_number          AS "WO_NUMBER",
      w.item               AS "ITEM_NUMBER",
      s.scheduled_start    AS "SCHEDULED_START",
      s.scheduled_end      AS "SCHEDULED_END",
      s.setup_hours        AS "SETUP_HOURS",
      s.run_hours          AS "RUN_HOURS"
    FROM schedule s
    LEFT JOIN workorder w ON w.id = s.workorder_id
    WHERE ${where.join(' AND ')}
    ORDER BY s.work_center, s.scheduled_start
    FETCH FIRST :lim ROWS ONLY
  `;

  const result = await driver.query<ScheduleRow>(sql, binds);
  return result.rows.map((r) => ({
    workCenter: r.WORK_CENTER,
    workOrderId: r.WORKORDER_ID,
    workOrderNumber: r.WO_NUMBER,
    itemNumber: r.ITEM_NUMBER,
    scheduledStart: r.SCHEDULED_START.toISOString(),
    scheduledEnd: r.SCHEDULED_END.toISOString(),
    setupHours: r.SETUP_HOURS ?? undefined,
    runHours: r.RUN_HOURS ?? undefined,
  }));
}
