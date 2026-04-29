import type { OracleDriver } from '../drivers/oracle/index.js';
import { listScheduleSlots } from '../drivers/oracle/queries/schedule.js';
import type { CapacityParams, ScheduleSlot } from '../types/schedule.js';

export class ScheduleResource {
  constructor(
    private readonly oracle: OracleDriver,
    private readonly defaultPageSize: number,
  ) {}

  capacity(params: CapacityParams): Promise<ScheduleSlot[]> {
    return listScheduleSlots(this.oracle, params, this.defaultPageSize);
  }
}
