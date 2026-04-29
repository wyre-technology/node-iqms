/** TENTATIVE — sourced from public EIQ schema references; validate per tenant. */

export type WorkOrderStatus = 'open' | 'in_progress' | 'complete' | 'cancelled' | 'on_hold';

export interface WorkOrder {
  id: number;
  number: string;
  itemNumber: string;
  itemDescription?: string;
  quantityOrdered: number;
  quantityMade: number;
  quantityScrapped: number;
  status: WorkOrderStatus;
  dueDate?: string;
  startDate?: string;
  customerId?: number;
  customerName?: string;
}

export interface WorkOrderListParams {
  status?: WorkOrderStatus;
  customerId?: number;
  itemNumber?: string;
  dueBefore?: string;
  dueAfter?: string;
  limit?: number;
  cursor?: string;
}

export interface WorkOrderDetail extends WorkOrder {
  routings?: WorkOrderRouting[];
  notes?: string;
}

export interface WorkOrderRouting {
  step: number;
  workCenter: string;
  setupHours?: number;
  runHours?: number;
  status?: string;
}

export interface WorkOrderCreateInput {
  itemNumber: string;
  quantity: number;
  dueDate?: string;
  customerId?: number;
  notes?: string;
}

export interface PostProductionInput {
  workOrderId: number;
  quantityMade: number;
  quantityScrapped?: number;
  scrapReasonCode?: string;
  postedAt?: string;
}
