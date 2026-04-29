/** TENTATIVE — sourced from public EIQ schema references; validate per tenant. */

export interface ScheduleSlot {
  workCenter: string;
  workOrderId: number;
  workOrderNumber: string;
  itemNumber: string;
  scheduledStart: string;
  scheduledEnd: string;
  setupHours?: number;
  runHours?: number;
}

export interface CapacityParams {
  workCenter?: string;
  startDate: string;
  endDate: string;
  limit?: number;
}
